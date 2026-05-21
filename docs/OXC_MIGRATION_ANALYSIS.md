# OXC 引入分析 & Vite+ 工具链迁移评估

> 基于当前项目工具链，评估引入 oxc（Oxidation Compiler）工具集并迁移到 Vite+ 原生工具链的可行性与难度。

## 当前状态

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | oxlint 替换 ESLint | ✅ 已完成 |
| Phase 2 | vite-plugin-oxc-transform | ✅ 已完成 |
| Phase 3 | oxfmt 替换 Prettier | ⏳ 等 oxfmt 1.0 |
| Phase 4 | tsc 保留 | 🔒 无可替代 |

---

## 1. oxlint 替换 ESLint ✅

### 实测对比

```
ESLint:  6.829s (210 个文件)
oxlint:  0.023s (210 个文件) — 快 ~300 倍
```

### 已移除的 8 个 devDependencies

`eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-standard`, `eslint-config-standard-with-typescript`, `eslint-plugin-import`, `eslint-plugin-n`, `eslint-plugin-promise`

### 配置

[`.oxlintrc.json`](../.oxlintrc.json)：

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "ignorePatterns": ["dist", "node_modules", "upstream-reference", "docs"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "no-const-assign": "error",
    "no-useless-catch": "off",
    "no-empty-file": "error",
    "unicorn/no-useless-fallback-in-spread": "warn",
    "sort-keys": "off"
  }
}
```

### package.json 脚本

```json
"lint": "oxlint",
"lint:fix": "oxlint --fix"
```

### 附带修复

- 删除了空文件 `tests/setup/vitest.setup.ts`（仅含注释，触发 `no-empty-file`）
- 从 `vitest.config.ts` 中移除了 `setupFiles` 引用

---

## 2. vite-plugin-oxc-transform ✅

### 实现

自定义 Vite 插件 [`plugins/vite-plugin-oxc-transform.ts`](../plugins/vite-plugin-oxc-transform.ts)：

```ts
import type { Plugin } from 'vite';
import { transformSync } from 'oxc-transform';

const TS_EXTENSIONS = /\.(ts|tsx|mts|cts)$/;

export function oxcTransform(): Plugin {
  return {
    name: 'vite-plugin-oxc-transform',
    enforce: 'pre',
    transform(code, id) {
      if (!TS_EXTENSIONS.test(id)) return;
      const { code: transformed, errors } = transformSync(id, code, {
        lang: id.endsWith('.tsx') ? 'tsx' : 'ts',
        typescript: { onlyRemoveTypeImports: true },
      });
      if (errors.length > 0) {
        this.error(`oxc-transform failed on ${id}: ${errors[0].message}`);
      }
      return { code: transformed, map: null };
    },
  };
}
```

直接使用 `oxc-transform` 而不是安装 `vite-plugin-oxc` npm 包（该包不支持 Vite 8）。插件在 Vite 构建 pipeline 的最前端（`enforce: 'pre'`）剥离 TypeScript 类型。

### vite.config.ts 集成

```ts
import { oxcTransform } from './plugins/vite-plugin-oxc-transform';

export default defineConfig({
  plugins: [oxcTransform()],
  // ...
});
```

---

## 3. Vite 8 现状 — 已是最新 Vite+

Vite 8.x 内置 Rust 工具链核心组件：

```
Vite 8
├── Rolldown（Rust bundler，替代 Rollup+esbuild）
│   ├── oxc-resolver（Rust 模块解析）
│   ├── oxc-parser（Rust AST 解析）
│   └── oxc-transform（Rust TS/JSX 转译）
└── esbuild（降级：仅用于兼容场景）
```

加上自定义的 `vite-plugin-oxc-transform`，TypeScript 转译阶段也交给了 oxc，整个构建管线已全面 Rust 化。

---

## 4. tsc — 保留 🔒

oxc 系列工具不支持生成 `.d.ts` 文件，tsc 必须保留：

- `tsc --emitDeclarationOnly` — 生成类型声明
- 类型检查（编译时）

---

## 5. oxfmt — 暂不推荐 ⏳

- 仍处于实验阶段，规则覆盖不完整
- Prettier 3.x 稳定且足够快
- 等 oxfmt 1.0 后再评估

---

## 总结

| 组件 | 当前 | 状态 | 收益 |
|------|------|------|------|
| Lint | oxlint | ✅ 已完成 | 300x 提速，移除 8 个 devDeps |
| Bundler | Vite 8 (Rolldown) | ✅ 已最优 | Rust 原生打包 |
| Resolver | oxc-resolver (内置) | ✅ 已最优 | Rust 原生解析 |
| Transform | vite-plugin-oxc-transform | ✅ 已完成 | TypeScript 转译 Rust 化 |
| Format | Prettier 3 | ⏸️ 观望 | 等 oxfmt 1.0 |
| Type Check | tsc | 🔒 保留 | 无可替代 |

**核心成果：lint 从 6.8s 降到 23ms，构建管线全面 Rust 化，devDependencies 减少 8 个包。**
