# Adapter 形态

## 定义

Adapter 对接外部系统：渲染、音频、网络发送、磁盘 IO、第三方 SDK。Adapter **不能感知 game state**——它接收明确传入的参数，转换为外部 API 调用。

Adapter 的核心约束是「与游戏状态完全切断」。这避免了「IO 层偷读 state 做业务判断」这一传统坏味道。

## 允许能力

- `pure`
- `io`

## 禁止事项

- **不能 read-state / read-config**（要用就让 Dispatcher 在调用时把数据传进来）
- 不能 write-state
- 不能 read-frame（外部数据应由 Collector 收集后传入）
- 不能调用 Resolver / Query / Applier / Collector / Pipeline / Dispatcher

## 可调用形态

- Pure
- Adapter（同形态可互相调，例如复合 Adapter 调底层 Adapter）
- Data（作为参数类型）

## 签名模板

```ts
export function xxxAdapter(...explicitArgs): void | ResultT { ... }
```

参数列表必须显式列出所有需要的数据。**禁止**接受 `state: World` 这种「整个 state」参数——这等于变相 read-state。

## 最小示例

```ts
// src/Adapter/SoundAdapter.ts
export function playSoundAdapter(clipId: string, volume: number): void {
  audioEngine.play(clipId, { volume });
}

// src/Adapter/RenderAdapter.ts
import { Vec2 } from '../Data/Vec2';

export function drawSpriteAdapter(
  spriteId: string,
  position: Vec2,
  rotation: number,
): void {
  renderer.drawSprite(spriteId, position.x, position.y, rotation);
}

// src/Adapter/NetAdapter.ts
import { NetMessage } from '../Data/NetMessage';

export function sendNetAdapter(msg: NetMessage): void {
  socket.send(JSON.stringify(msg));
}
```

## 常见误用

**误用 1：Adapter 接受 state，自己挑数据**
```ts
// 错
export function renderPlayerAdapter(state: World, playerId: string): void {
  const p = state.players.find(x => x.id === playerId);   // ❌ read-state
  if (!p) return;
  renderer.drawSprite('player', p.position.x, p.position.y, p.rotation);
}
```
**改法**：Adapter 改成 `drawSpriteAdapter(spriteId, position, rotation)`，由 Dispatcher 从 Event 里取出参数后调用。

**误用 2：Adapter 内做业务判断**
```ts
// 错
export function playHitSoundAdapter(damage: number, hp: number): void {
  if (hp <= 0) playSound('death.wav');    // ❌ 业务逻辑
  else if (damage > 50) playSound('big_hit.wav');
  else playSound('hit.wav');
}
```
**改法**：判断逻辑移到 Resolver——Resolver 决定产生 `playSound` Event 时直接指定 clipId。Adapter 只是「按 id 播放」。

**误用 3：Adapter 内读全局/Singleton state**
```ts
// 错
import { gameWorld } from '../Data/World';   // ❌ Singleton state
export function syncPlayerAdapter(): void {
  for (const p of gameWorld.players) sendNetAdapter({ type: 'pos', ... });
}
```
**改法**：禁止 Adapter import 任何 State 模块；数据只能从参数传入。

**误用 4：Adapter 调用 Resolver/Applier 来「自己刷新一下」**
```ts
// 错
export function reconnectAdapter(): void {
  socket.reconnect();
  applyResetApplier(...);   // ❌ 跨形态调用 + 越级
}
```
**改法**：Adapter 只做外部调用并返回结果。后续动作由 Pipeline 编排（如 Pipeline 收到 reconnect 失败后产生 `connectionLost` Command 进入下一帧的 Resolver）。
