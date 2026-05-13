<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Framework Adapter — MyBatis-Plus

> 适用于 `extract_data_models.py` 的 Java 分支。本文档定义 MyBatis-Plus 实体识别规则，
> 是 Mechanism 2（AST + 框架适配器）的契约文档，对应 KFP-003 的根本性修复。

---

## 1. 抽取目标

从 `*.java` / `*.kt` 源文件识别 ORM 实体类：

- **JPA 分支**：`@Entity` / `@Table(name="...")`
- **MyBatis-Plus 分支**：`@TableName("foo")` / `@TableId` / `@TableField`

两个分支独立运行，分别打 `orm = "jpa" | "mybatis-plus"` 标签，便于下游统计。

---

## 2. 识别规则

| 注解 | 提取字段 | 示例 |
|:----|:--------|:-----|
| `@TableName("user")` | `table_name = "user"` | `@TableName(value="user_info")` 也支持 |
| `@TableId` | 主键字段 | `@TableId(value="id", type=IdType.AUTO)` |
| `@TableField("xxx")` | 字段映射 | 不强制；用于覆盖驼峰映射 |
| 类名（PascalCase） | `model_name` | `UserInfo` |

输出记录形如：

```json
{
  "model_name": "UserInfo",
  "table_name": "user_info",
  "fields": [...],
  "orm": "mybatis-plus",
  "source_file": "dao/entity/UserInfo.java",
  "source_of_truth": "code",
  "confidence": "high"
}
```

---

## 3. 路径启发（is_model_file）

`should_scan` 判定一个 Java 文件是否值得扫描，依据：

- 类路径含 `entity` / `entities` / `model` / `models` / `domain` / `dao` / `po` / `do`
- 类名后缀为 `Entity` / `PO` / `DO` / 或类内首注解为 `@TableName`
- `pom.xml` / `build.gradle` 包含 `mybatis-plus-boot-starter` 时，`dao/entity/`
  路径自动纳入扫描白名单。

---

## 4. 已知盲区

- 嵌套静态实体（内部类）
- Kotlin `data class` + `@TableName` — 已支持，但字段抽取不完整
- 通过 XML mapper 定义的 ResultMap（不在本适配器范围）
- DTO/VO 与 Entity 混用同一目录时可能误抽 — 由 gaps.json 暴露

---

## 5. 防御机制对应

- **M1 覆盖率契约**：任何 `dao/entity/*.java` 命中扫描但抽出 0 实体 → 进入
  `evidence/data-model-inventory.gaps.json`。
- **M2 适配器契约**：本文件。
- **KFP-003 防御**：当 `tech-stack-strict.json` 含 `MyBatis-Plus` 但
  data-model-inventory 中 `orm == "mybatis-plus"` 的记录数为 0 时，验证器报错（不是警告）。
- **M7 依赖白名单联动**：MyBatis-Plus 的存在由 `pom.xml` 中的
  `mybatis-plus-boot-starter` 严格判定，不依赖源码模糊匹配。

---

## 6. 验证用 fixture（建议放在 `golden/mybatis-plus-basic/`）

```java
// dao/entity/UserInfo.java
@TableName("user_info")
public class UserInfo {
    @TableId(value="id", type=IdType.AUTO) private Long id;
    @TableField("user_name") private String userName;
}
```

期望抽取：

```json
{
  "model_name":"UserInfo",
  "table_name":"user_info",
  "orm":"mybatis-plus",
  "fields":[{"name":"id","is_primary":true},{"name":"userName","db_column":"user_name"}]
}
```
