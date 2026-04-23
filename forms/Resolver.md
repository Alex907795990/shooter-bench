# Resolver 形态

## 定义

Resolver 是**纯函数**：输入 (State, Command 列表)，输出 Event 列表。所有游戏规则、伤害计算、AI 决策、规则判断都属于 Resolver。

Resolver 是这套范式的核心生产力——它纯净，因此可单测、可回放、可并行、可网络同步。

## 允许能力

- `pure`
- `read-config`
- `read-state`

## 禁止事项

- **不能 write-state**（写状态是 Applier 的职责）
- 不能 io
- 不能 read-frame（如需时间/RNG，必须从 Command 里读，由 Collector 注入）
- 不能调用 Applier、Dispatcher、Adapter、Collector、Pipeline

## 可调用形态

- Pure
- Query
- Data（作为类型）

## 签名模板

```ts
export function resolveXxxResolver(
  state: Readonly<State>,
  cmds: readonly XxxCommand[],
): readonly GameEvent[] { ... }
```

或单 Command 版本：
```ts
export function resolveXxxResolver(
  state: Readonly<State>,
  cmd: XxxCommand,
): readonly GameEvent[] { ... }
```

可以有多个 Resolver 并存（CombatResolver / MovementResolver / AIResolver），由 Pipeline 按顺序调用并累积 Event 列表。

## 最小示例

```ts
// src/Resolver/CombatResolver.ts
import { World } from '../Data/World';
import { AttackCommand } from '../Data/Commands';
import { CombatEvent } from '../Data/Events';
import { findNearestEnemyQuery } from '../Query/CombatQuery';
import { calcDamagePure } from '../Pure/DamagePure';

export function resolveCombatResolver(
  state: Readonly<World>,
  cmds: readonly AttackCommand[],
): readonly CombatEvent[] {
  const events: CombatEvent[] = [];

  for (const cmd of cmds) {
    const attacker = state.players.find(p => p.id === cmd.playerId);
    if (!attacker || attacker.hp <= 0) continue;

    const target = findNearestEnemyQuery(state, cmd.playerId);
    if (!target) continue;

    const dmg = calcDamagePure(attacker.attack, target.defense);
    events.push({ type: 'damage', targetId: target.id, amount: dmg });

    if (target.hp - dmg <= 0) {
      events.push({ type: 'died', targetId: target.id });
    }
  }

  return events;
}
```

## 常见误用

**误用 1：Resolver 里直接改 state**
```ts
// 错
export function resolveCombatResolver(state: World, cmds: AttackCommand[]) {
  for (const cmd of cmds) {
    const target = ...;
    target.hp -= 10;   // ❌ write-state
  }
}
```
**改法**：产生 `damage` Event，让 Applier 改 state。

**误用 2：Resolver 里调用 Adapter（如直接播音效）**
```ts
// 错
export function resolveCombatResolver(state, cmds) {
  ...
  playSoundAdapter('hit.wav');   // ❌ io
}
```
**改法**：产生 `damage` Event，Dispatcher 看到 `damage` Event 时调用音效 Adapter。

**误用 3：Resolver 里读 `Math.random` / `Date.now`**
```ts
// 错
export function resolveCombatResolver(state, cmds) {
  const crit = Math.random() < 0.1;   // ❌ read-frame
  ...
}
```
**改法**：随机数应在 Collector 里 roll 好放进 Command（如 `AttackCommand.rollSeed`），Resolver 根据 Command 字段判定。这样 Resolver 保持纯函数，可回放。

**误用 4：把多 Resolver 改成「Resolver 调 Resolver」**
```ts
// 错
export function resolveTopResolver(state, cmds) {
  const e1 = resolveCombatResolver(state, cmds);
  const e2 = resolveMovementResolver(state, cmds);
  return [...e1, ...e2];   // ❌ Resolver 不能调 Resolver；这是 Pipeline 的职责
}
```
**改法**：让 Pipeline 顺序调用多个 Resolver，累积 Event 列表。
