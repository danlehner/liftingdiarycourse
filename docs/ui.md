# UI Coding Standards

## Component Library

**Only [shadcn/ui](https://ui.shadcn.com/) components are permitted in this project.**

- Do NOT create custom UI components.
- Do NOT use any other component libraries (e.g. Radix primitives directly, MUI, Chakra, etc.).
- If a needed UI element is available in shadcn/ui, use it. If it is not available, add the appropriate shadcn component via the CLI before building anything custom.

```bash
# Add a shadcn component
npx shadcn@latest add <component-name>
```

Components are installed into `src/components/ui/`. Do not modify generated shadcn files unless strictly necessary.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/).

Dates must be displayed in the following format:

```
1st Sept 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token with `date-fns/format`:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sept 2025"
```

Do not use `toLocaleDateString`, `Intl.DateTimeFormat`, or any other date formatting approach.
