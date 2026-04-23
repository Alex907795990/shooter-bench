# 
* 本项目是一个初创项目，不需要考虑兼容性，不要迁就已有代码。
* 每次完成一个可验证里程碑后，必须及时更新 `docs/sessions/` 下最新的 session 进度文件，记录：已完成、待处理、风险/阻塞。
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.
- Always ouput in simplified chinese
# 项目工作流程

本项目使用 **Form-Based 编程方法论**。任何代码改动前必须执行：

1. 阅读 [METHODOLOGY.md](METHODOLOGY.md)
2. **先识别领域**：使用 [forms/Domain.md](forms/Domain.md) 中的「领域识别决策树」，确定本次改动属于哪个领域（已有领域 / `_Shared` / `_Frame` / 需要新建领域）
3. **再识别形态**：使用 METHODOLOGY 中的「形态识别决策树」，确定本次改动属于哪种形态
4. 阅读 [forms/Domain.md](forms/Domain.md) 与对应的 [forms/<Form>.md](forms/)
5. 严格按该形态的「允许能力」「禁止事项」「可调用形态」编写代码
6. 改动跨多个形态/领域时，逐个加载对应文档

## 命名与路径约定

- 领域目录：`src/<DomainName>/`（PascalCase，如 `Combat/`）
- 共享层：`src/_Shared/`
- 主循环：`src/_Frame/`
- 形态子目录：`src/<Domain>/<Form>/`
- 文件名带形态后缀（Data 除外）：`*Resolver.ts` / `*Applier.ts` 等

修改某文件前，先看路径，确定领域 + 形态。

## 兜底规则（重要）

如果遇到以下情况，**停下来询问用户**，不要自行决定：

- 本次改动不属于任何已定义形态
- 本次改动不属于任何已定义领域，且不确定该归入已有领域、放进 `_Shared` 还是新建领域
- 本次改动看起来像「在某形态里做该形态禁止的事」
- 不确定该把代码放在哪个形态/领域目录
- 现有代码已经违反了它所属形态的规则，不知该改代码还是改归属
- 跨领域反馈延迟（1 帧）对当前需求不可接受

绝不发明新形态，绝不越界，绝不引入"多 pass 收敛"等绕过规则的机制。方法论的可靠性来自显式承认例外，而不是悄悄打破规则。
