# Experiment Notes（实验备注）

## 2026-09-11 — Restart Decision（重启决策）

- 实时判断：1.0 / 1.1 实现把「目录归属」做成了「产物认证 + 审批重放引擎」（首版 1791 行、24+10+2 轮 CR、234 个产物），正面撞上 AC12；根因是 AC9 把 current round / unfinished run 判定交给 resolver 且没有威胁模型边界。
- 设计不变量：只看直接子文件名，不读文件内容；「目录存在 series S 的未完成 run」⇔ 存在 S 的 v2 summary 且不存在 S 的 v2 finalizer；series-less 文件（legacy v1）不参与判定；归档子目录不参与判定。
- 位置不变量：逻辑在 `src/config/`，CLI 在 `speclite resolve`，Skill 只调 CLI；与 11.1 / 11.5 同构。
- 用户介入点：无。决策 A / B / C 已裁决；CR02 对 out-of-scope finding 引用 Story Threat Model 章节归 `dismiss`。

## 2026-09-11 — Corpus Observation（语料观察）

- 实时判断：现存 182 个 summary 文件全部为 series-less legacy 命名（`-{YYYYMMDD}-round-{n}.md`），只有 3 个 finalizer 与 11.9 归档中的 evidence-v2 / directory-routing 系列使用 v2 命名。因此对既有 Story 目录，resolver 会判定「无 v2 未完成 run」→ canonical 新 run；这与契约 `:76` 一致，且不影响 AC12。
- 用户介入点：无。
