# Data 形态

## 定义

Data 模块**只持有数据结构定义**，不包含任何行为。涵盖 Command（外部输入打包）、Event（状态变化打包）、State（游戏状态）、Config（不变配置）。

## 允许能力

无（不包含可执行代码）。

## 禁止事项

- 不能定义方法（包括实例方法、静态方法）
- 不能定义 getter / setter
- 不能在字段初始化中调用任何函数（除字面量与构造）
- 不能 import 除其他 Data 模块以外的任何模块

## 可调用形态

无（Data 没有可执行代码，谈不上调用）。

## 签名模板

```ts
// State / Config
export interface PlayerState {
  hp: number;
  position: Vec2;
  buffs: BuffId[];
}

// Command
export interface MoveCommand {
  type: 'move';
  playerId: PlayerId;
  direction: Vec2;
}

// Event (建议加上 type 区分字段以配合 Applier 的 switch)
export type GameEvent =
  | { type: 'damage';   targetId: PlayerId; amount: number }
  | { type: 'heal';     targetId: PlayerId; amount: number }
  | { type: 'died';     targetId: PlayerId }
  | { type: 'moved';    targetId: PlayerId; to: Vec2 };
```

## 最小示例

```ts
// src/Data/PlayerState.ts
export interface PlayerState {
  id: string;
  hp: number;
  maxHp: number;
  position: { x: number; y: number };
}

// src/Data/CombatEvent.ts
export type CombatEvent =
  | { type: 'damage'; targetId: string; amount: number }
  | { type: 'died';   targetId: string };
```

## 常见误用

**误用 1：在 Data 里加便捷方法**
```ts
// 错
export class PlayerState {
  hp: number = 100;
  takeDamage(n: number) { this.hp -= n; }   // ❌ 写 state，应在 Applier
  isDead(): boolean { return this.hp <= 0; } // ❌ 读 state，应在 Query
}
```
**改法**：拆成纯字段类型 + 对应 Applier/Query 模块。

**误用 2：在字段初始化中调用工厂函数**
```ts
// 错
export interface World {
  players: PlayerState[] = createInitialPlayers();  // ❌ 隐含执行逻辑
}
```
**改法**：初始化由调用方（通常是 Pipeline）完成，Data 只声明形状。

**误用 3：Data 之间互相 import 业务模块**
```ts
// 错
// src/Data/PlayerState.ts
import { calcMaxHp } from '../Pure/StatsPure';  // ❌ Data 不能依赖 Pure
```
**改法**：把派生量从 Data 移除，改在 Query 里按需计算。
