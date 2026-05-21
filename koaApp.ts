import Koa from 'koa';
import bodyParser from './middlewares/body-parser';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import staticServe from './middlewares/static-serve';
import cors from './middlewares/koa-cors';
import router from './routers/router';
import cookieMiddleware from './util/cookie';
import colors from './util/colors';
import userInfoImport from './config/user-info';
import type { UserInfo } from './types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = new Koa();
const publicDir = fs.existsSync(path.join(__dirname, 'public'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'public');

global.userInfo = userInfoImport as UserInfo;

// Error handler (must be first) — catches downstream errors, sets response
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    ctx.status = e.status || 500;
    ctx.body = { error: e.message || 'Internal Server Error' };
    ctx.app.emit('error', err, ctx);
  }
});

// Error listener — structured logging, suppresses Koa's default stderr dump
app.on('error', (err: unknown, ctx?: Koa.Context) => {
  const e = err as { status?: number; message?: string };
  const status = e.status || 500;
  const line = `${ctx?.method || '?'} ${ctx?.url || '?'} → ${status} ${e.message || 'Unknown'}`;
  if (status >= 500) {
    console.error(colors.error(line));
  } else {
    console.log(colors.info(line));
  }
});

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(colors.prompt(`${ctx.method} ${ctx.url} - ${rt}`));
});

// CORS
app.use(cors({
  origin: ctx => ctx.request.header?.origin || '*',
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Body parser
app.use(bodyParser());

// Cookie + fallback (merged: resolves cookie once)
app.use(cookieMiddleware());
app.use(staticServe(publicDir));

app.use(router.routes());
app.use(router.allowedMethods());

export default app;
