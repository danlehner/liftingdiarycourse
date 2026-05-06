# Routing Standards

## All App Routes Live Under `/dashboard`

Every page in this application (beyond the public landing page at `/`) is a sub-route of `/dashboard`. There are no other top-level route segments.

```
src/app/
  page.tsx                              # Public landing page (/)
  dashboard/
    page.tsx                            # /dashboard
    workout/
      new/
        page.tsx                        # /dashboard/workout/new
      [workoutId]/
        page.tsx                        # /dashboard/workout/[workoutId]
```

When adding new pages, place them under `src/app/dashboard/`.

## Protected Routes — Middleware Is the Enforcement Point

All `/dashboard` routes are protected. Only authenticated users may access them. Route protection is handled in **Next.js middleware** (`src/middleware.ts`) — not inside individual page components.

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- `auth.protect()` redirects unauthenticated users to the Clerk sign-in page automatically.
- Do NOT add per-page auth guards (e.g. `if (!userId) redirect('/sign-in')`) inside dashboard pages — the middleware already handles this.
- Do NOT duplicate route protection logic in Server Components that live under `/dashboard`.

## Public Routes

Only routes outside of `/dashboard` are public. The root page (`/`) is public. If you add other public routes (e.g. `/about`), no middleware changes are needed — just don't place them under `/dashboard`.

## Linking Between Pages

Use Next.js `<Link>` for all internal navigation. Do not use `<a>` tags or `window.location`.

```tsx
import Link from 'next/link'

<Link href="/dashboard">Back to Dashboard</Link>
<Link href={`/dashboard/workout/${workoutId}`}>View Workout</Link>
```

## Redirects After Mutations

After a successful server action (create, update, delete), redirect using Next.js `redirect()` from `next/navigation`:

```ts
import { redirect } from 'next/navigation'

// after creating a workout:
redirect(`/dashboard/workout/${newWorkout.id}`)

// after deleting a workout:
redirect('/dashboard')
```
