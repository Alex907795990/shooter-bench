# Domain 元规则

**Domain 不是新形态**，而是**组织形态实例的容器**。本文档规定如何把形态组织成领域、领域之间如何通信。

## 1. 什么是领域

领域 = 围绕一个内聚业务关心点的**所有形态实例的集合**。例如「战斗」是一个领域，包含：
- `Combat/Data/`：战斗相关的 Command、Event、State 切片定义
- `Combat/Resolver/`：战斗规则
- `Combat/Applier/`：把战斗 Event 写进 state
- `Combat/Dispatcher/`：派发战斗相关的 io（音效、震屏）
- `Combat/Pipeline/`：领域两段式入口（见下）
- 必要时还有 `Combat/Pure/` `Combat/Query/`

**反例**：不要把"所有 Resolver"放在 `src/Resolver/`——这会让 Resolver 目录变成跨业务的上帝目录，违背本方法论的初衷。

## 2. 领域识别原则

什么算「一个领域」？候选标准（按优先级）：

1. **它有自己独立的一组 Command**（玩家通过它能下达什么指令？）
2. **它有自己独立的一组 Event**（它会改变什么状态？产出什么外部反应？）
3. **它的状态切片基本只被它自己读写**
4. **它可以单独删除而不影响游戏的其他玩法**

如果你正在写的代码满足上述≥2条，且不属于任何已有领域 → **停下询问**用户应该新建领域还是归入已有领域。

## 3. 跨领域规则（B 方案：1 帧延迟）

### 3.1 import 规则

- 领域 X 的任何形态**可以** import 领域 Y 的 `Data/*`（消费 Y 的 Event/Command 类型）
- 领域 X 的任何形态**不能** import 领域 Y 的其他形态（Resolver/Applier/Pipeline/Dispatcher/Query/Pure）
- 任何领域**可以** import `_Shared/*`（任意形态）
- `_Shared/` **不能** import 任何领域（共享层不能依赖业务）

### 3.2 跨领域依赖必须是 DAG

如果领域 X 的某形态 import 了 Y 的 Data，称「X 依赖 Y」。所有跨领域依赖构成的图必须无环。

出现环时的处理：
- **合并**：两个领域耦合太深，本来就该是一个领域
- **下沉**：把双方都依赖的部分抽取到一个更基础的子领域（如 `CombatCore`）
- **绝不**：通过任何技巧绕过（如增加一层抽象、动态查找）让循环不可见

### 3.3 跨领域反馈：1 帧延迟

下游领域产生的 Event 想影响上游领域，**等下一帧**：

```
Frame N:
  combatPipeline 产生 'enemyDied' Event
  questPanelPipeline 消费 'enemyDied'，更新任务进度
  questPanelPipeline 的 Applier 写入 state.questCompleted = true

Frame N+1:
  combatPipeline 的 Resolver 读 state.questCompleted，看到任务完成
  → 决定不再生成战斗 Command（或产生胜利 Event）
```

这是**有意识的取舍**：
- 优点：每帧执行顺序完全确定；不会死循环；性能稳定
- 代价：跨领域反馈链每段 1 帧延迟。60fps 下 16ms，绝大多数游戏交互可接受

如果某反馈链对延迟敏感（如「按下立即生效」），处理原则：
- 优先尝试**让该链路落在同一领域内**（领域内同帧反馈无延迟）
- 如果跨领域不可避免 → **接受延迟**，调整玩法或视觉反馈来掩盖
- **不**引入"同帧多 pass"机制——这违反方法论原则

## 4. 领域 Pipeline 两段式

每个领域对外**仅暴露两个 Pipeline 入口**：

```ts
// src/Combat/Pipeline/CombatPipeline.ts

import { World } from '../../_Shared/Data/World';
import { InputCommand } from '../../_Shared/Data/InputCommand';
import { CombatEvent } from '../Data/CombatEvents';
import { MovementEvent } from '../../Movement/Data/MovementEvents';
import { resolveCombatResolver } from '../Resolver/CombatResolver';
import { applyCombatApplier } from '../Applier/CombatApplier';
import { dispatchCombatDispatcher } from '../Dispatcher/CombatDispatcher';

// 第一段：Resolve + Apply，返回本领域产生的 Event 列表
export function combatResolveApplyPipeline(
  state: World,
  inputCmds: readonly InputCommand[],
  upstreamMovementEvents: readonly MovementEvent[],
): readonly CombatEvent[] {
  const events = resolveCombatResolver(state, inputCmds, upstreamMovementEvents);
  applyCombatApplier(state, events);
  return events;
}

// 第二段：Dispatch
export function combatDispatchPipeline(events: readonly CombatEvent[]): void {
  dispatchCombatDispatcher(events);
}
```

为什么两段式：
- **同帧跨领域 Event 流动需要**：第一段返回 Event，`_Frame` 把它传给下游领域的第一段，下游当帧消费
- **Dispatch 必须最后做**：只有所有领域都改完 state 后，再统一 dispatch；避免「dispatch 时其他领域还没改 state」的不一致

为什么不三段式（resolve / apply / dispatch 各一个）：
- Resolver 与 Applier 总是紧密绑定执行（产 Event 后必然紧跟应用，否则下一个领域读 state 看到的是旧的）
- 拆开会让 `_Frame` 啰嗦且更容易写错顺序

## 5. `_Frame/FramePipeline`

顶层主循环。它本身是 Pipeline 形态，但有特殊职责：**显式编排所有领域 + 跨领域 Event 搬运**。

```ts
// src/_Frame/FramePipeline.ts
export function framePipeline(state: World): void {
  // 1. 共享 Collector
  const inputCmds = collectInputCollector();
  const tick      = collectTimeCollector();

  // 2. 各领域第一段，按 DAG 顺序
  const movementEvents = movementResolveApplyPipeline(state, inputCmds, tick);
  const combatEvents   = combatResolveApplyPipeline(state, inputCmds, movementEvents);
  const questEvents    = questPanelResolveApplyPipeline(state, inputCmds, combatEvents);

  // 3. 各领域第二段
  movementDispatchPipeline(movementEvents);
  combatDispatchPipeline(combatEvents);
  questPanelDispatchPipeline(questEvents);
}
```

`_Frame/FramePipeline.ts` 是**整个游戏唯一的"上帝视角"**——但它仍然是 Pipeline 形态（只调用、不计算、无条件分支），所以它的"上帝性"被严格限制为编排，无法夹带业务。

## 6. `_Shared/` 规则

`_Shared/` 是领域无关的共享层。**只允许**包含：
- `_Shared/Data/`：跨领域共享的基础数据类型（如 `Vec2`、`PlayerId`、整体 `World` 类型）
- `_Shared/Pure/`：纯工具函数（如数学库）
- `_Shared/Adapter/`：底层 io 适配器（渲染、音频、网络、磁盘）
- `_Shared/Collector/`：唯一的 frame 来源（输入、时间、RNG）

**禁止**：
- `_Shared/Resolver/` / `_Shared/Applier/` / `_Shared/Dispatcher/` / `_Shared/Pipeline/` / `_Shared/Query/`
- 任何含业务理解的代码

理由：业务理解必须归属一个领域。如果某段业务逻辑确实"领域无关"，那它要么是真正的工具（应在 `_Shared/Pure/`），要么意味着你识别领域的方式有问题。

## 7. 领域识别决策树

```
我要写的代码是否属于某个已有领域 X 的关心点（基于 X 的现有 Command/Event/State）？
  ├─ 是 → 放进 X 领域
  └─ 否
      └─ 是否属于"领域无关的工具/数据/底层 io/帧来源"？
          ├─ 是 → 放进 _Shared
          └─ 否
              └─ 是否属于"顶层编排"？
                  ├─ 是 → 放进 _Frame
                  └─ 否
                      └─ 应该新建领域吗？→ **停下询问用户**
```

## 8. 常见误用

**误用 1：把领域无关的 Resolver 放进 `_Shared/`**
```
// 错
_Shared/Resolver/UtilResolver.ts
```
**改法**：Resolver 必含业务理解，必属于某个领域。如果该 Resolver 真的与所有业务无关，重新审视——它可能其实是 Pure。

**误用 2：跨领域直接调用 Resolver/Applier**
```ts
// 错
// src/QuestPanel/Resolver/QuestResolver.ts
import { resolveCombatResolver } from '../../Combat/Resolver/CombatResolver';
```
**改法**：跨领域只能消费对方的 Data（Event 类型）。`QuestResolver` 接收 `CombatEvent[]` 作为参数，由 `_Frame/FramePipeline` 在调用时传入。

**误用 3：通过 state 字段绕过 DAG**
```ts
// 错（看起来无 import，但本质上 QuestPanel 仍依赖 Combat）
// CombatApplier 写 state.lastEnemyDeaths
// QuestResolver 读 state.lastEnemyDeaths
```
**改法**：这种"跨领域信号"必须显式走 Event。`CombatPipeline` 第一段返回 Event，`_Frame` 传给 `QuestPanelPipeline`。

但**反向（下游→上游）**就只能用 state 中转了——这是 1 帧延迟方案的本质。例如 `QuestPanel` 完成任务想让 `Combat` 进入"胜利模式"，由 `QuestApplier` 写 `state.victoryMode = true`，下一帧 `CombatResolver` 读到。这种字段不算误用，但要在 state 上明确注释「这是跨领域信号字段」。

**误用 4：试图在 FramePipeline 里做"循环到收敛"**
```ts
// 错
while (hasNewEvents) {
  for (const domain of domains) ...
}
```
**改法**：方法论显式禁止多 pass。如果某反馈链感觉延迟太大，重新审视领域划分（合并？下沉？），不要绕过规则。

**误用 5：领域之间形成循环依赖**
```
Combat/Data/CombatEvent.ts        imports  QuestPanel/Data/QuestId
QuestPanel/Resolver/QuestResolver imports  Combat/Data/CombatEvent
→ Combat ↔ QuestPanel
```
**改法**：把双方共用的部分（如 `QuestId`）下沉到 `_Shared/Data/`，或合并两个领域。
