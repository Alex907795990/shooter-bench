# Brotato Demo 实现 Session

- 起始日期：2026-04-23
- 目标 spec：[docs/superpowers/specs/2026-04-22-brotato-demo-design.md](../superpowers/specs/2026-04-22-brotato-demo-design.md)
- 推进方式：一次只走一小步，做完确认再决定下一步，不预先铺整套计划

## 当前状态

- 历史原型已弃用，从零搭建（用户确认）
- 玩家方块 + WASD 移动 + 边界 + 网格 + 相机跟随 OK
- 4 只追击敌人 + 自动手枪武器 + 弹丸 + 命中即杀
- **武器列表化 + 悬浮渲染**：
  - `WeaponState` 改为 `weapons: WeaponEntity[]`，每把武器持有 id/orbitAngleRad/cooldownMs/intervalMs/range/projectileSpeed/projectileTtlMs/hitRadius
  - `ProjectileEntity` 自带 hitRadius（弹丸独立于发射武器存活）
  - `WeaponConfig` 新增 orbitRadius=40、initialWeaponCount=3
  - 初始 3 把武器在玩家圆环上均分角度静态布局
  - Resolver 每帧按各武器位置选最近敌人，弹丸从武器位置出发；新增 `weaponMoved` 事件
  - 新增 `WeaponSpriteAdapter`（10×10 橙色方块，懒创建）
  - 命中分配：跨武器同帧不会重复打同一只敌人
- **敌人持续生成（Brotato 风格预警）**：
  - `EnemyState` 新增 spawnCooldownMs/pendingSpawns/nextMarkerId
  - `EnemyConfig` 新增 batchIntervalMs=1500/batchSize=3/spawnDelayMs=1000/minDistanceFromPlayer=180/maxConcurrent=100
  - 每 batchIntervalMs 生成一批预警标记（全场随机，距玩家 ≥ minDistance，拒绝采样最多 8 次），spawnDelayMs 后转为敌人
  - 新事件：enemySpawnCooldownTicked / enemySpawnMarkerCreated/Ticked/Expired / enemySpawned
  - 新增 `SpawnMarkerSpriteAdapter`（半透明红圈 + 描边）
  - **形态破例**：EnemyResolver 直接调 `Math.random`（已与用户确认，文件顶部注明），失去纯函数性
  - EnemyPipeline/FramePipeline 增加 arena 参数
- **Pipeline 形态合规收尾（审核反馈）**：
  - 领域 Pipeline/Resolver/Applier 签名统一接 `World`，内部解构需要的切片
  - `FramePipeline` 完全无字段访问/数据构造，只剩 Collector + 顺序调用 + Event 转发
  - 跨域 1 帧延迟反馈（Weapon → Enemy 命中）改为 Resolver 自己 read-state（`world.weapon.recentEnemyHits`），不再由 FramePipeline 拼装
- **main.ts 字面量收敛**：
  - `_Frame/FrameConfig` 新增 `boundsColor / backgroundColor / CAMERA_CONFIG`
  - `Movement/Data/MovementConfig` 新增 `playerSize / playerColor`
  - main.ts 不再出现 0x66ccff / 24 / 0.15 / "#111111" 裸字面量
- **重构**：World 从 `_Shared/Data` 拆走，每个领域持有自己的 State 切片
  - `Movement/Data/MovementState`, `Enemy/Data/EnemyState`, `Weapon/Data/WeaponState`
  - `_Frame/Data/World` 组合三者 + `arena`
  - 各领域 Resolver/Applier/Pipeline 只接自己的切片 + 必需引用，FramePipeline 显式解构传参
- **重构**：StartupPipeline 不再塞常量
  - 各领域 `Pure/<Domain>InitPure.ts` 提供 `create*InitialStatePure(...)`
  - `_Frame/Pure/WorldInitPure.ts` 做组装
  - StartupPipeline 仅 `return createWorldPure(w, h)`
- **重构**：每个领域提常量配置文件
  - `Movement/Data/MovementConfig.ts`(playerSpeed)
  - `Enemy/Data/EnemyConfig.ts`(initialSpawnMargin / defaultSpeed / initialIdStart)
  - `Weapon/Data/WeaponConfig.ts`(intervalMs / range / projectileSpeed / projectileTtlMs / hitRadius)
  - `_Frame/Data/FrameConfig.ts`(ARENA_CONFIG / VIEW_CONFIG)
  - 各 Init Pure 与 main.ts 改为读 Config，不再写裸字面量
- 方法论合规：`_Shared/Data` 只留通用类型；跨领域 import 仅限 Data；DAG 无环
- `npx tsc --noEmit` 通过

## 已完成

- 玩家移动 + 边界 + 相机
- 首把武器 + 4 只敌人 + 弹丸命中即杀
- World 与 Startup 切片化重构

## 待处理（仅下一小步）

- 用户在浏览器验证：FramePipeline 重构后行为不回退

## 风险 / 阻塞

- EnemyResolver 已破例使用 Math.random，后续若要回放/单测需要补 Collector 注入随机数
