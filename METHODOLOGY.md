# Form-Based 编程方法论

## 1. 目的

当前 AI 辅助编程效率高，但存在三个问题：

1. 没有固定方法论，只以完成功能为首要目的
2. 因此容易写出坏味道代码
3. 因此人类难以跟踪代码发展，无法有效质量控制

本方法论用「**形态**(Form)」对代码进行有限分类，并将代码组织为**领域**(Domain)的集合。每种形态有明确的能做与不能做的事。划分依据是**客观、机械可判定**的副作用类别，与业务无关。

## 2. 核心规则

1. 每个模块（=文件/类）属于**且仅属于**一种形态
2. 每个模块属于**且仅属于**一个领域
3. 每种形态有：**允许的原子能力集合** + **结构性约束** + **可调用形态白名单**
4. 写任何代码前，先识别领域，再识别形态，再按该形态约束编写
5. 遇到无法归入任何已定义形态/领域的情况：**停下询问**，不发明新形态，不越界

第 5 条是兜底机制。本方法论允许在某些方面做不到最好，只要求容易遵守、不模糊。

## 3. 项目结构

```
src/
  Combat/                          ← 业务领域（举例）
    Data/        CombatEvents.ts, AttackCommand.ts
    Pure/        DamagePure.ts
    Query/       CombatQuery.ts
    Resolver/    CombatResolver.ts
    Applier/     CombatApplier.ts
    Dispatcher/  CombatDispatcher.ts
    Pipeline/    CombatPipeline.ts          ← 领域两段式入口
  Movement/      ...同上结构
  QuestPanel/    ...
  Shooting/      ...
  _Shared/                         ← 领域无关共享层
    Data/        Vec2.ts, PlayerId.ts, World.ts
    Pure/        MathPure.ts
    Adapter/     SoundAdapter.ts, RenderAdapter.ts
    Collector/   InputCollector.ts, TimeCollector.ts
  _Frame/                          ← 顶层主循环
    FramePipeline.ts               ← 编排所有领域 + 跨领域 Event 搬运
```

详见 [forms/Domain.md](forms/Domain.md)。

## 4. 原子能力（6 个）

函数级副作用类别，由函数体客观决定。

| 能力 | 含义 |
|---|---|
| `pure` | 纯计算，无任何外部读写 |
| `read-config` | 读取不变数据（配置表、常量） |
| `read-state` | 读取可变的游戏状态 |
| `write-state` | 写入游戏状态 |
| `read-frame` | 读取每帧/每次都不同的来源（输入、时间、RNG、网络包） |
| `io` | 与外部世界交互（渲染、音频、网络发送、磁盘） |

## 5. 模块形态（9 个）

| 形态 | 允许能力 | 角色 |
|---|---|---|
| **Data** | — | 数据容器（Command / Event / State / Config）|
| **Pure** | pure | 纯工具函数 |
| **Query** | pure + read-config + read-state | 只查不改，返回数据 |
| **Collector** | read-frame | 把外部输入收集为 Command |
| **Resolver** | pure + read-config + read-state | 输入 (State, Command, 上游 Event)，输出 Event |
| **Applier** | write-state | 把 Event 写进 State |
| **Adapter** | pure + io | 对接外部系统（渲染/音频/网络/磁盘） |
| **Dispatcher** | pure（调用 Adapter） | 把 Event 派发给 Adapter |
| **Pipeline** | 无 | 按顺序调用其他形态 |

详细规则见 `forms/<Form>.md`。

## 6. 主循环

每帧 = `_Frame/FramePipeline.ts` 的一次执行，固定结构：

```ts
function framePipeline(state: World): void {
  // 1. 共享 Collector
  const inputCmds = collectInputCollector();
  const tick      = collectTimeCollector();

  // 2. 各领域第一段（Resolve+Apply），按 DAG 顺序，下游接收上游 Event
  const movementEvents = movementResolveApplyPipeline(state, inputCmds, tick);
  const combatEvents   = combatResolveApplyPipeline(state, inputCmds, movementEvents);
  const questEvents    = questPanelResolveApplyPipeline(state, inputCmds, combatEvents);

  // 3. 各领域第二段（Dispatch）
  movementDispatchPipeline(movementEvents);
  combatDispatchPipeline(combatEvents);
  questPanelDispatchPipeline(questEvents);
}
```

**跨领域反馈接受 1 帧延迟**：上游领域产生的 Event 当帧被下游消费；下游产生的 Event 反过来要影响上游时，等下一帧（通过 state 中转或下一帧的 Command）。这是有意识的取舍——换来执行顺序完全可预测、不会死循环、性能稳定。

## 7. 调用方向（邻接表）

| 形态 | 可调用 |
|---|---|
| Pipeline | Collector, Resolver, Applier, Dispatcher, Pure, Query, Pipeline, Data |
| Resolver | Pure, Query, Data |
| Applier | Pure, Data |
| Dispatcher | Adapter, Pure, Data |
| Collector | Pure, Data |
| Adapter | Adapter, Pure, Data |
| Query | Pure, Query, Data |
| Pure | Pure, Data |
| Data | — |

注：Data 隐含对所有形态可用（仅作类型/参数）；Query 调用 Query 用于查询组合；Adapter 调用 Adapter 用于复合；Pipeline 调用 Pipeline 仅用于子 Pipeline 嵌套（**禁止条件性嵌套**，见 Pipeline 文档）。

不变量：
- Applier 只调用 Pure/Data → 写状态过程不触发新副作用链
- Dispatcher 只调用 Adapter → 不会反向改 state
- Collector 只调用 Pure/Data → 输入数据不被状态污染
- Resolver 不能调用 Applier → 数据流方向锁死

## 8. 跨领域规则（B 方案）

1. **跨领域只能 import Data**：领域 X 的任何形态可以 import 领域 Y 的 `Data/*`（消费 Y 产生的 Event 或 Command 类型），**不能** import Y 的其他形态。
2. **跨领域依赖必须是 DAG**：禁止 X→Y→X 的循环 import。出现循环时必须重构（合并领域 / 提取更基础的子领域）。
3. **跨领域反馈通过 1 帧延迟解决**：下游领域要影响上游领域，下游产生 Event 写进 state（由下游 Applier 完成），上游下一帧的 Resolver 读取 state 时拿到。
4. **领域内自由**：领域内部按形态邻接表自由调用。

详见 [forms/Domain.md](forms/Domain.md)。

## 9. 目录与命名约定

- 领域 = `src/<DomainName>/` 目录（PascalCase，如 `Combat`）
- 共享层 = `src/_Shared/`（带下划线前缀，明确"非领域"）
- 主循环 = `src/_Frame/`
- 领域内按形态分子目录：`<Domain>/<Form>/`
- 文件名带形态后缀（Data 除外）：`*Resolver.ts` / `*Applier.ts` / ...

人类一眼看到路径就知道「哪个领域 + 哪个形态」，AI 也据此加载对应 `forms/<Form>.md` 与 `forms/Domain.md`。

## 10. 形态识别决策树

写代码前用此树定位形态（领域识别见 [Domain.md](forms/Domain.md)）：

```
本次改动主要是定义数据结构？
  └─ 是 → Data

要写一个函数，它会写 state 吗？
  ├─ 是
  │   └─ 函数体是不是按 event-type 分支直接改字段？
  │       ├─ 是 → Applier
  │       └─ 否 → 拆：先 Resolver(产 Event) + 再 Applier(应用 Event)
  │
  └─ 否
      └─ 它会触发 io 吗？
          ├─ 是
          │   └─ 它需要读 state 吗？
          │       ├─ 是 → 拆：Resolver 算出 Event → Dispatcher 派给 Adapter
          │       └─ 否 → Adapter
          │
          └─ 否
              └─ 它会读输入/时间/RNG/网络包吗？
                  ├─ 是 → Collector
                  └─ 否
                      └─ 它读 state/config 吗?
                          ├─ 是 → Query
                          └─ 否 → Pure

要写一段编排多个形态的入口（如领域两段式入口、每帧主循环、场景启动）？
  └─ 是 → Pipeline
```

如果走完这棵树仍无法归类 → **停下询问**。

## 11. 形态文档索引

- [Domain](forms/Domain.md) ← **领域组织规则**
- [Data](forms/Data.md)
- [Pure](forms/Pure.md)
- [Query](forms/Query.md)
- [Collector](forms/Collector.md)
- [Resolver](forms/Resolver.md)
- [Applier](forms/Applier.md)
- [Adapter](forms/Adapter.md)
- [Dispatcher](forms/Dispatcher.md)
- [Pipeline](forms/Pipeline.md)
