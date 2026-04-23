# Dispatcher 形态

## 定义

Dispatcher 把 Event 列表「翻译」成 Adapter 调用：渲染、音效、网络发送、log 等所有「世界对外的反应」都由 Dispatcher 触发。Dispatcher 自己不读写 state。

## 允许能力

- `pure`（决策与解构）
- 通过调用 Adapter 间接触发 `io`

注意：Dispatcher 自身不持有 io 能力——它能产生外部效果，**仅因为它调用了 Adapter**。这意味着所有 io 都通过 Adapter 这一道闸门，方便集中替换/Mock/测试。

## 禁止事项

- 不能 read-state / read-config
- 不能 write-state
- 不能 read-frame
- 不能调用 Resolver / Query / Applier / Collector / Pipeline
- 不能直接调用底层 io API（必须经 Adapter）

## 可调用形态

- Adapter
- Pure
- Data（作为类型）

## 签名模板

```ts
export function dispatchXxxDispatcher(events: readonly GameEvent[]): void { ... }
```

输入永远是 Event 列表，输出 void。函数体结构与 Applier 相似（外层 for + 内层 switch on event-type），但每个 case 调用 Adapter 而非赋值 state。

## 最小示例

```ts
// src/Dispatcher/CombatDispatcher.ts
import { CombatEvent } from '../Data/Events';
import { playSoundAdapter } from '../Adapter/SoundAdapter';
import { showFloatingTextAdapter } from '../Adapter/UiAdapter';

export function dispatchCombatDispatcher(events: readonly CombatEvent[]): void {
  for (const e of events) {
    switch (e.type) {
      case 'damage':
        playSoundAdapter('hit.wav', 1.0);
        showFloatingTextAdapter(`-${e.amount}`, e.targetId);
        break;
      case 'heal':
        playSoundAdapter('heal.wav', 0.8);
        showFloatingTextAdapter(`+${e.amount}`, e.targetId);
        break;
      case 'died':
        playSoundAdapter('death.wav', 1.0);
        break;
    }
  }
}
```

## 常见误用

**误用 1：Dispatcher 里读 state 做条件**
```ts
// 错
export function dispatchCombatDispatcher(state: World, events: CombatEvent[]) {
  for (const e of events) {
    if (e.type === 'damage' && state.player.lowSoundEnabled) {   // ❌ read-state
      playSoundAdapter('hit_quiet.wav', 0.3);
    }
  }
}
```
**改法**：「是否播低音」是规则判断，应由 Resolver 决定。Resolver 看到 state.lowSoundEnabled 后直接产生 `playSound { clipId: 'hit_quiet', volume: 0.3 }` Event；Dispatcher 只做「按 Event 字段调 Adapter」。

**误用 2：Dispatcher 里直接调原生 io**
```ts
// 错
case 'died':
  console.log('player died');   // ❌ 绕过 Adapter
  socket.send(...);
```
**改法**：用 `logAdapter` / `sendNetAdapter`。Dispatcher 不直接碰外部 API。

**误用 3：Dispatcher 内做派生 Event**
```ts
// 错
case 'damage':
  if (e.amount > 100) {
    dispatchCombatDispatcher(state, [{ type: 'bigHitShake', ... }]);   // ❌ 自调
  }
```
**改法**：派生 Event 应在 Resolver 阶段产生，Dispatcher 拿到的就是已经完整的 Event 列表。

**误用 4：Dispatcher 调用 Applier「先改 state 再 io」**
```ts
// 错
case 'damage':
  applyCombatApplier(state, [e]);   // ❌
  playSoundAdapter(...);
```
**改法**：状态变更和 io 派发是两个不同 Pipeline 步骤，绝不在 Dispatcher 里混合。Pipeline 已经在你之前调用过 Applier 了。
