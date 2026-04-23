# Pure 形态

## 定义

Pure 模块只包含**纯函数**：相同输入永远产生相同输出，无任何外部读写。

## 允许能力

- `pure`

## 禁止事项

- 不能读取任何模块外的可变状态（包括 `state`、`config`、全局变量）
- 不能读取 `Date.now()` / `Math.random()` / 输入 API / 网络等 frame 数据
- 不能 io（控制台、文件、网络、渲染）
- 不能调用非 Pure / 非 Data 的模块

## 可调用形态

- Pure
- Data（仅作为类型）

## 签名模板

```ts
export function fnNamePure(input: InputT): OutputT { ... }
```

输入与输出全部为值或 Data 类型，无 `void`（无副作用就该有返回值）。

## 最小示例

```ts
// src/Pure/MathPure.ts
export function clampPure(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function lerpPure(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// src/Pure/DamagePure.ts
import { clampPure } from './MathPure';

export function calcDamagePure(attack: number, defense: number): number {
  return clampPure(attack - defense, 0, attack);
}
```

## 常见误用

**误用 1：偷偷读 `Math.random` 或 `Date.now`**
```ts
// 错
export function rollDamagePure(base: number): number {
  return base * (0.9 + Math.random() * 0.2);  // ❌ read-frame
}
```
**改法**：把随机数作为参数传入；调用方在 Collector 里 roll，把结果打包成 Command。

**误用 2：读模块级可变变量**
```ts
// 错
let multiplier = 1;
export function applyMultiplierPure(x: number): number {
  return x * multiplier;  // ❌ 读外部状态
}
```
**改法**：把 multiplier 作为参数传入。

**误用 3：调用 Query/Resolver/Adapter**
```ts
// 错
import { findNearestEnemyQuery } from '../Query/CombatQuery';
export function pickTargetPure(playerId: string): string {
  return findNearestEnemyQuery(playerId);  // ❌ 调用 Query
}
```
**改法**：要么把目标作为参数传入（变成真正的 Pure），要么这个函数本来就属于 Query 形态。
