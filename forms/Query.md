# Query 形态

## 定义

Query 模块对 State / Config 进行**只读查询**，返回派生数据。不能修改任何状态。

## 允许能力

- `pure`
- `read-config`
- `read-state`

## 禁止事项

- 不能 write-state
- 不能 io
- 不能 read-frame（不能读输入/时间/RNG/网络）
- 不能调用 Mutator/Adapter/Resolver/Applier/Collector/Pipeline/Dispatcher

## 可调用形态

- Pure
- Query
- Data（作为类型与传参）

## 签名模板

```ts
export function fnNameQuery(state: ReadonlyState, ...args): ResultT { ... }
```

State 参数应使用 `Readonly<...>` / `ReadonlyArray<...>` 等只读类型，明确声明只读契约。

## 最小示例

```ts
// src/Query/CombatQuery.ts
import { World } from '../Data/World';
import { PlayerState } from '../Data/PlayerState';

export function findAlivePlayersQuery(state: Readonly<World>): readonly PlayerState[] {
  return state.players.filter(p => p.hp > 0);
}

export function findNearestEnemyQuery(
  state: Readonly<World>,
  selfId: string,
): PlayerState | undefined {
  const self = state.players.find(p => p.id === selfId);
  if (!self) return undefined;

  let best: PlayerState | undefined;
  let bestDist = Infinity;
  for (const p of state.players) {
    if (p.id === selfId || p.team === self.team) continue;
    const d = distSqPure(p.position, self.position);
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}
```

## 常见误用

**误用 1：在 Query 里改 state**
```ts
// 错
export function getOrCreatePlayerQuery(state: World, id: string): PlayerState {
  let p = state.players.find(x => x.id === id);
  if (!p) {
    p = { id, hp: 100, ... };
    state.players.push(p);   // ❌ 写 state
  }
  return p;
}
```
**改法**：Query 只查不创。如果不存在就返回 undefined，调用方决定是否产 Event 由 Applier 创建。

**误用 2：调用了 Adapter（如 console.log）做调试**
```ts
// 错
export function findEnemyQuery(state: World, id: string) {
  console.log('finding enemy for', id);  // ❌ io
  ...
}
```
**改法**：调试 log 移到 Pipeline 或专用 Dispatcher。Query 必须保持纯查询。

**误用 3：读了 `Date.now()` 做时效判断**
```ts
// 错
export function getActiveBuffsQuery(state: World, id: string) {
  const now = Date.now();   // ❌ read-frame
  return state.buffs.filter(b => b.expireAt > now);
}
```
**改法**：把 `now` 作为参数传入；当前时间由 Collector 收集成 Command 字段，再传给需要它的层。
