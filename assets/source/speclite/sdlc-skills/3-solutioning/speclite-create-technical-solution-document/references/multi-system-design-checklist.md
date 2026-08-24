# Multi-system Design Checklist（多系统设计检查清单）

## Responsibility Matrix（职责矩阵）

每个参与系统至少记录：

| 字段 | 要求 |
|---|---|
| System / Component | 稳定名称与简称 |
| Owner | 团队、服务或外部责任方 |
| Responsibility | 本需求中的单一职责 |
| Change | `Changed` / `Unchanged` / `External` |
| Dependency | 上游、下游及阻塞关系 |
| Data Responsibility | producer、processor、system of record 或 consumer |
| Operational Owner | 告警、故障和升级责任 |

禁止使用“平台负责处理”“服务完成对接”这类无边界表述。必须说明输入、输出、成功条件和不负责的范围。

## Interaction Contract（交互契约）

每条跨系统交互检查：

- Direction：谁发起、谁接收，主动还是被动。
- Transport：HTTP / RPC / Event / MQ / Webhook / File / Batch。
- Mode：同步、异步、请求响应、发布订阅或轮询。
- Authority：OpenAPI / AsyncAPI / Apifox / YAPI / schema registry / owning SPEC 的链接与版本。
- Identity：authentication、authorization、tenant、service identity。
- Payload：关键字段、数据分类、字段 owner 和兼容策略；完整 schema 不复制进正文。
- Semantics：成功标准、错误码、业务错误、重复请求和顺序要求。
- Resilience：timeout、retry、backoff、circuit breaker、idempotency、deduplication、compensation。
- Observability：correlation id、metric、log、trace、alert 和 dashboard owner。
- SLO：availability、latency、throughput、RPO / RTO 或明确 `N/A` 理由。

## Failure Matrix（失败矩阵）

至少覆盖：

| Failure | Detection | Immediate Behavior | Retry / Compensation | User Impact | Owner | Verification |
|---|---|---|---|---|---|---|

重点检查上游超时、下游限流、重复消息、乱序、部分成功、认证失效、schema 不兼容、数据落库成功但通知失败、外部系统长期不可用和人工恢复。

## Data Boundary（数据边界）

- 标明 system of record，禁止多个系统同时被描述为同一事实的最终 owner。
- 标明 PII、credential、token、敏感业务数据和跨境/跨租户边界。
- 说明传输与静态加密、脱敏、最小字段、保留周期、删除和审计。
- 说明一致性模型、时间窗口、时钟与时区、数据补偿和 reconciliation。

## Compatibility and Rollout（兼容与发布）

- API / Event change 必须说明 backward / forward compatibility。
- 说明 producer-first、consumer-first、dual-write、dual-read 或 expand-contract 顺序。
- 说明 Feature Flag、灰度范围、版本协商、rollback 与旧数据处理。
- 外部系统无法同步发布时，必须给出过渡协议和退出条件。
