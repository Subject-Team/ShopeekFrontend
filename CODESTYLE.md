# Frontend Code Style

De-facto conventions for `frontend/`. No formatter or linter is enforced — typecheck runs via `npm run build` (`tsc && vite build`). This file is the reference; rules match the existing code.

## Formatting

- Semicolons always; single quotes in TS, double quotes in JSX attributes.
- One blank line between logical blocks; no trailing whitespace; end files with a newline.
- No file extensions on relative imports (`from '../types'`).

## Components

- `export const ComponentName: React.FC<Props> = ({ ... }) => { ... }`, props typed by an in-file `interface ComponentNameProps`.
- Shared types live in `src/types/index.ts` (`export interface`, snake_case fields matching the backend). Local unions/enums: `export type`.
- `import type { X }` for type-only imports; inline `type` modifier when mixing value + type imports (`import { Turnstile, type TurnstileInstance }`).

## State & hooks

- Explicit generics on `useState` (`useState<string>('')`, `useState<boolean>(false)`).
- Naming: data-fetch state `loading`, form-submit state `submitting`; booleans `is*` or semantic (`readOnly`); internal handlers `handleX`, callback props `onX`, hooks `useX`.
- Custom hooks live in their context file (`useAuth`, `useTheme`) or the page that owns them.

## Imports

- Order: `react` → third-party → internal. One import statement per module — no duplicates; no extension on `'./App'`.

## API & errors

- All network calls go through `src/services/api.ts` (`export const fetchX = async (...) => {...}`); components never call `fetch` directly.
- API functions throw `Error` with the backend `detail`; components catch with `catch (err: any)` and surface `err.message`.

## Styling

- Tailwind classes in template literals, conditional classes via ternaries. No clsx/cn helpers — do not add dependencies.
- RTL Persian UI: page-level `dir-rtl font-vazir`; UI strings are Persian inline in JSX, identifiers stay English.
- Numbers/dates: use `formatPersianNumber` / `formatPersianDate` from `src/utils` — do not hand-roll `Intl.NumberFormat` locally.

## Tests

- Colocated `__tests__/*.test.tsx`, vitest + React Testing Library (`describe` / `it`); globals mocked in `src/test/setup.ts`.
- Import `React` only when the file references it directly.
