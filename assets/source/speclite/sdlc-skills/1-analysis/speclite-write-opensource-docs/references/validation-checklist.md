# Validation Checklist（验证清单）

## Structure（结构）

- [ ] `docs/index.md` 能发现新增或迁移的文档。
- [ ] 目录级 `index.md` 已同步。
- [ ] 文档类型符合 Diataxis 职责。
- [ ] 旧 package-facing 入口未被破坏。
- [ ] 项目 `docs/_STYLE_GUIDE.md` 已读取；如缺失，已使用 `references/docs-style-guide-baseline.md` 并记录缺口。

## Style（风格）

- [ ] 正文中文，章节标题 English（中文）。
- [ ] 技术标识、命令、路径、字段名保留英文。
- [ ] 不使用 Starlight-only admonition。
- [ ] 表格单元格和列表项保持短句。
- [ ] 不用非代码 code block 包装普通说明。

## Evidence（证据）

- [ ] 文档中的命令、目录、字段来自真实 repo 或已明确标注为目标规范。
- [ ] 不把未来计划写成当前能力。
- [ ] 对实现状态的判断能回链到代码、fixture、README 或 package metadata。

## Commands（命令）

最低验证：

```sh
git diff --check
```

按变更范围选择：

```sh
npm test
npm run release:check
```

仅在 `package.json` 已定义时运行：

```sh
npm run docs:fix-links
npm run docs:validate-links
npm run docs:build
```
