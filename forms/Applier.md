# Applier 形态

## 定义

Applier 把 Event 列表写进 State。Applier 是**唯一**允许 `write-state` 的形态。

Applier 的函数体被结构性约束为「**按 event-type 分支，每个分支直接改字段**」——不允许其他控制流，不允许复杂计算。所有计算应在 Resolver 完成、把结果放进 Event 字段，Applier 只做赋值。

## 允许能力

- `write-state`

注意：Applier 也可以读它即将写的 state（赋值需要旧值），但**不能**做派生计算——派生应在 Resolver 完成。

## 禁止事项

- 不能 io
- 不能 read-frame
- 不能 read-config（配置参与计算的部分应在 Resolver 完成）
- 不能调用 Resolver / Query / Collector / Adapter / Dispatcher / Pipeline
- 函数体**不允许**：嵌套 switch、while/do-while、复杂计算表达式（除直接赋值与 ±）、调用其他业务函数
- 允许的控制流**仅限**：
  - 外层 `for (const e of events)`
  - 内层 `switch (e.type)`
  - 每个 case 内：**单层守卫 if（如 `if (!t) break;`）+ 字段赋值 + 调用 Pure 做格式化**
  - 不允许 case 内出现嵌套循环或多层 if

## 可调用形态

- Pure（仅用于赋值时的简单格式化，如 `clampPure`）
- Data（作为类型）

## 签名模板

```ts
export function applyXxxApplier(
  state: State,
  events: readonly GameEvent[],
): void { ... }
```

返回 void。直接 mutate state（这是 Applier 唯一被允许的副作用）。

## 最小示例

```ts
// src/Applier/CombatApplier.ts
import { World } from '../Data/World';
import { CombatEvent } from '../Data/Events';
import { clampPure } from '../Pure/MathPure';

export function applyCombatApplier(
  state: World,
  events: readonly CombatEvent[],
): void {
  for (const e of events) {
    switch (e.type) {
      case 'damage': {
        const t = state.players.find(p => p.id === e.targetId);
        if (!t) break;
        t.hp = clampPure(t.hp - e.amount, 0, t.maxHp);
        break;
      }
      case 'heal': {
        const t = state.players.find(p => p.id === e.targetId);
        if (!t) break;
        t.hp = clampPure(t.hp + e.amount, 0, t.maxHp);
        break;
      }
      case 'died': {
        const t = state.players.find(p => p.id === e.targetId);
        if (!t) break;
        t.alive = false;
        break;
      }
    }
  }
}
```

## 常见误用

**误用 1：在 Applier 里做规则计算**
```ts
// 错
case 'damage': {
  const t = ...;
  const finalDmg = t.defense > 0 ? e.amount / t.defense : e.amount * 2;  // ❌ 计算
  t.hp -= finalDmg;
  if (t.hp <= 0) { t.alive = false; spawnLoot(t); }   // ❌ 派生事件
  break;
}
```
**改法**：所有计算移回 Resolver。Resolver 应直接产生 `damage`(已含最终伤害)和 `died`、`lootSpawned` 事件，Applier 只做赋值。

**误用 2：在 Applier 里调 Adapter**
```ts
// 错
case 'died': {
  playSoundAdapter('death.wav');   // ❌ io
  ...
}
```
**改法**：Dispatcher 看到 `died` Event 后调用音效 Adapter。Applier 严禁 io。

**误用 3：复杂控制流嵌套**
```ts
// 错
for (const e of events) {
  if (state.frozen) continue;
  switch (e.type) {
    case 'damage':
      for (const buff of state.buffs) {
        if (buff.type === 'shield') {
          ...
        }
      }
  }
}
```
**改法**：所有条件判断移到 Resolver。Resolver 看到 `state.frozen` 时直接不产生 Event；buff 抵消逻辑也在 Resolver 完成，最终只产生「实际生效」的 Event。Applier 必须傻到只能 switch+赋值。

**误用 4：Applier 之间互相调**
```ts
// 错
export function applyCombatApplier(state, events) {
  ...
  applyMovementApplier(state, derivedEvents);   // ❌
}
```
**改法**：Pipeline 顺序调用多个 Applier，不允许 Applier 互调。
