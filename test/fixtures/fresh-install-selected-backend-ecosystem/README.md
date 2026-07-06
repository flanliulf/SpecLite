# Fresh Install Selected Backend Ecosystem Fixture（选择后端生态的 Fresh Install Fixture）

该 fixture 证明选择 `ecosystem-backend-java-springboot` 时，default `core` + `sdlc` baseline 保持为依赖闭包，只有选中的 backend ecosystem Skill 进入安装结果。

Release gate 必须断言：

- `speclite-brownfield-java-springboot-backend-tech-stack-digger` 出现在 IDE mirrors、skill index、help index、phase coverage 和 files index。
- 同 category 未选 modules（Node.js / Python）不出现。
- 跨 category 未选 modules（React / npm-package）不出现。
- `support-skills` 不进入目标项目安装面。
