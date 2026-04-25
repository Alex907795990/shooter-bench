---
name: game-client-logic-architecture
description: 当需要设计、审查或实现语言/引擎无关的游戏客户端逻辑，并涉及 Resolver、System、InstanceContainer、InstanceOps、ResolveContainer、Intent、Event、帧处理、Tick、输入回调或客户端状态流时使用。
---

# 游戏客户端逻辑架构

## 核心思路

把游戏客户端逻辑限制在少数客观代码形态中：跨帧状态放在 `InstanceContainer`，单帧过程数据放在 `ResolveContainer`，业务逻辑只在 `Resolver` 调度的有序 `System` 中执行。

## 工作流程

1. 识别功能的输入、跨帧状态、单帧过程数据、业务规则和输出。
2. 将每个部分归类为 `data`、`Instance`、`InstanceContainer`、`InstanceOps`、`Intent`、`Event`、`ResolveContainer`、`System` 或 `Resolver`。
3. 外部 callback 和玩家输入只做数据导入：转换为 `Intent/Event`，不要在回调链路中执行业务逻辑。
4. 明确 `Resolver` 的三个阶段：外部信号导入、有序系统解析、输出与清理。
5. 通过按类型划分的静态 `InstanceOps` 访问 `InstanceContainer`；不要给容器添加 CRUD 成员函数。
6. 不确定归属或边界规则时，读取 `references/rules.md`。

## 参考

# 游戏客户端逻辑架构设计说明

## 1. 目标

本架构用于约束游戏客户端逻辑代码的组织方式，使代码能够被拆分为有限、稳定、容易判断的形态。

它要解决的问题不是“如何最快写完一个功能”，而是让功能在持续增长后仍然可以被开发者理解、追踪和维护：

1. 状态存在哪里是明确的。
2. 每一帧发生了什么是可追踪的。
3. 不同系统之间如何通信是受约束的。
4. 代码形态可以通过客观规则判断，而不是依赖开发者主观理解业务。
5. 常见游戏客户端需求可以被拆成这些形态的组合。

本文独立定义这套架构，不依赖具体语言、引擎或框架概念。

## 2. 核心思想

游戏客户端逻辑可以被看作连续的帧级解析过程。

跨帧存在的是世界状态；单帧内发生的是解析过程。架构上需要严格区分这两类东西：

1. **跨帧状态**：由 `InstanceContainer` 持有，内部由 `Instance` 和 `data` 组成。
2. **单帧过程数据**：由 `ResolveContainer` 持有，内部由 `Intent` 和 `Event` 组成。
3. **逻辑执行者**：由 `Resolver` 统一调度一组无状态 `System`。

因此，每一帧的基本模型是：

```text
引擎回调 / 用户输入 / 游戏Tick
        ↓
Resolver 阶段一：外部信号数据化
        ↓
取得并清理 ResolveContainer
写入初始 Intent/Event
        ↓
Resolver 阶段二：业务解析
        ↓
按固定顺序执行 Systems
        ↓
通过 InstanceOps 读写 InstanceContainer
消费 Intent，产生 Event
        ↓
Resolver 阶段三：输出与清理
        ↓
清空 ResolveContainer
```

`InstanceContainer` 是跨帧世界状态的根；`ResolveContainer` 是单帧解析过程的上下文容器。`ResolveContainer` 对象本身可以复用，但其中保存的 `Intent/Event` 只能属于当前帧，不能跨帧保留。

## 3. 架构形态总览

代码被划分为以下几种形态：

| 形态                | 生命周期         | 是否有状态 | 是否允许函数     | 主要职责                                        |
| ------------------- | ---------------- | ---------- | ---------------- | ----------------------------------------------- |
| `data`              | 可跨帧           | 有         | 不允许           | 表示最小数据片段                                |
| `Instance`          | 可跨帧           | 有         | 不允许           | 表示游戏世界中的持久对象数据                    |
| `InstanceContainer` | 可跨帧           | 有         | 不提供 CRUD 函数 | 持有所有跨帧实例的存储结构                      |
| `InstanceOps`       | 无实例生命周期   | 无         | 只允许静态函数   | 按数据类型声明对 InstanceContainer 的 CRUD 操作 |
| `Intent`            | 单帧             | 有         | 不允许           | 描述需要被处理的请求或意图                      |
| `Event`             | 单帧             | 有         | 不允许           | 描述已经发生的结果或事实                        |
| `ResolveContainer`  | 可复用，内容单帧 | 有         | 允许有限访问函数 | 持有本帧 Intent/Event                           |
| `System`            | 常驻             | 无业务状态 | 允许             | 执行真实游戏逻辑                                |
| `Resolver`          | 常驻             | 有调度状态 | 允许             | 作为每帧逻辑入口，推进 Systems                  |

这里的“是否允许函数”指是否允许包含业务逻辑函数。纯数据结构不应该通过方法隐藏逻辑。

## 4. 数据形态

### 4.1 data

`data` 是纯数据结构，用于表达最小、可组合的数据片段。

`data` 只能保存：

1. 基元类型。
2. 枚举、标识符、数值对象等业务无关类型。
3. 其他足够通用、稳定、无业务行为的数据类型。

`data` 不应该：

1. 持有具体 `Instance`。
2. 依赖具体业务对象。
3. 包含业务逻辑函数。
4. 通过方法修改自身或其他对象。

示例：

```text
PositionData {
  x
  y
}

VelocityData {
  x
  y
}

HealthData {
  current
  max
}
```

`data` 的判断标准是：它能否脱离具体业务对象仍然成立。如果一个结构只能通过“玩家”“怪物”“技能”这类业务概念解释，它可能不应该是通用 `data`，而应该成为某个 `Instance` 的字段。

### 4.2 Instance

`Instance` 是跨帧存在的纯数据结构，用于表达游戏世界中的持久对象。

`Instance` 可以组合多个 `data`，也可以保存业务所需的基元字段，但它不能直接保存或引用其他 `Instance`。

允许：

```text
CharacterInstance {
  id
  position: PositionData
  velocity: VelocityData
  health: HealthData
}
```

不允许：

```text
CharacterInstance {
  target: CharacterInstance
}
```

如果一个实例需要指向另一个实例，应保存稳定标识符，而不是对象引用：

```text
CharacterInstance {
  targetId
}
```

这样做的目的，是避免跨帧对象之间形成隐式引用网络，使状态变化难以追踪。

### 4.3 InstanceContainer

`InstanceContainer` 是所有跨帧世界状态的根节点。

全局只能存在一个逻辑上的 `InstanceContainer`。它负责持有所有 `Instance` 的存储结构，也可以保存少量全局性 `data`。

`InstanceContainer` 可以有复杂内部结构，例如按类型、区域、阵营、场景层级或空间索引组织实例。但这些复杂结构不应该泄漏到业务逻辑外部。

`InstanceContainer` 不应该直接提供 CRUD 接口。也就是说，不应该在 `InstanceContainer` 上声明下面这种成员函数：

```text
instanceContainer.getCharacter(id)
instanceContainer.addProjectile(instance)
instanceContainer.removeDestroyedInstances()
instanceContainer.findInstancesInArea(area)
```

这样做的目的是避免 `InstanceContainer` 逐渐膨胀成全局业务对象，也避免所有实例类型的访问规则混在同一个类中。

### 4.4 InstanceOps

所有对 `InstanceContainer` 的 CRUD 操作都应该声明为无状态静态函数，并且按操作的数据类型分开组织。

示例：

```text
CharacterInstanceOps.get(container, characterId)
CharacterInstanceOps.add(container, characterInstance)
CharacterInstanceOps.remove(container, characterId)
CharacterInstanceOps.findInArea(container, area)

ProjectileInstanceOps.get(container, projectileId)
ProjectileInstanceOps.add(container, projectileInstance)
ProjectileInstanceOps.remove(container, projectileId)
```

这些静态函数可以访问和维护 `InstanceContainer` 内部对应类型的存储与索引，但不应该承载业务规则。例如“角色是否可以释放技能”“伤害如何计算”不应放在 `CharacterInstanceOps` 中。

判断标准是：

1. 如果函数只是在某类 `Instance` 的存储结构上做创建、读取、更新、删除、索引维护或查询，它可以放在该类型对应的 `InstanceOps` 中。
2. 如果函数需要判断游戏规则、消费 `Intent`、产生 `Event`，或协调多个业务过程，它应该放在 `System` 中。
3. 如果函数同时操作多种 `Instance`，优先检查它是否已经是业务逻辑；如果只是维护跨类型索引，可以声明在更明确的索引型静态函数组中。

## 5. 单帧过程数据

### 5.1 Intent

`Intent` 是单帧生命周期的数据结构，用于描述需要被处理的请求、输入或意图。

它通常来自：

1. 引擎回调。
2. 用户输入。
3. 其他 `System` 在本帧产生的后续请求。
4. 游戏 Tick 中固定产生的逻辑请求。

示例：

```text
MoveIntent {
  characterId
  direction
}

CastSkillIntent {
  casterId
  skillId
  targetId
}
```

`Intent` 只描述“希望发生什么”，不保证它一定会成功。是否能执行、如何执行，由 `System` 判断。

### 5.2 Event

`Event` 是单帧生命周期的数据结构，用于描述已经发生的结果或事实。

示例：

```text
CharacterMovedEvent {
  characterId
  fromPosition
  toPosition
}

DamageAppliedEvent {
  sourceId
  targetId
  amount
}
```

`Event` 只描述“已经发生什么”，不应该被当作跨帧状态保存。如果某个结果需要跨帧存在，应由 `System` 通过对应的 `InstanceOps` 写入 `InstanceContainer`。

### 5.3 Intent 和 Event 的边界

`Intent` 与 `Event` 的区别是时间语义：

1. `Intent` 表示待处理请求。
2. `Event` 表示已发生结果。

例如：

```text
MoveIntent: 玩家请求角色向右移动
CharacterMovedEvent: 角色已经从 A 点移动到 B 点
```

不要用 `Event` 表达尚未验证的请求，也不要用 `Intent` 表达已经发生的事实。

### 5.4 ResolveContainer

`ResolveContainer` 是单帧解析过程的上下文容器。

每次 `Resolver` 推进一帧时，应取得一个干净的 `ResolveContainer`，用于保存本帧所有 `Intent` 和 `Event`。这个容器对象可以被长期复用，但每帧开始前或结束后必须清理内部数据。

这里的“单帧”指 `ResolveContainer` 内部数据的生命周期，而不是指容器对象必须每帧重新分配。

`ResolveContainer` 可以提供有限访问函数，例如：

```text
addIntent(intent)
consumeIntents(type)
addEvent(event)
readEvents(type)
clear()
```

这些函数只负责本帧数据的写入、读取和消费，不应该包含业务规则。

除 `Resolver` 或容器池内部实现之外，其他对象不应该长期持有 `ResolveContainer`。`System` 只能在本帧调用期间使用它，也不应该跨帧保存其中的 `Intent` 或 `Event`。

## 6. 逻辑执行形态

### 6.1 Resolver

`Resolver` 是全局唯一的 Tick 逻辑入口。

它负责：

1. 接收引擎回调、用户输入和游戏 Tick。
2. 取得并清理本帧要使用的 `ResolveContainer`。
3. 通过输入适配层将外部输入写入为初始 `Intent/Event`。
4. 按固定顺序推进所有 `System`。
5. 输出本帧对外部引擎层的请求。
6. 在本帧结束后清空 `ResolveContainer`。

`Resolver` 不应该直接写业务逻辑。它负责调度和外部输入接入，而不是负责判断“角色如何移动”“伤害如何结算”“技能如何生效”。

输入适配层只负责把引擎、平台或设备输入转换为架构内部可以理解的初始 `Intent/Event`。如果输入映射本身包含复杂游戏规则，这部分规则应放入 `System`，而不是放入 `Resolver`。

`Resolver` 内部应明确分为三个阶段。

### 6.1.1 阶段一：外部信号数据化

这个阶段负责把引擎回调、玩家输入、网络输入、时间推进等外部信号转换为 `ResolveContainer` 中的初始 `Intent/Event`。

这个阶段允许：

1. 取得并清理本帧要使用的 `ResolveContainer`。
2. 读取外部输入参数。
3. 将外部输入转换成 `Intent/Event`。
4. 写入 `ResolveContainer`。

这个阶段不允许：

1. 执行业务判断。
2. 修改 `InstanceContainer`。
3. 直接调用业务 `System`。
4. 在回调链路中完成角色移动、伤害结算、技能释放等游戏逻辑。

也就是说，引擎 callback 或玩家输入不是业务逻辑入口，而只是外部信号入口。它们必须先被数据化，成为本帧 Resolve 数据的一部分。

### 6.1.2 阶段二：业务解析

这个阶段负责按固定顺序执行所有 `System`。

只有在这个阶段，游戏业务逻辑才真正发生。`System` 可以消费阶段一写入的 `Intent/Event`，通过对应的 `InstanceOps` 读取和修改 `InstanceContainer`，并继续产生新的 `Intent/Event`。

阶段二的执行边界由 `System` 列表决定，而不是由引擎回调链路决定。这样可以保证同一类业务逻辑总是在同一个架构位置发生。

### 6.1.3 阶段三：输出与清理

这个阶段负责处理本帧解析后的对外输出，并清理单帧数据。

它可以把表现、音效、UI、日志、调试信息等输出型 `Event` 交给引擎适配层，但不应该再执行业务结算。如果某个结果会影响下一帧游戏逻辑，它必须已经在阶段二通过对应的 `InstanceOps` 写入 `InstanceContainer`。

阶段三结束后，`ResolveContainer` 中的 `Intent/Event` 都应被清理。容器对象可以保留给下一帧复用。

每帧流程可以表达为：

```text
resolveFrame(engineCallbacks, userInputs, deltaTime):
  resolveContainer = acquireResolveContainer()
  resolveContainer.clear()

  importExternalSignals(resolveContainer, engineCallbacks, userInputs, deltaTime)

  for system in systems:
    system.resolve(instanceContainer, resolveContainer, deltaTime)

  exportFrameOutputs(resolveContainer)

  resolveContainer.clear()
```

### 6.2 System

`System` 是真实发生游戏逻辑的地方。

`System` 是无业务状态对象。它可以拥有配置、依赖服务或缓存型辅助结构，但不应该保存会影响游戏结果的跨帧业务状态。

`System` 可以：

1. 通过对应的 `InstanceOps` 读取和修改 `InstanceContainer` 中的 `Instance` 和 `data`。
2. 消费 `Intent`。
3. 读取 `Event`。
4. 产生新的 `Intent` 或 `Event`。

所有 `System` 都在 `Resolver` setup 阶段创建。运行中不应根据业务动态增加或减少 `System`。

`Resolver` 以 `System` 为单位推进本帧逻辑，而不是以“清空所有 Intent/Event 队列”为目标。这样可以避免单帧内出现不可控循环。

允许某些业务跨帧结算。如果本帧无法完成，应该把进度写入 `Instance`，下一帧继续处理，而不是强行在本帧循环到完成。

## 7. 依赖方向

为了让架构边界稳定，依赖方向应保持单向：

```text
Resolver
  ↓
System
  ↓
InstanceOps / ResolveContainer
  ↓
InstanceContainer / Intent / Event
  ↓
Instance / data
```

更具体地说：

1. `data` 不依赖 `Instance`、`System`、`Resolver`。
2. `Instance` 可以组合 `data`，但不引用其他 `Instance`。
3. `Intent/Event` 不依赖 `System`，也不长期引用 `Instance` 对象。
4. `InstanceOps` 可以依赖 `InstanceContainer` 和对应数据类型，但不依赖具体 `System`。
5. `System` 可以依赖数据结构定义和 `InstanceOps`，但数据结构不能反向依赖 `System`。
6. `Resolver` 依赖 `System` 列表，但不承载具体业务规则。

当两个业务模块需要通信时，优先通过 `Intent/Event` 或通过 `InstanceOps` 对 `InstanceContainer` 中状态的读写完成，而不是让两个 `System` 彼此直接调用。

## 8. System 执行顺序

`System` 的执行顺序是架构的一部分，应显式定义。

示例顺序：

```text
MovementSystem
CollisionSystem
CombatSystem
LifeCycleSystem
PresentationEventSystem
```

顺序的含义是：后面的 `System` 可以观察前面 `System` 在本帧产生的状态变化和事件。

不要让 `System` 的执行依赖隐式优先级或注册时机。顺序变化会改变游戏结果，因此应该集中声明、评审和测试。

## 9. 贯穿示例：角色移动

下面用“玩家控制角色移动，并触发碰撞事件”说明一次完整流转。

### 9.1 初始状态

`InstanceContainer` 中保存一个角色实例：

```text
CharacterInstance {
  id: "player-1"
  position: PositionData { x: 0, y: 0 }
  velocity: VelocityData { x: 0, y: 0 }
  radius: 0.5
}
```

地图障碍物也以某种 `Instance` 或全局 `data` 的形式存在于 `InstanceContainer` 中。

### 9.2 输入转为 Intent

本帧玩家按下向右移动键。

`Resolver` 在阶段一通过输入适配层收集输入，并向 `ResolveContainer` 写入：

```text
MoveIntent {
  characterId: "player-1"
  direction: Right
}
```

### 9.3 MovementSystem 消费 Intent

`MovementSystem` 读取 `MoveIntent`，通过 `CharacterInstanceOps.get(container, characterId)` 找到对应 `CharacterInstance`，根据速度、方向和 `deltaTime` 计算目标位置。

如果移动有效，它通过 `CharacterInstanceOps.updatePosition(container, characterId, position)` 修改角色位置，并产生：

```text
CharacterMovedEvent {
  characterId: "player-1"
  fromPosition: { x: 0, y: 0 }
  toPosition: { x: 1, y: 0 }
}
```

### 9.4 CollisionSystem 读取结果

`CollisionSystem` 可以读取本帧的 `CharacterMovedEvent`，也可以通过对应的 `InstanceOps` 查询 `InstanceContainer` 中的位置状态。

如果发现角色与障碍物碰撞，它可以：

1. 通过对应的 `InstanceOps` 修正角色位置。
2. 产生 `CollisionEvent`。

```text
CollisionEvent {
  subjectId: "player-1"
  obstacleId: "wall-1"
  contactPosition: { x: 0.8, y: 0 }
}
```

### 9.5 PresentationEventSystem 输出表现事件

表现层相关的 `System` 可以读取 `CharacterMovedEvent` 和 `CollisionEvent`，将其转换为动画、音效、震屏或 UI 所需的输出请求。

这些输出请求可以继续以 `Event` 表达，也可以交给引擎适配层处理。关键是：表现层不应该绕过 `InstanceContainer` 私自维护另一套会影响逻辑结果的状态。

### 9.6 本帧结束

本帧结束时：

1. `CharacterInstance.position` 留在 `InstanceContainer` 中，成为下一帧的初始状态。
2. `MoveIntent`、`CharacterMovedEvent`、`CollisionEvent` 在 `ResolveContainer.clear()` 时被移除。
3. 如果碰撞结果需要跨帧存在，例如“角色进入眩晕状态”，则必须写入某个 `Instance`，不能依赖 `CollisionEvent` 跨帧保存。

## 10. 放置规则

当开发者不确定某段代码应该放在哪里时，可以按下面规则判断。

### 10.1 放入 data

满足以下条件时，适合放入 `data`：

1. 只是描述数据，没有业务行为。
2. 可以被多个不同 `Instance` 复用。
3. 不需要知道自己属于哪个对象。
4. 不需要访问其他状态。

### 10.2 放入 Instance

满足以下条件时，适合放入 `Instance`：

1. 需要跨帧保存。
2. 属于某个游戏世界对象或长期存在的逻辑对象。
3. 可以通过 id 被查找。
4. 不需要通过对象引用直接连接其他 `Instance`。

### 10.3 放入 Intent

满足以下条件时，适合放入 `Intent`：

1. 表达一个本帧待处理请求。
2. 可能成功，也可能失败。
3. 来源可能是输入、回调、Tick 或其他 `System`。
4. 不应该跨帧保存。

### 10.4 放入 Event

满足以下条件时，适合放入 `Event`：

1. 表达一个本帧已经发生的事实。
2. 供后续 `System` 或表现层读取。
3. 不作为长期状态来源。
4. 本帧结束后可以丢弃。

### 10.5 放入 System

满足以下条件时，适合放入 `System`：

1. 需要判断规则。
2. 需要修改 `Instance`。
3. 需要消费 `Intent`。
4. 需要产生 `Event`。
5. 需要协调多个数据结构。

如果一段代码会改变游戏结果，它通常应该在某个 `System` 中，而不是藏在 `data`、`Instance` 或 `InstanceOps` 里。

## 11. 常见错误

### 11.1 在 Instance 中引用其他 Instance

这会形成隐式对象图，使修改路径难以追踪。应保存 id，并由 `System` 通过对应的 `InstanceOps` 查询。

### 11.2 在 InstanceContainer 中声明 CRUD 成员函数

`InstanceContainer` 不应该提供 `getCharacter`、`addProjectile`、`removeCharacter` 这类成员函数。CRUD 应声明为按数据类型分组的静态函数，例如 `CharacterInstanceOps.get(container, id)`。

### 11.3 在 InstanceOps 中写业务规则

`InstanceOps` 只负责某类 `Instance` 的存储、索引和查询，不负责判断业务规则。需要消费 `Intent`、产生 `Event`、协调多个业务过程的逻辑应放在 `System` 中。

### 11.4 在 data 或 Instance 中写业务函数

这会让状态和行为重新耦合，破坏“逻辑只在 System 中发生”的原则。

### 11.5 跨帧保存 Intent/Event

`Intent/Event` 只属于单帧解析过程。需要跨帧的信息应该转化为 `Instance` 状态。

### 11.6 System 之间直接互相调用

这会绕过 `Resolver` 的调度顺序，使执行流程变得隐式。应通过 `Intent/Event` 或 `InstanceOps` 对 `InstanceContainer` 的读写通信。

### 11.7 Resolver 承载业务逻辑

`Resolver` 应负责组织流程，不负责具体规则。业务判断应下沉到 `System`。

### 11.8 在回调链路中执行业务逻辑

引擎 callback 或玩家输入回调不应该直接修改 `InstanceContainer`，也不应该直接执行角色移动、技能释放、伤害结算等业务逻辑。

回调链路只负责把外部信号转成 `ResolveContainer` 中的 `Intent/Event`。业务逻辑必须进入 `Resolver` 阶段二，由固定顺序的 `System` 处理。

### 11.9 以清空队列作为本帧目标

如果本帧不断处理新产生的 `Intent/Event` 直到队列为空，容易形成死循环或不可控执行时间。应以固定 `System` 顺序推进为主。

## 12. 适用范围

本架构主要适用于游戏客户端逻辑层，包括：

1. 角色状态。
2. 技能和战斗结算。
3. 交互逻辑。
4. 关卡内规则。
5. UI 与逻辑之间的事件流。
6. 表现请求的产生。

它不试图完整替代：

1. 渲染引擎内部架构。
2. 物理引擎内部实现。
3. 资源加载系统。
4. 网络协议层。
5. 编辑器工具链。

这些系统可以接入本架构，但不必被强行改造成相同形态。边界原则是：只要某段代码会影响客户端游戏逻辑结果，就应该通过本架构中的状态和解析流程表达。

## 13. 最小实现轮廓

一个最小可运行版本只需要：

1. 一个 `InstanceContainer`。
2. 一个可复用的 `ResolveContainer`。
3. 一组固定顺序的 `System`。
4. 一个全局 `Resolver`。
5. 若干纯数据 `Instance`、`data`、`Intent`、`Event`。

伪代码：

```text
setup:
  instanceContainer = createInitialWorld()
  systems = [
    MovementSystem(),
    CollisionSystem(),
    CombatSystem(),
    PresentationEventSystem()
  ]
  resolver = Resolver(instanceContainer, systems)

tick:
  resolver.resolveFrame(engineCallbacks, userInputs, deltaTime)
```

其中 `resolveFrame` 内部必须维持三个阶段：先把外部信号数据化，再执行 `System`，最后输出并清理本帧数据。

这个最小轮廓可以随着项目增长扩展，但不应改变核心边界：跨帧状态集中在 `InstanceContainer`，单帧过程集中在 `ResolveContainer`，业务逻辑集中在 `System`，每帧入口集中在 `Resolver`。
