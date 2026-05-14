<!-- markdownlint-disable MD004 MD012 MD024 MD031 MD032 MD040 MD060 -->

# Framework Adapter — Spring MVC / Spring Boot

> 适用于 `extract_api_inventory.py` 的 Java/Kotlin 分支。本文档定义 Spring MVC
> Controller 的端点抽取规则、覆盖范围与已知盲区，是 Mechanism 2（AST + 框架适配器）
> 的契约文档。

---

## 1. 抽取目标

从 `*.java` / `*.kt` 源文件中识别 HTTP 端点：

- 类级 `@RequestMapping` → `class_prefix`
- 方法级 `@GetMapping` / `@PostMapping` / `@PutMapping` / `@PatchMapping` /
  `@DeleteMapping` / `@RequestMapping` → `method_path` + `method`
- 输出端点 = `class_prefix + method_path`，并保留两个原始字段供溯源。

---

## 2. 实现策略（当前版本：行扫描状态机）

为避免引入 `javaparser` / `tree-sitter-java` 等重依赖，当前实现使用
"先按类声明切片，再正则匹配类前缀"的轻量状态机：

1. `SPRING_CLASS_PATTERN` 定位首个 `class XYZ {`。
2. 在该位置之前的"头部"中匹配 `SPRING_CLASS_MAPPING_PATTERN`，提取
   `@RequestMapping("/lucky")` / `@RequestMapping(value="/lucky")` 中的路径。
3. 类内方法级注解使用 `SPRING_MAPPING_PATTERN` 匹配，与 `class_prefix` 拼接。
4. 类级 mapping 自身额外作为一条 `ANY` 端点入库，便于下游展示根入口。

> 局限：单文件多 Controller 类、`@RequestMapping` 写在 abstract 父类的场景
> 当前不支持，会被忽略并由 Mechanism 1 的 `gaps.json` 暴露。

---

## 3. 覆盖矩阵

| Spring 注解 | 是否抽取 | 输出 method | 备注 |
|:-----------|:--------|:-----------|:-----|
| `@RestController` / `@Controller` | 不直接抽 | — | 仅作为容器 |
| `@RequestMapping`（类级） | 是 | `ANY` | 作为 `class_prefix` |
| `@RequestMapping`（方法级，无 method=） | 是 | `ANY` | 与类前缀拼接 |
| `@GetMapping` / `@PostMapping` / ... | 是 | 对应大写 | 与类前缀拼接 |
| `@RequestMapping(method = RequestMethod.GET)` | 部分 | `ANY` | method 解析不完整，下版迭代 |
| `value = {"/a", "/b"}` 多路径数组 | 仅取首个 | — | 已知盲区 |
| `@FeignClient` 客户端调用 | 否 | — | 不属于服务端端点 |

---

## 4. 已知盲区（必须在 gaps.json 中暴露）

- 父类 `@RequestMapping` 继承
- `@RequestMapping(method = ...)` 数组形式
- Kotlin DSL 风格 `routing { get("/x") { ... } }`（非 Spring，归 Ktor）
- 路径变量带正则约束（`/{id:\\d+}`）— 抽取出但保留原文

---

## 5. 防御机制对应

- **M1 覆盖率契约**：任何被 `should_scan` 命中但抽出 0 端点的 Controller，必须出现
  在 `evidence/api-inventory.gaps.json#/gaps` 中。
- **M2 适配器契约**：本文件即 Spring 适配器契约。任何 Spring 项目跑完后，应该
  对照"覆盖矩阵"复核漏抽率。
- **KFP-002 防御**：类前缀必拼，否则视为 silent_drop。

---

## 6. 验证用 fixture（建议放在 `golden/spring-mvc-basic/`）

```java
// LuckyController.java
@RestController
@RequestMapping("/lucky")
public class LuckyController {
    @GetMapping("/list") public List<X> list() { ... }
    @PostMapping("/addActivity") public R add(@RequestBody A a) { ... }
}
```

期望抽取：

```json
[
  {"endpoint":"/lucky","method":"ANY","class_prefix":"/lucky","method_path":""},
  {"endpoint":"/lucky/list","method":"GET","class_prefix":"/lucky","method_path":"/list"},
  {"endpoint":"/lucky/addActivity","method":"POST","class_prefix":"/lucky","method_path":"/addActivity"}
]
```
