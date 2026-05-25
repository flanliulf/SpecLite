# IDE-specific Discovery Metadata（IDE 特定发现元数据）

`IDE-specific discovery metadata` 可以理解为：

某个 IDE 为了“发现、加载、展示或索引”一个 skill、command 或 workflow，而额外需要的适配层元数据。

它不是 skill 本身的定义内容，而是让特定 IDE 能识别这个 skill 的“入口说明”。

## SpecLite Boundary（SpecLite 中的边界）

**Canonical Skill Package（规范 Skill 包）**

这是统一标准内容，跨 IDE 必须严格一致，例如：

- `SKILL.md`
- `CHANGELOG.md`
- `references/`
- `assets/`
- `scripts/`
- `config.toml.example`
- `customize.toml`

这些属于 skill 定义本体，安装后应固化不变。

**IDE-specific discovery metadata**

这是某个 IDE 为了发现或调用这个 skill 需要的附加信息，例如：

- 某 IDE 要求的 manifest 或 index 条目
- 菜单项 metadata
- command pointer
- wrapper file
- capability catalog entry
- IDE 侧用于显示名称、分类、入口命令、加载路径的索引文件
- adapter 生成的 glue metadata

这些内容通常是 **Adapter Artifact（适配器产物）**，不应污染 canonical skill package。

## Concrete Example（具体例子）

```text
Canonical skill package:
  SKILL.md
  CHANGELOG.md
  references/
  assets/

Claude adapter 可能生成:
  .claude/skills/<skill>/SKILL.md
  .claude/.../某些加载索引或 metadata

Codex adapter 可能生成:
  .agents/skills/<skill>/SKILL.md
  .agents/.../某些 discovery metadata
```

其中 `SKILL.md` 内容应一致；但 `.claude` 或 `.agents` 为了让各自 IDE 发现这个 skill 而生成的索引、wrapper、pointer、metadata，可以不同。

## Related Subconcepts（相关子概念）

**Command pointer（命令指针）**

指向某个实际 skill、脚本或 CLI entrypoint 的轻量入口声明。它通常只告诉 IDE “调用什么命令、传什么参数、工作目录在哪里”，不包含完整 skill 定义。

Command pointer 适合用于 IDE 只需要一个可执行入口，而不需要复制完整 skill package 的场景。它属于 adapter artifact，不应改变 canonical skill package 的内容。

**Self-contained skill entry（自包含 skill 入口）**

指 IDE execution plane 中一个可以被该 IDE 直接发现和加载的完整 skill entry。它通常包含完整的 canonical skill package 内容，例如 `SKILL.md`、references、assets、scripts 和相关配置示例。

Self-contained skill entry 的关键是“自包含”：IDE 不需要再跳转到另一个位置读取 skill 定义本体。但这不意味着各 IDE 可以拥有不同 skill 内容；同一 canonical skill 在不同 IDE 中的自包含 entry 内容仍应严格一致。

**Wrapper file（包装文件）**

指 IDE adapter 为满足某个 IDE 的加载、命令调用或菜单机制而生成的薄包装文件。它可能负责转发到真实 CLI、设置参数、桥接路径，或把 IDE 要求的入口格式转换成 SpecLite 的稳定入口。

Wrapper file 不应承载 skill 语义，也不应复制或改写 `SKILL.md` 的核心说明。它属于 IDE-specific discovery metadata 或 adapter artifact。

**Capability catalog entry（能力目录条目）**

指 IDE 或工具链用于展示、搜索、分组、索引能力的目录记录。它可能包含 skill id、显示名、分类、描述、入口路径、支持的命令或可用能力标签。

Capability catalog entry 的作用是帮助 IDE 发现和呈现能力，不负责定义 skill 的实际执行规则。执行规则仍应来自 canonical skill package 和稳定 runtime entry。

## Subconcept Boundaries（子概念边界）

这些子概念可以按职责区分：

- `self-contained skill entry`: 提供完整 skill 定义内容，必须保持 canonical 内容一致。
- `command pointer`: 指向已有执行入口，不定义 skill 内容。
- `wrapper file`: 适配 IDE 调用机制，负责桥接和转发。
- `capability catalog entry`: 提供发现、展示和索引用元数据。

除 self-contained skill entry 中承载的 canonical package 内容外，其余子概念都应被视为 adapter artifact，不参与 canonical skill package hash。

## Key Rules（关键规则）

**IDE-specific discovery metadata 不定义 skill 的语义，只帮助某个 IDE 找到、展示或调用 skill。**

所以它应该：

- 由 IDE adapter 生成；
- 不参与 canonical skill package hash；
- 单独记录 adapter artifact hash；
- 不改变 `SKILL.md`、references、assets 等规范包内容；
- 不改变 customization key；
- 不成为跨 IDE 统一标准的一部分。
