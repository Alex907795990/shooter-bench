---
name: game-client-code-shape-paradigm
description: Use when writing, reviewing, refactoring, or classifying game engine client code that should be forced into the closed shapes Schema, Pure, Store, Select, Loop, Task, Entry, Output, Port, Gateway, and Boot before implementation.
---

# Game Client Code Shape Paradigm

## 目标

把游戏客户端代码限制在有限、封闭、可机械判定的主形态集合中。先判定形态，再允许实现；如果主形态判不稳，先拆分，不要先写再解释。

## 何时使用

- 新增、修改、review、重构游戏引擎客户端代码，且需要先判断文件该落在哪种主形态
- 一个文件同时碰到外部回调、宿主对象、tick、有限流程、权威状态、效果输出中的多项能力
- 需要解释“为什么它不是相邻形态”
- 不用于编辑器工具、构建脚本、内容生产流水线、服务端代码

## 使用方式

1. 先判主形态。一个文件或模块只能有一个主形态；判定链不稳定时先拆分。需要判定顺序时，读 [references/shape-classification.md](references/shape-classification.md)。
2. 再查该形态允许做什么、禁止做什么、文件该如何命名。需要各形态细则时，读 [references/shape-rules.md](references/shape-rules.md)。
3. 涉及跨形态交互时，只按正式通信形态和依赖矩阵落边界。需要边界规则时，读 [references/dependency-and-communication.md](references/dependency-and-communication.md)。
4. 实现前输出归类结论，实现后逐项自检。需要固定模板和一票否决项时，读 [references/implementation-checklist.md](references/implementation-checklist.md)。
5. 不要默认加载全部 reference；只读取当前决策需要的那一份。
## 注意事项
* 形态划分是在特定领域中的，不代表一个项目只能有一个boot/entry/port等，形态划分是竖向分割，而功能领域是横线分割，不能混为一谈。
* 一个代码文件应该有：单一的形态、单一的领域、单一的职责，禁止跨领域的复杂职责、禁止上帝类

## 不可退让的规则

- 按能力归类，不按业务名词归类。
- 高优先级形态一旦命中，不允许人为降级解释。
- 一段代码同时命中两个高风险形态，结论是拆分。
- `Output` 只决定效果请求，`Gateway` 才能接触宿主不可见对象；一段代码若同时做这两件事，必须拆成 `Output + Gateway`。
- `Select` 必须只读、可重算、无独立生命周期；过程真相回到对应领域的 `Store`。

## 快速导航

- 要判断“它到底是什么”：读 [references/shape-classification.md](references/shape-classification.md)
- 要判断“它能做什么、不能做什么”：读 [references/shape-rules.md](references/shape-rules.md)
- 要判断“它允许依赖谁、边界如何通信”：读 [references/dependency-and-communication.md](references/dependency-and-communication.md)
- 要判断“是否可以开始实现或宣称完成”：读 [references/implementation-checklist.md](references/implementation-checklist.md)
