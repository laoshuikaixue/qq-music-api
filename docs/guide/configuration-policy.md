---
layout: doc
title: 配置规范
---

# 配置规范

本文定义 QQ Music API 的配置边界、文件职责和后续演进原则。目标是让项目同时适合作为本地服务运行、作为 npm 包被引用，以及在未来扩展 CLI/MCP 能力时保持行为可预期。

## 适用范围

本规范覆盖以下配置来源：

- `config/service-config.json`：服务级开关，例如降级模式、全局 Cookie 开关。
- `config/user-info.json`：用户登录态，例如 `loginUin`、`cookie`。
- 环境变量：运行时覆盖项，例如 `PORT`、`FALLBACK_MODE`、`USE_GLOBAL_COOKIE`、`QQ_MUSIC_API_CONFIG_DIR`。
- 未来 CLI/MCP 配置：命令行和工具协议运行时需要读取或写入的配置。

不覆盖 API 请求参数、上游 QQ 音乐接口响应结构、测试 fixture 数据。

## 配置身份

项目需要同时支持三种使用身份，每种身份的配置行为不同。

| 使用身份 | 典型入口 | 配置原则 |
| --- | --- | --- |
| 本仓库开发 | `npm run dev`、`tsx src/app.ts` | 可以使用仓库内 `config/` 作为默认配置目录，便于调试和文档演示。 |
| 服务运行 | `npm run start`、`node dist/app.js`、未来 bin 启动 | 配置目录必须稳定，不应随调用者 `process.cwd()` 漂移。 |
| 包引用 | `import '@sansenjian/qq-music-api'` | import 阶段不应隐式创建或写入配置文件。 |

## 配置优先级

配置读取应按以下顺序合并，越靠前优先级越高：

1. 显式环境变量，例如 `FALLBACK_MODE=true`、`USE_GLOBAL_COOKIE=true`。
2. `QQ_MUSIC_API_CONFIG_DIR` 指向的配置文件。
3. 当前运行身份的默认配置目录。
4. 代码内默认值。

环境变量适合临时覆盖；配置文件适合持久化；代码默认值只提供安全可启动的基础行为。

## 配置目录规则

### 显式配置目录

当设置 `QQ_MUSIC_API_CONFIG_DIR` 时，所有持久化配置都必须写入该目录：

```bash
QQ_MUSIC_API_CONFIG_DIR=/path/to/qq-music-api-config npm run start
```

该目录用于同时存放：

- `service-config.json`
- `user-info.json`

### 默认配置目录

默认配置目录应按运行身份决定：

- 仓库源码开发：默认可以使用仓库根目录下的 `config/`。
- 已构建服务或 npm bin：默认应使用稳定位置，不能依赖调用者当前目录。
- 被第三方代码 import：默认不应写入磁盘。

如果运行时需要写配置但默认目录不可写，应给出明确错误信息，提示用户设置 `QQ_MUSIC_API_CONFIG_DIR`。

## 写入时机

配置写入必须遵守以下原则：

- 不在普通模块 import 阶段创建目录或写文件。
- 只有在服务启动、登录态刷新、显式保存配置等动作中写入。
- 写入失败时返回可诊断错误，不吞掉异常后继续表现为“已保存”。
- Cookie、登录态等敏感信息不得打印到日志。

推荐将配置初始化封装为显式函数，例如：

```ts
loadServiceConfig()
ensureConfigDir()
saveUserInfo()
```

这样可以避免 `import` 本身产生副作用，也方便测试不同配置目录。

## 文件职责

### `service-config.json`

用于保存服务行为开关。示例：

```json
{
  "fallbackMode": true,
  "useGlobalCookie": false,
  "cookieParamName": "cookie"
}
```

字段说明：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fallbackMode` | boolean | `true` | 是否允许通过请求传入 Cookie。 |
| `useGlobalCookie` | boolean | `false` | 是否默认使用全局 Cookie。 |
| `cookieParamName` | string | `cookie` | Query 参数中的 Cookie 字段名。 |

### `user-info.json`

用于保存登录态。示例：

```json
{
  "loginUin": "",
  "cookie": ""
}
```

该文件包含敏感信息，应保持本地私有，不应提交到 Git，也不应进入构建产物日志。

## 环境变量

| 变量 | 作用 | 示例 |
| --- | --- | --- |
| `PORT` | 服务监听端口 | `PORT=3300 npm run start` |
| `QQ_MUSIC_API_CONFIG_DIR` | 显式配置目录 | `QQ_MUSIC_API_CONFIG_DIR=/data/qq-music-api` |
| `FALLBACK_MODE` | 覆盖降级模式 | `FALLBACK_MODE=true` |
| `USE_GLOBAL_COOKIE` | 覆盖全局 Cookie 开关 | `USE_GLOBAL_COOKIE=true` |

布尔环境变量当前只约定字符串 `true` 表示启用。未设置或其他值不强制启用。

## 安全要求

- Cookie 只能通过配置文件、环境隔离目录或请求显式传入。
- 不在错误响应中返回配置文件路径、Cookie 内容或上游认证细节。
- 不在日志中输出完整 Cookie。
- 配置文件权限应由部署环境控制；容器和服务器部署时推荐挂载独立配置目录。

## 测试要求

修改配置逻辑时至少覆盖：

- 未设置 `QQ_MUSIC_API_CONFIG_DIR` 的默认路径行为。
- 设置 `QQ_MUSIC_API_CONFIG_DIR` 后的读写行为。
- import 包入口时不产生非预期写入。
- 配置文件损坏时的 fallback 或错误提示。
- 登录态刷新后 `user-info.json` 的写入行为。

涉及扫码登录、Cookie 或用户信息的改动，还需要回归登录相关集成测试。

## 当前落地状态

当前项目已经支持 `QQ_MUSIC_API_CONFIG_DIR`，测试也会用它隔离配置目录。

仍需要持续收敛的点：

- 默认配置目录不应随 `process.cwd()` 漂移。
- 包被 import 时应减少隐式写盘副作用。
- 文档中关于 `config/user-info.ts` 与 `config/user-info.json` 的表述需要逐步统一到运行时 JSON 配置。

后续实现配置逻辑时，应以本文作为行为边界。
