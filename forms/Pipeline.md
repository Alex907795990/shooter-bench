# Pipeline 形态

## 定义

Pipeline 是**编排层**：按固定顺序调用其他形态，把数据从一个形态喂给下一个。Pipeline 自身**没有任何能力**，函数体只能是「调用 + 把返回值传给下一个调用」。

Pipeline 有两个典型角色：
- **领域 Pipeline**（`<Domain>/Pipeline/<Domain>Pipeline.ts`）：领域两段式入口（见 [Domain.md](Domain.md)）
- **顶层 FramePipeline**（`_Frame/FramePipeline.ts`）：唯一的"上帝视角"，编排所有领域

## 允许能力

无（自身无副作用，所有副作用都由它调用的下层形态产生）。

## 禁止事项

- 不能 read-state / write-state / read-config / read-frame / io
- 函数体**不允许**：
  - `if` / `else` / `switch`（无任何例外，条件判断必须下沉到 Resolver）
  - `while`（不允许循环到收敛——见 Domain.md 关于 1 帧延迟的说明）
  - 任何算术、字符串、对象构造（Pipeline 不创造数据，只搬运）
  - 直接写 io 调用或读外部数据（必须通过调用其他形态间接产生）
- 允许的函数体结构**仅限**：
  - 顺序调用其他形态：`const x = formA(); const y = formB(x);`
  - 把上一个调用的返回值传给下一个调用
  - 顶层 `for (const item of list) subPipeline(item)`（用于"对每个 X 跑一次相同子 Pipeline"，循环体内不允许条件分支）

## 可调用形态

- Collector
- Resolver
- Applier
- Dispatcher
- Pure（用于无状态的轻量工具，如 Event 列表合并）
- Query（少数情况下 Pipeline 需要查询 state 来传给下一步——尽量避免，能放进 Resolver/Collector 就放进去）
- Data（作为类型）
- 其他 Pipeline（子 Pipeline / 领域 Pipeline）

## 领域 Pipeline 模板（两段式）

每个领域**必须暴露且仅暴露两个 Pipeline 入口**：

```ts
// src/Combat/Pipeline/CombatPipeline.ts

// 第一段：Resolve + Apply，返回本领域产生的 Event 列表
export function combatResolveApplyPipeline(
  state: World,
  inputCmds: readonly InputCommand[],
  ...upstreamEvents: readonly GameEvent[][]   // 来自上游领域的 Event 列表
): readonly CombatEvent[] {
  const events = resolveCombatResolver(state, inputCmds, ...upstreamEvents);
  applyCombatApplier(state, events);
  return events;
}

// 第二段：Dispatch
export function combatDispatchPipeline(events: readonly CombatEvent[]): void {
  dispatchCombatDispatcher(events);
}
```

约束：
- 两段都是 Pipeline，受 Pipeline 形态全部约束
- 第一段调用 Resolver → Applier，返回 Event 列表（上游 Event 通过参数传入，不通过全局/单例）
- 第二段调用 Dispatcher，无返回值
- 不允许领域内的「三段式 / 一段式 / 自定义段数」——必须严格两段，方便 `_Frame/FramePipeline` 统一编排

## FramePipeline 模板

```ts
// src/_Frame/FramePipeline.ts
export function framePipeline(state: World): void {
  // 1. 共享 Collector
  const inputCmds = collectInputCollector();
  const tick      = collectTimeCollector();

  // 2. 各领域第一段（按 DAG 顺序，下游接收上游 Event）
  const movementEvents = movementResolveApplyPipeline(state, inputCmds, tick);
  const combatEvents   = combatResolveApplyPipeline(state, inputCmds, movementEvents);
  const questEvents    = questPanelResolveApplyPipeline(state, inputCmds, combatEvents);

  // 3. 各领域第二段
  movementDispatchPipeline(movementEvents);
  combatDispatchPipeline(combatEvents);
  questPanelDispatchPipeline(questEvents);
}
```

约束：
- 第一段必须**全部完成**后才能开始第二段（确保所有 state 改动落定后再 dispatch io）
- 领域调用顺序 = 跨领域依赖 DAG 的拓扑序
- 一帧内不允许"循环到收敛"

## 启动 Pipeline

```ts
// src/_Frame/StartupPipeline.ts
export function startupPipeline(): World {
  const config = loadConfigCollector();
  return createInitialStateResolver(config);
}
```

启动 Pipeline 也属于 `_Frame`，但通常只调用一次，不在每帧主循环中。

## 常见误用

**误用 1：Pipeline 里写 `if` 做条件分支**
```ts
// 错
export function framePipeline(state: World) {
  const cmds = collectInputCollector();
  if (state.paused) {
    dispatchPauseDispatcher();
    return;
  }
  ...
}
```
**改法**：把 paused 判定下沉到 Resolver——`state.paused` 时 Resolver 直接返回空 Event 列表，下游自然什么都不做。Pipeline 必须无条件。

**误用 2：Pipeline 里做计算或构造数据**
```ts
// 错
export function framePipeline(state: World) {
  const cmds = collectInputCollector();
  const allCmds = [...cmds, { type: 'tick', delta: Date.now() - state.lastTick }];
  ...
}
```
**改法**：tick Command 由 `collectTimeCollector` 产生（read-frame 在 Collector 里）；合并多个 Command 列表如果必要，由 Resolver 接受多参数即可。

**误用 3：Pipeline 里直接调 Adapter**
```ts
// 错
export function framePipeline(state: World) {
  console.log('frame start');
  ...
}
```
**改法**：log 也是 io，应由 Dispatcher 触发。要么把「frameStart」做成 Event 经 Dispatcher 派发，要么干脆删掉。

**误用 4：FramePipeline 做"多 pass 收敛"**
```ts
// 错
export function framePipeline(state: World) {
  let pending = collectInitialCommands();
  while (pending.length > 0) {
    const newEvents = [];
    for (const domain of domains) newEvents.push(...domain.resolveApply(state, pending));
    pending = newEvents;
  }
  ...
}
```
**改法**：方法论显式禁止多 pass（见 Domain.md 关于 1 帧延迟的说明）。每个领域每帧只跑一次。

**误用 5：领域 Pipeline 出现"自定义段数"**
```ts
// 错
export function combatThreeStagePipeline(state, ...) { ... resolve ... apply ... dispatch ... }
```
**改法**：必须严格两段（`<Domain>ResolveApplyPipeline` + `<Domain>DispatchPipeline`），命名固定，方便 `_Frame` 统一编排。
