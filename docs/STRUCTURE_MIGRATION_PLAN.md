# 结构迁移计划

## 背景

本计划基于当前仓库与 `C:\Users\Administrator\Desktop\qq-music-api-next` 的结构对比整理。

当前仓库在构建发布、文档站点、测试分层、包导出、Koa 中间件和登录/Cookie 兼容性上更成熟，不建议直接迁移到 `qq-music-api-next` 的整体结构。

`qq-music-api-next` 中更值得吸收的是：

- 统一源码目录 `src/`
- 更语义化的层命名：`services`、`controllers`、`routes`
- Controller/Service 层统一日志与观测封装
- API Explorer 元数据驱动方式
- 配置结构化校验思路

## 结构对比摘要

| 维度 | 当前仓库 | qq-music-api-next | 迁移判断 |
| --- | --- | --- | --- |
| 源码位置 | 根目录下分布 `app.ts`、`koaApp.ts`、`module/`、`routers/`、`util/` | 统一在 `src/` | 已完成迁移，当前运行时源码统一位于 `src/` |
| 上游接口层 | `module/apis/` | `src/services/` | `services` 命名更清楚，已迁移 |
| HTTP 控制器层 | `routers/context/` | `src/controllers/` | `controllers` 命名更符合职责，已迁移 |
| 路由注册 | `routers/router.ts` | `src/routes/router.ts` | 已迁移 |
| 测试体系 | Vitest，包含 unit/integration 分层 | Jest，大量测试平铺 | 保持当前 Vitest，不迁移 Jest |
| 文档体系 | VitePress | Docsify | 保持当前 VitePress |
| 包导出 | `exports`、`types`、`files` 已面向发布配置 | 偏源码运行 | 保持当前发布结构，迁移时重点保护 |
| 配置 | `config-path`、`service-config`、`user-info` 分离 | schema + manager 统一管理 | 借鉴校验思路，不直接照搬 |
| 可观测性 | 基础日志和错误处理 | logger + observability 包装器 | 优先吸收 |
| API Explorer | `public/index.html` playground + 文档 | 元数据驱动 explorer | 借鉴元数据，不直接替换现有文档体系 |

## 总体里程碑

| 阶段 | 目标 | 风险 | 建议颗粒度 |
| --- | --- | --- | --- |
| 阶段一 | 补齐日志和观测封装 | 低 | 1 个独立提交 |
| 阶段二 | 提取 API 元数据 | 中低 | 1-2 个独立提交 |
| 阶段三 | 目录语义化命名 | 中高 | 单独分支或单独 PR |
| 阶段四 | 统一源码到 `src/` | 高 | 单独版本周期 |
| 阶段五 | 配置结构优化 | 中 | 可拆到阶段一或独立提交 |

推荐先完成阶段一和阶段二，再根据维护成本决定是否进入阶段三。阶段四只在需要长期维护更清晰源码边界时执行。

## 迁移目标

1. 降低新增 API 时需要同步维护的文件数量。
2. 让业务分层命名更直观，减少 `module`、`routers/context` 的理解成本。
3. 保持现有公开路由、响应结构、Cookie 行为和包导出兼容。
4. 增强运行时可观测性，方便定位接口、上游请求和参数问题。
5. 避免一次性大重构，按低风险阶段逐步推进。

## 迁移原则

- 不改变现有路由语义。
- 不改变默认端口 `3200`。
- 不破坏扫码登录、Cookie、fallback mode 等兼容逻辑。
- 不引入与迁移无关的新依赖。
- 每个阶段都必须可独立构建、测试和回滚。
- 文档、测试、类型和实现同步更新。

## 阶段一：补齐横切能力

优先迁移低风险、收益明确的能力，不调整目录结构。

### 计划内容

- 新增统一 logger，支持测试环境静默或降级日志。
- 增加 Controller 包装器，用于记录请求参数、状态码、耗时和错误摘要。
- 增加 Service 层日志工具，用于记录上游请求、成功、失败和分支选择。
- 已接入统一包装器，后续新增接口默认使用该能力。

### 影响范围

- `util/`：新增 `logger.ts`、`observability.ts` 或扩展现有日志工具。
- `routers/context/`：试点 controller 接入统一包装器。
- `module/apis/`：试点 service 接入请求、成功、失败日志。
- `tests/unit/`：补充日志摘要、错误保护、测试环境静默相关测试。

### 交付物

- 一个统一 logger，至少支持 `debug`、`info`、`warn`、`error`。
- 一个 `withControllerLogging()` 或同等包装器。
- 一组 service 日志函数，例如 `logServiceRequest()`、`logServiceSuccess()`、`logServiceFailure()`。
- 至少 2-3 个试点接口完成接入，并保持响应结构不变。

### 当前进展

- 已新增 `util/logger.ts`，统一处理日志级别、测试环境静默与敏感字段脱敏。
- 已新增 `util/observability.ts`，提供 Controller/Service 计时和成功/失败摘要日志。
- 已在 `getSearchByKey`、`getAlbumInfo`、`getLyric` 三个试点接口接入观测封装，未改变公开路由和响应结构。
- 阶段四执行后，相关文件位于 `src/util/logger.ts` 与 `src/util/observability.ts`。

### 需要注意

- 日志必须脱敏 Cookie、Header、用户标识等敏感字段。
- 不要让日志封装吞掉已有错误响应结构。
- 测试环境应避免输出大量控制台日志。

### 回滚策略

- 保留 controller 原始导出方式，包装器只在 `src/controllers/index.ts` 或单个 controller 中接入。
- 如果日志影响响应，先移除试点接口包装，不删除新增工具文件。
- 不在这个阶段批量改目录，降低回滚成本。

### 验收

```bash
npm run build
npm run test
```

## 阶段二：提取 API 元数据

把路由、playground、文档和测试共享的接口清单抽出来，减少重复维护。

### 计划内容

- 新增 `config/api-metadata.ts` 或 `routers/api-metadata.ts`。
- 描述每个接口的名称、分类、方法、路径、参数和示例。
- 先只让 playground 或测试读取元数据，不立即重写路由注册。
- 后续再评估是否由元数据生成部分文档或接口列表。

### 建议字段

```typescript
export interface ApiMetadataItem {
  name: string;
  category: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  aliases?: string[];
  queryParams?: ApiParamMetadata[];
  pathParams?: ApiParamMetadata[];
  bodyExample?: unknown;
  responseExample?: unknown;
  authRequired?: boolean;
  cookieRequired?: boolean;
}
```

### 影响范围

- `src/routes/router.ts` 仍负责运行时路由注册，`src/routes/api-metadata.ts` 作为文档和测试元数据索引。
- `public/`：后续可读取元数据渲染 playground。
- `docs/api/`：后续可按元数据校验文档覆盖率。
- `tests/integration/`：可增加路由清单覆盖测试，确保元数据和实际路由一致。

### 交付物

- 初版 API 元数据文件，覆盖当前核心接口。
- 一个测试用例，校验元数据中的路径至少能在路由表中找到对应项。
- 文档说明新增接口时需要同步元数据。

### 当前进展

- 已新增 `src/routes/api-metadata.ts`，覆盖当前注册路由、别名、参数和 Cookie 需求标记。
- 已新增 `tests/unit/routes/api-metadata.test.ts`，校验元数据路径与实际路由表保持同步。

### 需要注意

- 元数据不能成为新的单点复杂度。
- 参数说明应服务于文档和 playground，不要把业务校验逻辑混进去。
- 路由注册仍以当前 `src/routes/router.ts` 为权威，元数据通过测试与实际路由表同步。

### 回滚策略

- 元数据初期不参与运行时路由注册，回滚时只需移除读取元数据的 playground 或测试逻辑。
- 如果元数据维护成本过高，保留文件作为文档索引，不继续推进自动生成。

### 验收

```bash
npm run build
npm run test
npm run docs:build
```

## 阶段三：语义化目录命名

在不改变行为的前提下，逐步把分层命名改得更直观。

### 建议目标结构

```text
services/          上游 QQ 音乐接口封装，替代 module/
controllers/       HTTP 控制器，替代 routers/context/
routes/            路由注册，替代 routers/
middlewares/       Koa 中间件，保持不变
util/              通用工具，保持不变或后续评估 utils 命名
config/            运行时配置，保持不变
types/             公共类型，保持不变
```

### 当前进展

- 已完成语义化目录命名，并在阶段四中统一进入 `src/`：
  - `module/` → `src/services/`
  - `routers/context/` → `src/controllers/`
  - `routers/router.ts` → `src/routes/router.ts`
  - `routers/types.ts` → `src/routes/types.ts`
  - `util/`、`config/`、`middlewares/`、`types/` → `src/` 下同名目录
- 已同步 `package.json`、`vite.config.ts`、`tsconfig*.json`、`vitest.config.ts` 与 `vercel.json`。

### 迁移步骤

1. 新建目标目录并移动少量低风险模块试点。
2. 保留兼容导出，避免破坏内部引用和潜在外部深层导入。
3. 更新 `AGENTS.md`、README、docs 和测试路径说明。
4. 批量迁移剩余 controller 和 service 文件。
5. 删除旧目录前确认包导出和发布文件列表不受影响。

### 建议批次

1. `routers/context` 复制为 `controllers`，保留旧路径 re-export。
2. `module/apis` 复制为 `services`，保留 `module` 兼容入口。
3. `routers/router.ts` 迁移为 `routes/router.ts`，旧路径只做转发。
4. 更新内部导入优先使用新路径。
5. 观察一个版本周期后，再评估是否删除旧路径。

### 影响范围

- `routers/context/**`
- `routers/router.ts`
- `module/**`
- `package.json` 的 `files` 字段
- `tsconfig.json`、`vite.config.ts` 中可能涉及的入口和声明输出
- `tests/**` 中的导入路径
- `AGENTS.md`、README、docs 中的分层说明

### 需要注意

- 当前 `package.json` 的 `files` 已改为包含 `dist/services`、`dist/controllers`、`dist/routes`。
- 如果外部用户可能依赖深层路径，建议先保留 alias 或兼容 re-export。
- 这一步变更面较大，应单独成 PR 或单独提交。

### 回滚策略

- 迁移初期采用“新路径 + 旧路径转发”，不要立即删除旧目录。
- 如果构建或测试失败，先恢复内部导入到旧路径。
- 如果发布兼容性不确定，继续发布旧目录产物，延迟删除计划。

### 验收

```bash
npm run build
npm run test
npm run docs:build
```

## 阶段四：评估源码统一到 src

这是最大的一步，只有在目录命名迁移稳定后再做。

### 目标结构

```text
src/
  app.ts
  koaApp.ts
  index.ts
  config/
  controllers/
  middlewares/
  routes/
  services/
  types/
  util/
docs/
tests/
public/
scripts/
```

### 当前进展

- 已将运行时源码统一移动到 `src/`。
- 构建入口已改为 `src/app.ts` 与 `src/index.ts`，生产输出仍保持 `dist/app.js` 与 `dist/index.js`。
- Vercel Serverless 入口已改为 `src/api/index.ts`。

### 计划内容

- 调整 `tsconfig.json` 的 `rootDir`、`include`、`exclude`。
- 调整 `vite.config.ts` 的入口和声明文件输出。
- 调整 `package.json` 的 `dev`、`bin`、`files` 和构建产物路径。
- 更新测试、文档和脚本中的导入路径。
- 确认生产启动仍依赖 `dist/app.js`。

### 迁移前置条件

- 阶段三已经稳定，内部导入基本都使用 `controllers`、`services`、`routes`。
- `npm run build`、`npm run test`、`npm run docs:build` 在迁移前全部通过。
- 明确 `dist/` 产物结构，避免破坏 npm 包使用方式。
- 确认 Vercel、Docker、CLI bin、本地 dev 命令都能找到新入口。

### 影响范围

- `src/app.ts`、`src/koaApp.ts`、`src/index.ts`
- `config/`、`controllers/`、`middlewares/`、`routes/`、`services/`、`types/`、`util/`
- `src/api/index.ts`、`Dockerfile`、`vercel.json`
- `package.json` scripts、bin、files、exports
- `vite.config.ts`、`tsconfig.json`、`tsconfig.test.json`
- 所有测试导入路径和文档链接

### 回滚策略

- 使用单独分支执行，迁移前记录完整 `git diff --stat`。
- 先移动入口和目录，不同时重写业务逻辑。
- 如果构建链路不稳定，回退到阶段三目录结构，不保留半迁移状态。

### 暂不建议立即执行的原因

- 当前仓库已经完成 TypeScript、Vite、Vitest、VitePress 和发布配置整合。
- 直接迁移到 `src/` 会触及构建、发布、测试、文档和部署。
- 收益主要是目录整洁，不应优先于可观测性和元数据复用。

### 验收

```bash
npm run build
npm run test
npm run docs:build
npm run lint
```

## 阶段五：配置结构优化

参考 `qq-music-api-next` 的配置 schema 思路，但不直接照搬完整 ConfigManager。

### 计划内容

- 为 `service-config.json` 增加轻量运行时校验。
- 为 `user-info.json` 读取失败、字段缺失、Cookie 解析异常补充更明确的错误处理。
- 日志输出时统一脱敏 Cookie。
- 评估是否需要引入 schema 依赖；默认先不新增依赖。

### 当前进展

- 已新增 `normalizeServiceConfig()`，对布尔项与 `cookieParamName` 做轻量校验并回退默认值。
- 已新增 `normalizeUserInfo()` 与 `parseCookieObject()`，缺失或异常字段降级为空配置，并忽略异常 Cookie 片段。
- 未引入额外 schema 依赖。

### 建议校验项

- `fallbackMode` 必须是 boolean。
- `useGlobalCookie` 必须是 boolean。
- `cookieParamName` 必须是非空字符串。
- `user-info.json` 缺失时自动使用空配置，不抛出启动异常。
- `cookie` 解析时忽略空片段和异常片段。

### 影响范围

- `config/service-config.ts`
- `config/user-info.ts`
- `config/config-path.ts`
- `src/util/cookieResolver.ts`
- `tests/unit/config/`
- `tests/integration/login.test.ts`，如果涉及扫码登录或 Cookie 行为

### 需要注意

- Cookie 和扫码登录逻辑只做兼容性增强，不做流程重构。
- 配置文件路径仍由 `config/config-path.ts` 管理。
- 保持环境变量覆盖行为兼容。

### 回滚策略

- 新增校验失败时先降级使用默认配置，并输出告警。
- 不在这个阶段改变配置文件格式。
- 不删除已有环境变量覆盖逻辑。

### 验收

```bash
npm run build
npm run test
```

## 不迁移项

以下内容暂不从 `qq-music-api-next` 迁移：

- Jest 测试体系：当前 Vitest 分层更适合现状。
- Docsify 文档体系：当前 VitePress 更完整。
- `koa-router` 旧包：当前 `@koa/router` 更合适。
- 大量截图、xmind、AI 工具目录：不适合作为当前包结构的一部分。
- 运行时 `ts-node` 启动方式：当前构建发布链路更清晰。

## 推荐执行顺序

1. Controller/Service 观测封装。
2. API 元数据提取。
3. `module`、`routers/context` 命名迁移。
4. 统一源码到 `src/`。
5. 配置结构轻量校验。

## 风险清单

| 风险 | 可能影响 | 控制方式 |
| --- | --- | --- |
| 路由路径变化 | 外部调用失败 | 路由迁移前后跑集成测试，并保留旧路径 |
| 响应结构变化 | 客户端兼容性问题 | Controller 包装器不得改写 `ctx.body` 格式 |
| Cookie 行为变化 | 登录态接口异常 | Cookie 相关改动必须跑登录兼容测试 |
| 包导出变化 | npm 用户导入失败 | 保留兼容 re-export，并检查 `package.json files` |
| 文档与实现不一致 | 使用者误用接口 | API 元数据和文档同步纳入验收 |
| 大批量移动导致冲突 | 回滚困难 | 每阶段独立提交，不混入业务改动 |

## 完成标准

迁移完成后应满足：

- 新增 API 的推荐路径清晰：service、controller、route、metadata、docs、tests。
- 当前公开路由全部兼容。
- `dist/` 产物路径和 npm 包导出明确。
- API playground 或文档可以基于元数据减少重复维护。
- 日志能定位 controller、service、上游接口和关键参数，但不会泄露 Cookie。
- 构建、测试和文档构建全部通过。

## 完整提交前检查

```bash
npm run build
npm run test
npm run docs:build
```

如果涉及格式、目录移动或大批量导入路径调整，再执行：

```bash
npm run lint
npm run format
```
