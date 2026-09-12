---
name: speclite-domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
allowed-tools: Read, Write, Bash, Grep, Glob
metadata:
  version: "1.0.0"
  author: "fancyliu"
  catalog: "speclite"
---

# Domain Modeling（领域建模）

在设计过程中主动构建并打磨项目的 domain model。这是一项 *主动* 的实践——质疑术语、构造 edge-case scenarios，并在 glossary 和 decisions 一旦明确时立即将其写下。（仅仅为了词汇而 *读取* `CONTEXT.md` 并不属于本 Skill——那只是任何 Skill 都能做到的一行习惯。本 Skill 用于改变 model，而不只是使用它。）

## File structure（文件结构）

大多数仓库只有一个 context：

```
/
├── _speclite-output/
│   └── planning-artifacts/
│       └── architecture/
│           ├── CONTEXT.md
│           └── adr/
│               ├── 0001-event-sourced-orders.md
│               └── 0002-postgres-for-write-model.md
└── src/
```

如果 `_speclite-output/planning-artifacts/architecture/` 下存在 `CONTEXT-MAP.md`，该仓库就有多个 contexts。该 map 指向每个 context 所在的位置：

```
/
├── _speclite-output/
│   └── planning-artifacts/
│       └── architecture/
│           ├── CONTEXT-MAP.md
│           └── adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   └── CONTEXT.md
    └── billing/
        └── CONTEXT.md
```

延迟创建文件——仅在有内容可写时才创建。如果不存在 `CONTEXT.md`，就在第一个术语确定时创建。如果不存在 `_speclite-output/planning-artifacts/architecture/adr/`，就在需要第一个 ADR 时创建。

## During the session（会话期间）

### Challenge against the glossary（对照术语表提出质疑）

当用户使用的术语与 `CONTEXT.md` 中的现有语言冲突时，立即指出。“你的 glossary 将 'cancellation' 定义为 X，但你现在似乎指的是 Y——到底是哪一个？”

### Sharpen fuzzy language（明确模糊语言）

当用户使用模糊或含义过多的术语时，提出一个精确的 canonical term。“你说的是 'account'——你指的是 Customer 还是 User？它们是不同的事物。”

### Discuss concrete scenarios（讨论具体场景）

讨论 domain relationships 时，使用具体场景对其进行 stress-test。构造能够探查 edge cases 的场景，迫使用户精确说明 concepts 之间的边界。

### Cross-reference with code（与代码交叉核对）

当用户说明某事如何运作时，检查代码是否与之相符。如果发现矛盾，就指出来：“你的代码会取消整个 Orders，但你刚才说 partial cancellation 是可行的——哪一个才是正确的？”

### Update CONTEXT.md inline（即时更新 CONTEXT.md）

术语一旦确定，就立即更新 `CONTEXT.md`。不要批量处理——在术语确定时随即记录。使用 [CONTEXT-FORMAT.md](./references/CONTEXT-FORMAT.md) 中的格式。

`CONTEXT.md` 应完全不包含 implementation details。不要把 `CONTEXT.md` 当作 spec、scratch pad 或 implementation decisions 的存储库。它只是 glossary，除此之外什么都不是。

### Offer ADRs sparingly（谨慎提出 ADR）

仅当以下三个条件全部成立时，才提出创建 ADR：

1. **Hard to reverse（难以逆转）**——之后改变主意的成本很大
2. **Surprising without context（缺少上下文时令人意外）**——未来的读者会疑惑“他们为什么要这样做？”
3. **The result of a real trade-off（真实权衡的结果）**——确实存在不同方案，并且你出于具体原因选择了其中一个

如果缺少其中任何一个条件，就跳过 ADR。使用 [ADR-FORMAT.md](./references/ADR-FORMAT.md) 中的格式。

[Generation Metadata（生成信息）]
    本 Skill 由 speclite-skill-creator 自动生成。如需修改，必须同步更新 SKILL.md 与 SKILL.en.md，并同步 `assets/source/speclite/core-skills/speclite-domain-modeling/` 与实际安装副本。
