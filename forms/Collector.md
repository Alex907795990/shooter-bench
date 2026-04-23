# Collector 形态

## 定义

Collector 是**唯一**允许 `read-frame` 的形态。它从外部世界（输入设备、时钟、RNG、网络包队列）读取每帧/每次都不同的数据，打包成 **Command**（Data 形态）输出。

## 允许能力

- `read-frame`

注意：Collector **只能** read-frame。它不读 state、不读 config、不写 state、不 io、不做计算。

## 禁止事项

- 不能 read-state / read-config（如需配置参与，由调用方在更上层组合）
- 不能 write-state
- 不能 io（不发送、不渲染、不写盘）
- 不能调用 Pure/Query/Resolver/Applier/Adapter/Dispatcher（除调用 Pure 做最小打包格式化外，下面会说明）
- 不能在内部累积状态（不能持有可变字段）

## 可调用形态

- Pure（仅用于把原始 frame 数据打包成 Command 的格式化）
- Data（作为 Command 类型）

## 签名模板

```ts
export function collectXxxCollector(): readonly XxxCommand[] { ... }
```

输入永远是 frame 来源（隐式），输出永远是 Command 列表。

## 最小示例

```ts
// src/Collector/InputCollector.ts
import { MoveCommand, AttackCommand } from '../Data/Commands';

export function collectInputCollector(): readonly (MoveCommand | AttackCommand)[] {
  const cmds: (MoveCommand | AttackCommand)[] = [];

  if (isKeyDown('W')) cmds.push({ type: 'move', dir: { x: 0, y: 1 } });
  if (isKeyDown('S')) cmds.push({ type: 'move', dir: { x: 0, y: -1 } });
  if (isKeyDown('Space')) cmds.push({ type: 'attack' });

  return cmds;
}

// src/Collector/TimeCollector.ts
import { TickCommand } from '../Data/Commands';

export function collectTimeCollector(): TickCommand {
  return { type: 'tick', deltaMs: getDeltaMs(), nowMs: Date.now() };
}
```

## 常见误用

**误用 1：Collector 里读 state 来决定要不要产 Command**
```ts
// 错
export function collectInputCollector(state: World) {
  if (state.player.hp <= 0) return [];   // ❌ read-state
  ...
}
```
**改法**：无条件产 Command，由 Resolver 根据 state 决定是否产生 Event（或忽略）。Collector 只搬数据。

**误用 2：Collector 里直接调用 Adapter（如把按键情况打 log）**
```ts
// 错
export function collectInputCollector() {
  if (isKeyDown('W')) console.log('moving');  // ❌ io
  ...
}
```
**改法**：log 是 Adapter 的事，且应由 Dispatcher 触发。

**误用 3：Collector 持有累积状态（如组合键、连点判断）**
```ts
// 错
let lastClickTime = 0;
export function collectInputCollector() {
  const now = Date.now();
  const isDouble = now - lastClickTime < 300;
  lastClickTime = now;
  ...
}
```
**改法**：把 `lastClickAt` 放入 game state，由 Resolver 根据 state + 当前 click Command 判断是否产生 `doubleClick` Event；Collector 只产原始 click Command。Collector 必须无状态。
