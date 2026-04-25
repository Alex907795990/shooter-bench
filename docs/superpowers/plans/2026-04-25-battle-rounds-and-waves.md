# 战斗轮与刷怪波次 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 5 个战斗轮的倒计时状态，以及数据驱动的刷怪波次、红 X 占位和延迟生成敌人。

**Architecture:** 跨帧状态放入 `InstanceContainer`，包括战斗轮状态、波次进度和待生成占位标记。业务规则放入固定顺序 `System`：先推进战斗轮，再按波次创建占位标记，最后由占位标记生成敌人。Phaser 表现层只同步 HUD 和占位标记，不参与规则判断。

**Tech Stack:** TypeScript、Node 内置 test runner、Vite、Phaser。

---

### Task 1: 测试入口

**Files:**
- Modify: `package.json`
- Create: `tests/game/battle-rounds-and-waves.test.ts`

- [ ] **Step 1: Write the failing test**

创建 `tests/game/battle-rounds-and-waves.test.ts`，用 `node:test` 和 `node:assert/strict` 验证首帧到 20 秒后第 1 战斗轮结束。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/game/battle-rounds-and-waves.test.ts`
Expected: FAIL，因为当前没有战斗轮状态。

- [ ] **Step 3: Write minimal implementation**

在 `package.json` 增加 `type: "module"` 和 `test: "node --test"`，再实现战斗轮状态。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/game/battle-rounds-and-waves.test.ts`
Expected: PASS。

### Task 2: 波次占位

**Files:**
- Modify: `src/game/data.ts`
- Modify: `src/game/instances.ts`
- Modify: `src/game/instance-ops.ts`
- Modify: `src/game/systems.ts`
- Test: `tests/game/battle-rounds-and-waves.test.ts`

- [ ] **Step 1: Write the failing test**

验证第 1 战斗轮开始后，波次系统按数据表创建占位标记，标记先存在于 `spawnMarkers`，不会立即生成敌人。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/game/battle-rounds-and-waves.test.ts`
Expected: FAIL，因为当前只有旧的固定间隔 `EnemySpawnSystem`。

- [ ] **Step 3: Write minimal implementation**

新增波次数据类型、波次进度、`EnemySpawnMarkerInstance`、对应 `InstanceOps`，并用 `WaveTelegraphSystem` 读取数据表创建占位标记。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/game/battle-rounds-and-waves.test.ts`
Expected: PASS。

### Task 3: 延迟生成敌人

**Files:**
- Modify: `src/game/events.ts`
- Modify: `src/game/systems.ts`
- Test: `tests/game/battle-rounds-and-waves.test.ts`

- [ ] **Step 1: Write the failing test**

验证占位标记延迟 1 秒后移除，并生成敌人实例和 `enemy-spawned` 事件。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/game/battle-rounds-and-waves.test.ts`
Expected: FAIL，因为标记还不会转换为敌人。

- [ ] **Step 3: Write minimal implementation**

实现 `EnemySpawnMarkerSystem`，按标记剩余时间生成敌人并清理标记。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/game/battle-rounds-and-waves.test.ts`
Expected: PASS。

### Task 4: Phaser 同步

**Files:**
- Modify: `src/phaser/phaser-view-instances.ts`
- Modify: `src/phaser/phaser-view-ops.ts`
- Modify: `src/phaser/phaser-view-systems.ts`
- Modify: `src/scenes/battle-scene.ts`

- [ ] **Step 1: Write the failing build check**

Run: `npm run build`
Expected: FAIL until view types and sync code exist.

- [ ] **Step 2: Write minimal implementation**

新增 spawn marker 视图、HUD 文本，并在 `BattleViewSyncSystem` 同步当前战斗轮、剩余时间和红 X 标记。

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: PASS。
