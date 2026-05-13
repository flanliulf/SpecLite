<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Golden Regression Suite

> Mechanism 6 实现：每个子目录是一个最小可重现 fixture，回放抽取脚本与
> `expected/*.expected.json` 进行子集匹配。任何未来对抽取器的"重构"必须
> 先通过这里。

## fixtures

| 目录 | 关注点 | 关联 KFP |
|:----|:-----|:--------|
| `spring-mvc-basic/` | 类前缀 `@RequestMapping` 必拼接 | KFP-002 |
| `mybatis-plus-basic/` | `@TableName` 必识别 | KFP-003 |

## 运行

```bash
python3 {skill-root}/scripts/run_golden.py {skill-root}/golden
```

退出码 0 = 全部通过；非 0 = 漂移。

## 添加新 fixture

1. 新建 `<name>/` 子目录，放最小源码与 `pom.xml`/`package.json`（如需）。
2. 新建 `<name>/expected/<inventory>.expected.json`，只列必须存在的关键事实。
3. 比对器使用"子集匹配"——expected 内的每条记录必须能在实际产出中找到，
   反之不要求。
