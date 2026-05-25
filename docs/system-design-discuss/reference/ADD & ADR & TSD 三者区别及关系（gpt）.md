---
author: fancyliu
created: "2026-01-05 19:27"
fro: local
source: local
tags:
title: ADD & ADR & TSD 三者区别及关系（gpt）
updated: "2026-04-16 18:25"
---
下面把 **ADD / ADR / TSD** 的区别与关系再压缩总结一遍，用同一套坐标系讲清楚（“是什么、回答什么问题、放哪里、怎么互相引用”）。

## 1 一句话定位

- **ADD（架构设计文档）**：系统的**架构蓝图/基线**——规定“系统应该长什么样、长期怎么运作”
- **ADR（架构决策记录）**：关键选择的**决策账本**——解释“为什么这么选、没选什么、代价是什么”
- **TSD（技术方案文档）**：一次需求/项目的**施工图**——说明“这次具体怎么做、怎么上线、怎么验证”

## 2 核心区别（最关键的 3 个维度）

### 2.1 范围与抽象层级

- **ADD：系统级（高抽象）**
    模块/服务边界、核心机制（鉴权、限流、容灾、观测）、数据策略、集成方式、质量属性等。

- **ADR：决策点级（中高抽象）**
    只聚焦一个关键决策（例如“消息系统选型”“一致性策略”“租户隔离模型”）。

- **TSD：需求/项目级（中低抽象）**
    具体接口、表结构、流程时序、异常处理、迁移、灰度回滚、测试计划等。

### 2.2 时间尺度与稳定性

- **ADD：中长期稳定**（随架构演进更新）
- **ADR：长期可追溯**（像日志一样记录；被替代而非反复改）
- **TSD：短期迭代**（需求结束后主要用于追溯与复盘）

### 2.3 “决策” vs “实现”

- **ADD**定**规则/约束**（架构轨道）
- **ADR**定**关键取舍的理由**（为什么在这条轨道上）
- **TSD**做**落地实现**（按轨道开车到目的地）

## 3 它们怎么协同（推荐闭环）

最通顺的实践链路是：

1. **ADD 作为架构基线**：先有共识的整体架构与约束（或持续补齐）
2. 写 **TSD** 做需求设计时，遇到**长期影响/不可逆/跨团队/高争议/引入新基建**的点
    → **产出或引用 ADR**（把关键决策从“方案讨论”升级为“可追溯决策”）

3. ADR 被接受后
    → **ADD 更新**：把新的原则/机制沉淀为基线，并挂上 ADR 链接

4. **TSD 引用 ADD/ADR**：证明本次实现遵循基线；若例外必须说明并（通常）出 ADR

一句话流程：**TSD 触发决策 → ADR 记录并定案 → ADD 沉淀为长期规则 → 后续 TSD 复用规则。**

## 4 ADR 是补充谁？出现在谁里面？

- **ADR 本体应独立存放（推荐 `docs/adr/`）**
- **ADD / TSD 只“引用” ADR**：
    - ADD 引用 ADR：说明“这条架构规则从哪来、为什么”
    - TSD 引用（或新增）ADR：说明“本次关键取舍已记录、可复用、可替代”

## 5 快速判断写哪种文档

- **只影响本次需求、偏实现细节** → 写进 **TSD**
- **会影响后续很多需求/难回滚/跨团队** → 出 **ADR**（并在需要时更新 ADD）
- **系统长期机制、通用约束、全局基线** → 放进 **ADD**

下面把这套关系用一个“示例需求”（比如“新增异步导出功能”）演示：ADD 写哪些章节、TSD 写哪些具体细节、哪些点应该独立成 ADR。

---

用一个很常见的需求做演示：**“新增【异步导出】能力：用户在后台筛选出一批数据（客户/订单等），点击导出后后台异步生成文件，完成后给出下载链接。”**
你会看到：哪些内容应该写进 **ADD（基线）**、哪些是 **TSD（本次落地）**、哪些点应该单独升格为 **ADR（关键决策）**，以及它们如何互相引用。

## 6 目录结构示例（建议）

```text
docs/
  ADD.md
  adr/
    ADR-0007-async-job-framework.md
    ADR-0008-export-file-storage.md
  tsd/
    TSD-async-export-20260105.md
```

## 7 ADD 示例（只展示“与异步导出相关”的架构基线片段）

> 重点：ADD 不写本次需求的接口/表细节，而是沉淀**通用机制与约束**（异步任务模型、幂等、观测、存储策略等），并挂 ADR 索引。

```md
# 架构设计文档（ADD）- 运营后台平台（节选）

## 4. 架构原则与约束（节选）
- P3：长耗时任务必须异步化，不得阻塞 HTTP 请求线程
- P4：跨服务/跨存储写入需要明确一致性策略（优先 Outbox / 最终一致补偿）
- P5：所有异步任务必须具备幂等、可重试、可观测（traceId / metrics / audit）

## 7. 架构视图（节选）
### 7.2 容器/服务视图（节选）
| 服务/组件 | 职责 |
|---|---|
| admin-api | 提供后台接口（创建导出任务、查询任务状态、获取下载链接） |
| job-worker | 执行异步任务（消费队列/拉取任务、生成文件、更新状态） |
| object-storage | 文件存储（导出文件、临时文件） |
| message-broker | 异步任务队列（任务触发、重试、DLQ） |

## 9. 接口与集成（节选）
### 9.1 幂等与去重
- 客户端可传 `Idempotency-Key`；服务端以（用户 + 业务类型 + key）确保同一请求不会创建重复任务
- 所有 worker 的任务执行必须幂等：同一 taskId 重复消费不得生成多个最终文件

### 9.2 超时/重试/死信
- worker 消费失败允许重试（指数退避 + 最大次数）
- 超过最大重试进入 DLQ，并触发告警

## 11. 可观测性（节选）
- 必须暴露：任务创建数、成功数、失败数、重试次数、队列堆积、任务执行耗时 P95/P99
- 关键日志必须包含：taskId、requestId/traceId、operatorId

## 14. 架构决策记录索引（ADR Index）
| ADR 编号 | 标题 | 状态 | 日期 | 链接 |
|---|---|---|---|---|
| ADR-0007 | 异步任务框架实现方式（MQ 驱动 vs DB 轮询） | Accepted | 2026-01-05 | ./adr/ADR-0007-async-job-framework.md |
| ADR-0008 | 导出文件存储与分发方案（对象存储 + 预签名 URL） | Accepted | 2026-01-05 | ./adr/ADR-0008-export-file-storage.md |
```

**你会看到：ADD 里不会出现**

- “导出任务表有哪些字段”
- “/exports 接口请求体长什么样”
- “本次要导出客户还是订单、CSV 列有哪些”

这些属于 TSD。

## 8 ADR 示例（把“长期/争议/不可逆”的关键点单独记录）

### 8.1 ADR-0007：异步任务框架实现方式

> 这是典型 ADR：会影响所有后续异步任务（导出、批量导入、群发、报表生成……），属于平台级决策。

```md
# ADR-0007：异步任务框架实现方式（MQ 驱动 vs DB 轮询）

## 1. 元信息
- 状态：Accepted
- 日期：2026-01-05
- 相关 ADD：../ADD.md
- 相关 TSD：../tsd/TSD-async-export-20260105.md

## 2. 背景与问题
我们需要为后台提供统一的长耗时任务能力（导出/批处理等）。
当前候选方案：
- 方案 A：任务写入 DB 后由 worker 定时轮询拉取待执行任务
- 方案 B：任务写入 DB，同时投递 MQ 消息触发 worker 消费执行（DB 作为任务状态源）

约束：
- 任务量峰值存在波动；需要弹性扩缩
- 需要失败重试、死信处理、可观测
- 需要保证“任务状态”可追溯与可查询（以 DB 为准）

## 3. 决策驱动因素
- 可扩展性与吞吐
- 失败重试与延迟控制
- 对 DB 压力
- 运维成本与成熟度

## 4. 备选方案
### A：DB 轮询
- 优点：实现简单；无需 MQ
- 缺点：轮询延迟、DB 压力大、难以应对峰值；重试/死信机制需要自建

### B：MQ 驱动 + DB 状态源（Outbox 可选）
- 优点：低延迟触发；天然支持削峰填谷；重试/DLQ 更成熟；worker 易扩缩
- 缺点：需要处理 DB 与 MQ 一致性；引入 MQ 运维依赖

## 5. 决策
选择 **方案 B：MQ 驱动 + DB 任务状态源**。
一致性策略：
- 创建任务：先写 DB；再投递消息
- 若投递失败：通过补偿任务扫描 “待触发” 状态并补投递（或采用 Outbox）

## 6. 后果与影响
- 新增 message-broker 依赖面（如已有则复用）
- 所有异步任务统一遵循：task 表状态机 + 消息触发 + DLQ 告警
- 需要补偿机制确保 DB/MQ 最终一致

## 7. 落地要点
- 任务状态机：PENDING → RUNNING → SUCCEEDED/FAILED
- 重试策略：指数退避 + 最大重试次数；超限入 DLQ
- 指标与告警：堆积、失败率、耗时
```

### 8.2 ADR-0008：导出文件存储与分发方案

> 文件存储方式会影响安全、成本、带宽、长期可维护性，也是 ADR 候选。

```md
# ADR-0008：导出文件存储与分发方案（对象存储 + 预签名 URL）

## 1. 元信息
- 状态：Accepted
- 日期：2026-01-05
- 相关 ADD：../ADD.md
- 相关 TSD：../tsd/TSD-async-export-20260105.md

## 2. 背景
导出文件体积可能较大，不适合通过应用服务器直出占用带宽与连接时长。
需要：安全访问、可控有效期、可审计、成本可控。

## 3. 备选方案
- A：应用服务器直出下载（流式）
- B：文件落盘到应用服务器/共享盘
- C：对象存储（S3/OSS/MinIO）+ 预签名 URL 分发

## 4. 决策
选择 **C：对象存储 + 预签名 URL**：
- worker 生成文件后上传对象存储
- admin-api 返回短期有效的预签名下载链接（如 15~60 分钟可配置）
- 文件生命周期：默认保留 7 天，自动过期清理

## 5. 后果
- 需要对象存储依赖与权限治理（桶、前缀、KMS/加密、审计）
- 下载链路更轻量，应用层成本更低
```

## 9 TSD 示例（把“本次需求怎么做”写清楚，并引用 ADD/ADR）

> 重点：TSD 里写接口、表、流程、迁移、灰度、测试；并在关键点引用 ADR（证明“关键取舍已定案/可追溯”）。

```md
# 技术方案（TSD）- 异步导出客户列表（2026-01-05）

## 1. 文档信息
- 负责人：<你的名字>
- 状态：In Review
- 关联 ADD：../ADD.md
- 关联 ADR：
  - ../adr/ADR-0007-async-job-framework.md
  - ../adr/ADR-0008-export-file-storage.md

## 2. 背景与目标
用户在“客户管理”列表页筛选客户后，希望导出 CSV 文件。由于数据量大，必须异步执行。

目标：
- 导出任务创建 < 300ms 返回 taskId
- 10万条客户数据导出完成时间 P95 < 5min（初版可调整）
- 支持失败重试与可追溯状态查询

非目标：
- 暂不支持 xlsx 多 sheet、复杂样式
- 暂不支持跨租户导出

## 3. 方案概览
- 按 ADD 的异步任务基线实现（PENDING→RUNNING→SUCCEEDED/FAILED）
- 任务触发采用 ADR-0007（MQ 驱动 + DB 状态源）
- 文件存储采用 ADR-0008（对象存储 + 预签名 URL）

## 4. 流程与时序（文字版）
1) 前端调用创建导出：POST /api/exports
2) admin-api 校验权限与参数，写入 export_task（PENDING）
3) admin-api 投递 MQ 消息（携带 taskId）
4) job-worker 消费消息，更新任务为 RUNNING，分页查询客户数据并生成 CSV（临时文件）
5) 上传对象存储，写入 file_key、file_size、checksum，更新任务为 SUCCEEDED
6) 前端轮询查询：GET /api/exports/{taskId}
7) 用户点击下载：POST /api/exports/{taskId}/download-url 获取预签名 URL

## 5. 接口设计
### 5.1 创建导出任务
POST /api/exports
请求：
- filter: <筛选条件>
- format: "CSV"
Header（可选）：
- Idempotency-Key: <uuid>

响应：
- taskId
- status: "PENDING"

### 5.2 查询任务
GET /api/exports/{taskId}
响应：
- status: PENDING/RUNNING/SUCCEEDED/FAILED
- progress（可选）：0~100
- createdAt, finishedAt
- errorMessage（失败时）

### 5.3 获取下载链接
POST /api/exports/{taskId}/download-url
响应：
- url（预签名，15min）
- expiresAt

## 6. 数据设计
### 6.1 表：export_task
字段（示例）：
- id (PK)
- operator_id
- tenant_id
- biz_type = "CUSTOMER_EXPORT"
- request_hash（由筛选条件 + operator_id 生成，用于幂等/去重）
- status (PENDING/RUNNING/SUCCEEDED/FAILED)
- retry_count
- file_key（对象存储 key）
- file_size
- checksum（可选）
- error_message
- created_at / updated_at / finished_at

索引：
- (tenant_id, operator_id, created_at)
- unique(tenant_id, operator_id, request_hash)  -- 若启用幂等去重

## 7. worker 设计
- 消费消息：topic = export-task
- 幂等：同 taskId 若已 SUCCEEDED 则直接 ack；若 RUNNING 超时可按策略重试/续跑（初版可简单失败重试）
- 分页拉取客户数据：每页 1000（可配置）
- CSV 生成：流式写入，避免内存爆炸
- 失败策略：重试最多 5 次；超限进入 DLQ 并告警（遵循 ADD）

## 8. 迁移与发布
- 先发后端：建表 + worker + 接口
- 前端灰度：feature flag 开关逐步放量
- 回滚：关闭 feature flag；保留任务表不影响其他功能
- 文件清理：对象存储生命周期 7 天（由 ADR-0008 约束）

## 9. 测试计划
- 单测：request_hash 计算、状态机转换、幂等逻辑
- 集成：创建任务→消费→成功→下载 URL
- 异常：worker 崩溃重启、消息重复投递、对象存储上传失败重试
- 性能：10万条导出压测（关注耗时与内存）

## 10. 风险与对策
- 风险：导出时查询压力大
  - 对策：分页、只读库（如有）、限流、任务队列并发上限
- 风险：重复创建任务导致资源浪费
  - 对策：Idempotency-Key + request_hash 唯一约束（可选）
```

## 10 这套示例里，“哪些点该升格成 ADR？”

- ✅ **异步任务框架方式（MQ vs 轮询）**：平台级、长期复用、影响面大 → ADR
- ✅ **文件存储分发（对象存储 + 预签名）**：安全/成本/性能的长期策略 → ADR
- ❌ “本次导出是 CSV 还是 XLSX、列名是什么、每页 1000 还是 2000” ：多数情况下是需求级实现细节 → TSD（除非你要把“统一导出格式规范”升格为平台规则）

如果你想更贴合你们现状（比如你们已有 Kafka/Redis/对象存储，或者你们是 Java Spring 还是 Go），我可以把这个示例进一步“落到你们栈上”：接口路径风格、消息 topic 命名、表字段规范、监控指标命名、灰度策略等都按你们的约定来写。

---

好，我就按你这套 **Java 微服务技术栈**（Spring Boot 3.2.5 + RocketMQ 5.2.0 + PG 16 + Redis 7 + MyBatis-Plus + XXL-JOB + MinIO + Security/JWT）把之前“异步导出”的示例继续**落到可直接写进 ADD / ADR / TSD 的内容**，并把你补充的安全项纳入进去。

---

## 11 建议的落地方式（把“技术栈清单”做成基线引用）

建议在仓库固定一份基线文档，ADD/TSD 都引用它：

- `docs/reference/tech-stack.md`（全局基线：版本号、统一依赖范围、升级策略）
- `docs/ADD.md`（架构基线：原则、机制、约束，链接 tech-stack + ADR 索引）
- `docs/adr/*.md`（关键决策：MQ 驱动、MinIO 分发、JWT 口径等）
- `docs/tsd/*.md`（每个需求的落地细节）

### 11.1 tech-stack.md（你这份清单可直接贴进去）

```md
# 技术栈基线（Tech Stack Baseline）

## 运行时与构建
- Java：17（LTS）
- Spring Boot：3.2.5
- Maven：3.9.6
- Tomcat：10.1.20（Spring Boot 3.2.5 内嵌）

## 数据与缓存
- PostgreSQL：16.2
- PostgreSQL JDBC：42.7.3
- MyBatis-Plus：3.5.7（配套 mybatis-spring：3.0.3）
- Redis Server：7.2.4
- Redis Client：Lettuce 6.3.2.RELEASE
- 本地缓存：Caffeine 3.1.8

## 消息与调度
- RocketMQ：5.2.0
- rocketmq-spring-boot-starter：2.3.0
- XXL-JOB：2.4.1

## 文件与工具
- MinIO Java SDK：8.5.10
- Hutool：5.8.28

## 安全认证
- Spring Security：6.2.4
- JWT：jjwt 0.12.5
```

---

## 12 ADD 里应该怎么写（与本案例相关的“架构基线”片段）

> ADD 不写“导出 CSV 列是什么”，只写**长期机制**：异步任务框架、RocketMQ 规范、MinIO 分发规范、JWT 口径、幂等与可观测等。

### 12.1 ADD 节选：技术栈与安全基线引用

```md
## 技术栈基线
- 统一技术栈与版本见：./reference/tech-stack.md
- 任何新增基础组件/中间件/长期约束需先出 ADR

## 安全认证与授权（基线）
- 认证：Spring Security + JWT（jjwt）
- JWT 必备 Claims：
  - sub：用户标识
  - tenant_id：租户
  - roles / authorities：权限
- 关键审计字段统一：operatorId、tenantId、traceId
- 所有管理端接口默认鉴权；下载类接口必须绑定任务所属 operatorId/tenantId
```

### 12.2 ADD 节选：异步任务与 RocketMQ 约束

```md
## 异步任务（基线）
- 长耗时任务必须异步化（导出/批处理/报表等），HTTP 创建任务后返回 taskId
- 任务状态源以 PostgreSQL 为准：PENDING → RUNNING → SUCCEEDED / FAILED
- 任务执行必须幂等：同一 taskId 重复消费不得产生多个最终文件

## RocketMQ 使用规范（基线）
- Topic 命名：<domain>.<biz>.<event>（示例：admin.export.task）
- 消息体必须包含：taskId、tenantId、operatorId、traceId、bizType、createdAt
- 消费端必须做到：
  - 幂等（基于 taskId 状态判断）
  - 失败重试（受控次数/延迟策略）
  - DLQ 告警（失败超阈值触发告警）
```

### 12.3 ADD 节选：MinIO 文件分发基线

```md
## 文件存储与分发（基线）
- 导出文件统一落 MinIO，不允许应用服务直出大文件占用连接
- 下载采用预签名 URL（短有效期，默认 15~60 分钟可配置）
- 文件生命周期：默认保留 7 天自动清理（或按业务配置）
```

ADD 里只写这些“规则”，并在 **ADR Index** 里挂两条 ADR（异步任务机制、MinIO 分发机制）。

---

## 13 ADR 应该怎么写（把“关键选择”固化下来）

下面两条 ADR 是你这套栈里做“异步导出”最常见、也最值得沉淀的决策点。

### 13.1 ADR-0007：异步任务框架（RocketMQ 驱动 + PG 状态源 + XXL-JOB 补偿）

```md
# ADR-0007：异步任务框架采用 RocketMQ 驱动 + PostgreSQL 状态源 + XXL-JOB 补偿

## 背景
平台存在导出/批处理等长耗时任务，需要低延迟触发、可扩展、可观测、可追溯状态。

## 备选方案
A. DB 轮询：worker 定时扫描 PENDING 任务执行
B. RocketMQ 驱动：写任务表后投递 MQ，worker 消费执行（DB 作为状态源）
C. 混合：MQ 驱动 + 定时补偿（处理投递失败/消费丢失/卡死任务）

## 决策
选择 C：RocketMQ 驱动为主（低延迟、削峰），DB 为状态源（可查询/可追溯），XXL-JOB 做补偿扫描：
- 扫描 PENDING 且超过阈值未触发的任务 → 补投递
- 扫描 RUNNING 且超时未更新的任务 → 标记失败/重试（按策略）

## 后果
- 对 MQ/调度有运维依赖
- 需要消费幂等与重试上限
- 统一沉淀任务状态机与观测指标
```

### 13.2 ADR-0008：导出文件存储（MinIO + 预签名 URL）

```md
# ADR-0008：导出文件使用 MinIO 存储与预签名 URL 分发

## 背景
导出文件可能较大，应用层直出会造成连接占用与带宽压力，且安全控制困难。

## 决策
- 文件由 job-worker 生成后上传 MinIO
- admin-api 提供预签名下载 URL（短有效期，可配置）
- MinIO 对象 Key 采用前缀隔离：tenant/<tenantId>/export/<taskId>.csv
- 文件保留与清理：默认 7 天（生命周期策略）

## 后果
- 需要 MinIO 权限、审计与生命周期治理
- 下载链路与应用解耦，成本更可控
```

---

## 14 TSD 怎么写（把“本次需求细节”落地）

下面就是把异步导出做成“可实现”的 TSD 关键内容（接口、表、MQ、worker、权限、发布/回滚），完全贴合你的技术栈。

### 14.1 API（Spring Boot + Security/JWT）

- `POST /api/exports`：创建导出任务（返回 `taskId`）
- `GET /api/exports/{taskId}`：查询任务状态
- `POST /api/exports/{taskId}/download-url`：获取预签名下载 URL

**鉴权规则（写进 TSD）：**

- 所有接口必须登录（JWT）
- `taskId` 必须属于当前 `tenantId` 且 `operatorId` 匹配（或具备管理员角色）

### 14.2 数据表（PostgreSQL 16.2）——示例 DDL（可直接评审用）

```sql
CREATE TABLE export_task (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      VARCHAR(64) NOT NULL,
  operator_id    VARCHAR(64) NOT NULL,
  biz_type       VARCHAR(64) NOT NULL, -- CUSTOMER_EXPORT / ORDER_EXPORT ...
  request_hash   VARCHAR(128) NOT NULL, -- 幂等/去重
  status         VARCHAR(16) NOT NULL,  -- PENDING/RUNNING/SUCCEEDED/FAILED
  retry_count    INT NOT NULL DEFAULT 0,
  file_key       VARCHAR(256),
  file_size      BIGINT,
  checksum       VARCHAR(64),
  error_message  TEXT,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  finished_at    TIMESTAMP
);

CREATE INDEX idx_export_task_tenant_operator_ct
ON export_task (tenant_id, operator_id, created_at DESC);

-- 可选：启用幂等去重（推荐）
CREATE UNIQUE INDEX uk_export_task_req
ON export_task (tenant_id, operator_id, biz_type, request_hash);
```

> MyBatis-Plus 层面：`ExportTaskEntity + Mapper + Service`，更新状态建议用“条件更新”避免并发覆盖（例如 `where id=? and status='PENDING'`）。

### 14.3 RocketMQ 消息设计（rocketmq-spring-boot-starter 2.3.0）

- Topic：`admin.export.task`
- Tag：按业务类型（如 `CUSTOMER_EXPORT`）
- Body（JSON）字段建议（写进 TSD）：
    - `taskId`
    - `tenantId`
    - `operatorId`
    - `bizType`
    - `traceId`
    - `createdAt`

**幂等与重复消费（必须写进 TSD）：**

- consumer 拿到 `taskId` 后，先查 `export_task.status`：
    - 若已 `SUCCEEDED`：直接 ack
    - 若 `RUNNING`：按策略（可直接 ack 或判断超时）
    - 若 `PENDING/FAILED`：进入执行（并更新为 RUNNING）

### 14.4 Worker 执行与 MinIO 上传（MinIO SDK 8.5.10）

- 数据读取：分页查询（避免内存爆）
- 文件生成：流式写 CSV
- 上传：`putObject` 后记录 `file_key/file_size/checksum`
- 下载：`getPresignedObjectUrl` 生成短有效期 URL（15~60 分钟）

### 14.5 XXL-JOB 补偿任务（符合 ADR-0007）

TSD 里写清楚补偿策略即可：

- 每 5 分钟扫描：
    - `PENDING` 且 `created_at < now()-2min`：补投递 MQ
    - `RUNNING` 且 `updated_at < now()-30min`：标记 FAILED 并触发重试（或人工介入）
- 触发告警：失败率、DLQ、堆积、超时任务数

### 14.6 缓存（Redis + Caffeine）

一般导出本身不强依赖缓存，但 TSD 可以写两类合理用法（可选）：

- Redis：导出并发限流/每用户导出次数限制（防止滥用）
- Caffeine：本地缓存一些字典/配置（减少 DB 压力）

---

## 15 你这套栈下，“哪些内容分别应该出现在哪里”（一眼对齐）

- **tech-stack.md**：你给的版本清单（全局基线）
- **ADD**：异步任务机制、RocketMQ 规范、MinIO 分发规范、JWT 口径（规则/约束）
- **ADR**：
    - ADR-0007（为什么 MQ + DB + XXL-JOB 补偿）
    - ADR-0008（为什么 MinIO + 预签名 URL）
- **TSD**：本次导出需求的接口/表/Topic/Tag/字段/分页策略/灰度回滚/测试与告警阈值

---

如果你希望我“继续”的方向是：把上面的 **TSD 直接补全为一份完整可评审文档**（包含：权限矩阵、错误码、RocketMQ 重试策略细化、监控指标清单、灰度与回滚 Runbook、MyBatis-Plus 条件更新示例、MinIO Key 命名与生命周期配置建议），我也可以直接给你一份可落地的完整版 Markdown。
