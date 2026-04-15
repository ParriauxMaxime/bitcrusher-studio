# Phase 0 — Repo Scaffold

**Outcome:** `npm run dev` opens an empty typed React 19 app at :3000; `npm run check` + `npm run typecheck` + `npm run test` all pass; git repo initialized with `.gitignore` and spec/plan committed.

**Working directory:** `/home/maxime/Documents/emergence/bitcrusher-studio`

---

### Task 0.1: Initialize git and `.gitignore`

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Initialize repo**

```bash
cd /home/maxime/Documents/emergence/bitcrusher-studio
git init -b main
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules/
dist/
.rsbuild/
coverage/
.superpowers/
_wayback/
.DS_Store
*.log
.env
.env.local
public/media/.peaks-cache.json
src/content/generated.ts
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore docs/
git commit -m "🎉 init: spec + plan + gitignore"
```

---

### Task 0.2: Root `package.json`

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "bitcrusher-studio",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "npm-run-all --parallel dev:content dev:rsbuild",
    "dev:rsbuild": "rsbuild dev --open",
    "dev:content": "tsx scripts/sync-content-types.ts --watch",
    "build": "tsx scripts/prebuild.ts && rsbuild build",
    "check": "biome check .",
    "check:fix": "biome check --fix .",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "i18next": "^26.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-i18next": "^17.0.0",
    "react-router": "^7.0.0",
    "ts-pattern": "^5.9.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.7",
    "@rsbuild/core": "^1.0.0",
    "@rsbuild/plugin-react": "^1.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitest/coverage-v8": "^2.1.0",
    "axe-core": "^4.10.0",
    "gray-matter": "^4.0.3",
    "jsdom": "^25.0.0",
    "node-web-audio-api": "^1.0.0",
    "npm-run-all2": "^7.0.0",
    "sharp": "^0.33.0",
    "tsx": "^4.19.0",
    "typescript": "^5.9.3",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Install**

```bash
npm install
```

Expected: no errors. Lockfile created.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "🔧 feat: root package.json with pinned deps"
```

---

### Task 0.3: TypeScript config

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "jsxImportSource": "@emotion/react",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "scripts", "tests", "vitest.config.ts", "rsbuild.config.ts"]
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
```

Expected: no errors (file is empty of code — config only).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "🔧 feat: tsconfig with strict mode + path alias"
```

---

### Task 0.4: Biome config

**Files:**
- Create: `biome.json`

- [ ] **Step 1: Write `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.10/schema.json",
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noArrayIndexKey": "off"
      }
    }
  },
  "files": {
    "includes": [
      "**",
      "!**/dist",
      "!**/node_modules",
      "!**/.rsbuild",
      "!**/coverage",
      "!.superpowers",
      "!docs",
      "!_wayback",
      "!src/content/generated.ts"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  }
}
```

- [ ] **Step 2: Verify**

```bash
npx biome check .
```

Expected: no errors, no files to check (or ok).

- [ ] **Step 3: Commit**

```bash
git add biome.json
git commit -m "🔧 feat: biome config (tabs, organize imports)"
```

---

### Task 0.5: Rsbuild config (minimal)

**Files:**
- Create: `rsbuild.config.ts`

- [ ] **Step 1: Write `rsbuild.config.ts`**

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	plugins: [pluginReact()],
	source: {
		entry: {
			index: "./src/main.tsx",
		},
	},
	html: {
		template: "./src/index.html",
	},
	server: {
		port: 3000,
	},
	output: {
		distPath: { root: "dist" },
	},
	tools: {
		swc: {
			jsc: {
				transform: {
					react: {
						runtime: "automatic",
						importSource: "@emotion/react",
					},
				},
			},
		},
	},
});
```

- [ ] **Step 2: Commit (verified by Task 0.7)**

```bash
git add rsbuild.config.ts
git commit -m "🔧 feat: minimal rsbuild config (react + emotion jsx)"
```

---

### Task 0.6: Bare React entry

**Files:**
- Create: `src/index.html`
- Create: `src/main.tsx`
- Create: `src/root.tsx`

- [ ] **Step 1: `src/index.html`**

```html
<!doctype html>
<html lang="fr" data-theme="graphite">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Bitcrusher Studio</title>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>
```

- [ ] **Step 2: `src/root.tsx`**

```tsx
export const Root = () => {
	return <main>Bitcrusher Studio — bootstrap.</main>;
};
```

- [ ] **Step 3: `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Root } from "./root";

const container = document.getElementById("root");
if (!container) throw new Error("Root container #root not found");

createRoot(container).render(
	<StrictMode>
		<Root />
	</StrictMode>,
);
```

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "🎉 feat: bare react entry"
```

---

### Task 0.7: Verify dev + build

- [ ] **Step 1: Run dev server**

```bash
npm run dev:rsbuild
```

Expected: server starts on `:3000`, browser opens, page shows "Bitcrusher Studio — bootstrap." Stop with `Ctrl+C`.

- [ ] **Step 2: Build**

```bash
tsx -e "" || echo "tsx missing"  # sanity
npm run build || true
```

Build will fail on the first run because `scripts/prebuild.ts` doesn't exist yet. **Temporarily** bypass for this task only:

```bash
npx rsbuild build
```

Expected: `dist/index.html` exists. Inspect:

```bash
ls dist/
```

- [ ] **Step 3: Clean `dist` (it's gitignored; just ensure it's not tracked)**

```bash
git status
```

Expected: clean tree.

---

### Task 0.8: Vitest config + smoke test

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
		},
	},
});
```

- [ ] **Step 2: Write failing test `tests/smoke.test.ts`**

```ts
import { describe, expect, it } from "vitest";

describe("smoke", () => {
	it("runs", () => {
		expect(1 + 1).toBe(2);
	});
});
```

- [ ] **Step 3: Run test**

```bash
npm run test
```

Expected: 1 passing.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/
git commit -m "🧪 feat: vitest config + smoke test"
```

---

### Task 0.9: Pre-commit hook (optional but strongly recommended)

**Files:**
- Create: `.git/hooks/pre-commit` (NOT tracked by git — local only)

- [ ] **Step 1: Install hook**

```bash
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
npm run check --silent
EOF
chmod +x .git/hooks/pre-commit
```

- [ ] **Step 2: Verify**

```bash
.git/hooks/pre-commit && echo OK
```

Expected: `OK`.

---

### Task 0.10: Phase 0 sign-off

- [ ] **Step 1: Full verification**

```bash
npm run check && npm run typecheck && npm run test
```

All exit 0.

- [ ] **Step 2: Log state**

```bash
git log --oneline
```

Expected: ~7 commits (init, package, tsconfig, biome, rsbuild, entry, vitest).

Phase 0 complete. Proceed to `phase-1-theme-shell.md`.
