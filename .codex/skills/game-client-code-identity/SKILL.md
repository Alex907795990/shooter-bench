---
name: game-client-code-identity
description: Use when writing, reviewing, refactoring, or classifying game engine client code that should follow a closed identity model for Type, Rule, State, System, UseCase, Query, Presenter, Adapter, Bridge, Port, and Bootstrap.
---

# Game Client Code Identity

## 目标

把游戏客户端代码限制在有限、封闭、可检查的身份集合中。目标不是让代码“看起来更优雅”，而是防止 AI 把状态推进、表现控制、引擎回调和外部副作用混写在一起。

## 何时使用

- 新增或修改游戏引擎客户端代码，且需要先判断这段代码属于什么身份
- review 或重构中发现 `utils`、`helper`、`service`、`manager`、`common`、`misc` 一类兜底归宿
- 一个文件同时碰到状态、逐帧推进、UI 表现、引擎生命周期、外部 IO 等多种职责
- 需要解释“为什么它不是相邻身份”
- 不用于编辑器工具、构建脚本、内容生产流水线、服务端代码

## 使用方式

1. 先判主身份，再允许实现。一个文件或模块只能有一个主身份；如果同时命中多个主身份，先拆分。需要判定顺序时，读取 [references/identity-classification.md](references/identity-classification.md)。
2. 在实现或 review 前，确认该身份的职责、禁止项、依赖矩阵和正式通信通道。需要边界细则时，读取 [references/identity-rules.md](references/identity-rules.md)。
3. 在开始实现前完成预检，在实现后完成自检。需要固定问答模板、命名建议和完成标准时，读取 [references/implementation-checklist.md](references/implementation-checklist.md)。
4. 按需读取 reference。不要默认把三份 reference 全部加载进上下文。

## 不可退让的规则

- 身份按“拥有的能力”判定，不按作者主观语义判定。
- 高权限身份优先；如果高权限身份让文件过重，结论是拆分，不是降级归类。
- 如果实现必须突破依赖矩阵，优先判断为身份错误或边界拆分不足。
- `Command` 和 `Event` 是协议形态，归类为 `Type`，不是执行身份。
- 命中禁止项时，把问题视为结构错误，而不是风格争议。

## 快速导航

- 要判断“它到底是什么”：读 [references/identity-classification.md](references/identity-classification.md)
- 要判断“它能做什么、不能依赖谁”：读 [references/identity-rules.md](references/identity-rules.md)
- 要判断“是否可以开始实现或宣称完成”：读 [references/implementation-checklist.md](references/implementation-checklist.md)
