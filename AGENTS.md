## Project

Simple single-page React stopwatch with configurable lap/rest intervals. No routing, no state management library, no tests.

- **Stack**: React 19, TypeScript 5.8, Vite 7, Tailwind CSS v4
- **Deployed at**: https://umbrella1234.github.io/Stopwatch/ (GitHub Pages)

## Commands

| Command | What it runs |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | `eslint .` (flat config, no fix) |
| `npm run preview` | `vite preview` (serve built output) |
| `npm run deploy` | `npm run build && gh-pages -d dist` |

Build uses TypeScript project references (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`). Both must pass for build to succeed.

## Conventions

- **Component structure**: folder name matches component name; props interface in `ComponentName.types.ts`, exported
- **Component definition**: `const Foo: FC<FooProps> = (props) => ...`
- **Classnames**: use the `classnames` library for conditional classes
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"` in CSS — no `tailwind.config.js`)
- **TypeScript**: `strict: true`, `verbatimModuleSyntax: true` (use `type` keyword for type-only imports), `erasableSyntaxOnly: true` (no enums/namespaces/parameter properties)
- **Deploy base**: Vite `base: "/Stopwatch/"` — internal links and assets must account for this

### React patterns

- **Handler style**: one-liners use anonymous functions in JSX; multi-liners extract a named function outside JSX. Rely on TypeScript to infer handler parameters — never duplicate type annotations.
- **Destructuring**: do not supply `false` as a default value for booleans; let it default to `undefined`.
- **Memoization**: `useMemo` and `useCallback` only for heavy calculations or when passing to memoized children. Default to no memoization.
- **IIFEs**: never use immediately invoked function expressions for computed values. Extract a named function instead.
- **Conditionals**: place the positive/truthy branch first in if/else and ternary expressions.

### Import patterns

- **Barrel exports**: forbidden. Never use `index.ts` to re-export.
- **Imports**: external packages first, then relative imports.

### TypeScript patterns

- **Generics**: `Array<Type>`, never `Type[]`.
- **Function params**: object pattern with a named type for >2 parameters. Single and double positional params are acceptable.
- **Null/undefined**: handle both explicitly.

### Comments

- Never write comments unless explicitly asked. When asked, describe what the function does from the caller's perspective (how to use it), not how it's implemented internally.
