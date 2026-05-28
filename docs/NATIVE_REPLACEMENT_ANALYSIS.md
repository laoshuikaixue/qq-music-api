# 依赖原生化分析

> 基于 Node.js 20.12+ 原生能力，评估运行时依赖替换为 Node 内置模块的可行性。

## 当前状态

| 依赖 | 状态 |
|------|------|
| `koa-bodyparser` | ✅ 已完成 |
| `koa-static` | ✅ 已完成 |
| `axios` | ⏳ 待替换 |

当前运行时依赖：`koa`, `@koa/router`, `axios`（从 5 个减到 3 个）。

---

## 1. `axios` → 原生 `fetch`（待定）

### 现状

`src/services/apis/y_common.ts` 和 `src/services/apis/u_common.ts` 直接依赖 `axios`，所有 API 调用经由此文件。

### 原生 `fetch` 替换方案

```ts
async function request<T>(config: RequestConfig): Promise<{ data: T; status: number }> {
  const base = BASE_URL_MAP[config.isUUrl || 'c'] || cURL;
  const url = config.isUUrl === 'u' ? config.url! : base + config.url;

  const headers: Record<string, string> = { ...(config.headers || {}) };
  if (config.cookie && !headers.Cookie) {
    headers.Cookie = config.cookie;
  }

  const res = await fetch(url, {
    method: config.method || 'GET',
    headers,
    signal: AbortSignal.timeout(15_000),
  });

  const data = await res.json();
  return { data, status: res.status };
}
```

### 差异处理

| axios 特性 | fetch 等价 |
|------------|-----------|
| `interceptors.request` | 直接写 wrapper 函数 |
| `interceptors.response` | `try/catch` + 状态检查 |
| `http.Agent` keepAlive | undici 的 dispatcher（Node 20 内置） |
| `timeout` | `AbortSignal.timeout()` |
| `responseType: 'json'` | `res.json()` |
| `withCredentials` | 客户端行为，fetch 默认同源携带 |

### 评估

- **改动范围**: `src/services/apis/y_common.ts` 和 `src/services/apis/u_common.ts`（~60 行重写）
- **风险**: 中低。fetch API 在 Node 20.12+ 稳定
- **收益**: 移除 axios 及其 ~7 个传递依赖

---

## 2. `koa-bodyparser` → 原生 ✅

### 实现

[`middlewares/body-parser.ts`](../middlewares/body-parser.ts)：

```ts
import type { Middleware } from 'koa';

const METHODS = new Set(['POST', 'PUT', 'PATCH']);

const bodyParser = (): Middleware => async (ctx, next) => {
  if (!METHODS.has(ctx.method)) return await next();

  const buffers: Buffer[] = [];
  for await (const chunk of ctx.req) {
    buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  if (buffers.length === 0) return await next();

  const raw = Buffer.concat(buffers).toString('utf-8');
  const contentType = ctx.get('Content-Type') || '';

  try {
    ctx.request.body = contentType.includes('application/json') ? JSON.parse(raw) : raw;
  } catch {
    ctx.throw(400, 'Invalid JSON in request body');
  }

  await next();
};

export default bodyParser;
```

通过 `for await (const chunk of ctx.req)` 直接消费 Node.js 原生请求流，无需第三方库。

类型声明 [`types/koa.d.ts`](../types/koa.d.ts)：
```ts
declare module 'koa' {
  interface Request {
    body?: any;
  }
}
```

---

## 3. `koa-static` → 原生 ✅

### 实现

[`middlewares/static-serve.ts`](../middlewares/static-serve.ts)：

```ts
import fs from 'node:fs';
import path from 'node:path';
import type { Middleware } from 'koa';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const staticServe = (root: string): Middleware => async (ctx, next) => {
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') return await next();

  const filePath = path.resolve(root, ctx.path.slice(1));
  if (!filePath.startsWith(root) || !fs.existsSync(filePath)) return await next();

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) return await next();

  const ext = path.extname(filePath).toLowerCase();
  ctx.type = MIME_TYPES[ext] || 'application/octet-stream';
  ctx.length = stat.size;
  ctx.body = fs.createReadStream(filePath);
};

export default staticServe;
```

使用 `fs.createReadStream` 直接流式传输文件，Koa 自动处理流到响应的 pipe。

---

## 总结

| 项目 | `axios` | `koa-bodyparser` | `koa-static` |
|------|---------|-------------------|--------------|
| 状态 | ⏳ 待定 | ✅ 已完成 | ✅ 已完成 |
| 改动文件数 | ~3 | 3（新增 2 + 修改 1） | 2（新增 1 + 修改 1） |
| 新增代码量 | ~60 行 | ~22 行 | ~35 行 |
| 风险等级 | 中低 | 极低 | 低 |
| 移除依赖数 | 1 (+ ~7 传递) | 1 (+ ~4 传递) | 1 (+ ~3 传递) |

当前运行时依赖已精简为：

```json
"dependencies": {
  "@koa/router": "^15.5.0",
  "axios": "^1.13.2",
  "koa": "^3.1.0"
}
```

`koa-bodyparser` 和 `koa-static` 已完全移除，对应的原生实现共 ~55 行代码，所有 336 个测试通过。
