# Authentication Standards

## Clerk is the Only Auth Provider

This app uses **[Clerk](https://clerk.com/)** for all authentication. Do NOT use NextAuth, Auth.js, custom JWT logic, or any other authentication library or pattern.

The installed package is `@clerk/nextjs`.

## ClerkProvider

`<ClerkProvider>` wraps the entire app in `src/app/layout.tsx`. Do not add it anywhere else.

## Middleware

Clerk middleware is configured in `src/middleware.ts` using `clerkMiddleware()`. Do not modify the matcher config unless you have a specific reason.

```ts
// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

## Getting the Current User

### In Server Components

Use `auth()` from `@clerk/nextjs/server`. It returns a promise — always `await` it.

```ts
import { auth } from '@clerk/nextjs/server'

export default async function SomePage() {
  const { userId } = await auth()
  if (!userId) return null

  // use userId to fetch user-scoped data
}
```

- Always guard against a `null` userId. Return `null` or redirect if the user is not authenticated.
- Never read `userId` from URL params, query strings, or request bodies — always obtain it from `auth()`.

### In Client Components

Do NOT call `auth()` in Client Components — it is a server-only API. If a Client Component needs identity information, obtain it in a Server Component and pass it down as a prop, or use Clerk's client-side hooks such as `useAuth()` or `useUser()`.

## UI — Sign In / Sign Up / User Button

Use Clerk's pre-built UI components for all auth-related UI. Do not build custom sign-in/sign-up forms.

| Component | Purpose |
|---|---|
| `<SignInButton mode="modal">` | Triggers the Clerk sign-in modal |
| `<SignUpButton mode="modal">` | Triggers the Clerk sign-up modal |
| `<UserButton />` | Displays the signed-in user's avatar and account menu |
| `<Show when="signed-in">` | Conditionally renders children when signed in |
| `<Show when="signed-out">` | Conditionally renders children when signed out |

These are already wired up in `src/app/layout.tsx`. Do not duplicate them.

## Route Protection

To protect a route so only authenticated users can access it, check `userId` at the top of the Server Component page and return early (or redirect) if it is `null`:

```ts
const { userId } = await auth()
if (!userId) return null
```

For redirect-based protection, use Next.js `redirect()`:

```ts
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function ProtectedPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // ...
}
```
