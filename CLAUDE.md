# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Dev server at localhost:4200
npm run build          # Production build (output: dist/a)
npm run watch          # Dev build with watch mode
npm test               # Run all tests (Vitest)
npx ng generate <type> # Generate components, services, etc.
```

No lint command is configured yet.

## Architecture

- **Angular 21** with **standalone components** (no NgModules)
- **Signals** for reactive state (`signal()`, `computed()`, `effect()`)
- **Vitest** + jsdom for unit testing (not Jasmine/Karma)
- **SCSS** for component and global styles
- Bootstrapped via `bootstrapApplication()` in `src/main.ts` with config from `src/app/app.config.ts`
- Routes defined in `src/app/app.routes.ts` (currently empty)
- Project name in angular.json is `"a"` — selector prefix is `app`

## TypeScript

Strict mode is fully enabled:
- `strict: true`, `strictTemplates: true`, `strictInjectionParameters: true`, `strictInputAccessModifiers: true`
- `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`

## Code Style

- 2-space indentation
- Single quotes (TypeScript)
- Print width: 100 (Prettier configured in package.json)
- HTML parser set to `angular` in Prettier config
