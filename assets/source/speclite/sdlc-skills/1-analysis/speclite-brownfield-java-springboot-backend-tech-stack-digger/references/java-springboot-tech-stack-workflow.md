# Java SpringBoot Tech Stack Workflow

## Overview（概述）

本文定义 `speclite-brownfield-java-springboot-backend-tech-stack-digger` 的 Java / Spring Boot 专属执行规则。输出仍遵守通用后端报告契约。

## Inputs（输入）

| 参数 | 必需 | 说明 |
|---|---:|---|
| `{project-root}` | 是 | Java / Spring Boot 既有项目根目录。 |
| `{output-dir}` | 是 | Markdown 报告输出目录；缺失时必须询问用户。 |
| `{report-name}` | 否 | 默认 `java-springboot-backend-tech-stack.md`。 |
| `{module}` | 否 | 指定 Maven / Gradle module；未提供时自动识别后端 bootstrap / service module。 |

## Evidence Precedence（证据优先级）

1. Maven effective-POM、Maven dependency tree、Gradle dependencies、Gradle lockfile、SBOM。
2. Root POM / module POM、parent POM、BOM、dependencyManagement、pluginManagement、Gradle platform、version catalog。
3. Wrapper 与 toolchain：`maven-wrapper.properties`、`gradle-wrapper.properties`、`toolchains.xml`、`sourceCompatibility`、`targetCompatibility`、`maven.compiler.source`、`maven.compiler.target`。
4. Runtime config：`application.yml`、`application.properties`、`bootstrap.yml`、`config/`、profile-specific config、environment templates。
5. Deployment config：Dockerfile、Compose、Helm、Kubernetes、CI pipeline、runtime base image。
6. Source facts：Spring Boot main class、controllers、configuration classes、mapper / repository、job handlers、security config、client factories。
7. Historical docs：candidate only; must be cross-validated by code/config/build facts.

## Maven Procedure（Maven 流程）

1. Locate root `pom.xml`, parent POM, modules, and target backend module.
2. Read properties and dependencyManagement before direct dependencies.
3. If Maven is available, run focused commands from `{project-root}`:

```bash
mvn help:effective-pom -pl {module} -DskipTests
mvn dependency:tree -pl {module} -DskipTests
```

4. If `-pl {module}` fails because the module path differs, retry with artifactId only after reading root modules.
5. Extract these facts when present:
    - `maven.compiler.source`, `maven.compiler.target`, `java.version`
    - `spring-boot-dependencies.version`
    - `spring-boot-maven-plugin.version`
    - `spring-cloud-dependencies.version`
    - `spring-cloud-alibaba-dependencies.version`
    - `tomcat-embed.version`, Jetty / Undertow dependencies
    - `spring-security-core` resolved version
    - JDBC drivers, connection pool, MyBatis / JPA / migration dependencies
6. If Maven fails due to private repository, JDK mismatch, parent POM, or network, record the exact failure and fall back to static parsing.

## Gradle Procedure（Gradle 流程）

1. Locate `settings.gradle`, `build.gradle`, `build.gradle.kts`, version catalogs, and backend subproject.
2. Prefer wrapper commands if available:

```bash
./gradlew :{module}:dependencies
./gradlew :{module}:dependencyInsight --dependency spring-boot
```

3. Extract Spring Boot plugin version, dependency-management plugin, platform BOMs, toolchain, sourceCompatibility, targetCompatibility, and resolved dependencies.
4. If Gradle cannot run, record the reason and use static Gradle file parsing.

## Category Matrix（分类矩阵）

| 类别 | Java / Spring Boot 证据 |
|---|---|
| 开发语言 | Java / Kotlin / Groovy source, compiler target, toolchain |
| 开发环境 | JDK version, Maven / Gradle wrapper, runtime image, CI JDK |
| 核心框架 | Spring Boot, Spring Framework, Spring Cloud, Spring Cloud Alibaba |
| Web 容器 | `spring-boot-starter-web`, Tomcat / Jetty / Undertow resolved dependency, WAR packaging |
| 数据库 | JDBC driver, datasource URL, DDL dialect, migration scripts |
| 连接池 | HikariCP, Druid, Tomcat JDBC pool |
| ORM / DAO | MyBatis, MyBatis-Plus, JPA, Hibernate, jOOQ, Spring Data |
| 消息队列 | RocketMQ, Kafka, RabbitMQ, Pulsar client / starter and config |
| 本地缓存 | Caffeine, Ehcache, Guava cache, Spring Cache config |
| 分布式缓存 | Redisson, Lettuce, Jedis, Redis config, lock / lease utility |
| 任务调度 | XXL-JOB, Quartz, Spring Scheduler, ElasticJob, job handlers |
| 文件存储 | MinIO, S3, COS, OSS SDK / starter and endpoint config |
| 工具类库 | Hutool, Guava, Apache Commons, MapStruct, Jackson, Gson, OkHttp, Feign |
| 安全认证 | Spring Security, OAuth2 resource server/client, JWT libraries, token resolver starter |
| API 文档 | Springfox, Swagger, springdoc-openapi, OpenAPI config |
| 观测治理 | Actuator, Micrometer, Sleuth / Brave, Sentinel, logging / trace starters |
| 测试框架 | JUnit, Mockito, Spring Test, Testcontainers, Surefire / Failsafe |

## Conflict Rules（冲突处理）

- effective-POM / Gradle resolved dependency wins over direct declaration.
- Module effective dependency wins over root dependencyManagement when analyzing one backend module.
- Spring Boot dependency BOM version wins over plugin version for framework baseline.
- Client dependency does not prove external server version.
- If multiple active profiles define different infrastructure endpoints, report profile-specific facts instead of merging them.

## Output Requirements（输出要求）

Report must include:

1. `Backend Tech Stack（后端技术栈）` with Java / Spring Boot oriented checklist.
2. `Evidence Summary（证据摘要）` with component, version, evidence, and resolution mode.
3. `Unconfirmed（未确认项）` for server versions, private BOM failures, profile ambiguity, and command failures.
4. `Verification Commands（核验命令）` listing commands actually run or recommended.
5. `Generated By（生成来源）`: `speclite-brownfield-java-springboot-backend-tech-stack-digger`.

## Stop Conditions（停止条件）

- `{output-dir}` is missing and user has not supplied it.
- Target report exists and user has not authorized overwrite, append, or rename.
- No Java build file or JVM source facts can be found.
- Dependency resolution requires credentials or private network unavailable in the current environment; continue only with static parsing and explicit uncertainty.

## Version History（版本说明）

- v1.0 (2026-06-16): 初始版本。
