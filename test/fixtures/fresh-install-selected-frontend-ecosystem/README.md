# Fresh Install Selected Frontend Ecosystem Fixture（选择前端生态的 Fresh Install Fixture）

该 fixture 证明选择 `ecosystem-frontend-react` 时，只安装 React ecosystem Skill，Vue、backend、other 和 support packages 不进入目标项目安装结果。

Release gate 必须断言 selected ecosystem counts 由实际 selected module package roots 推导，而不是复用 default no-ecosystem 的固定总数。
