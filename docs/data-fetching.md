# Data Fetching Standards

## Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

- Do NOT fetch data in client components (`'use client'`)
- Do NOT fetch data in Next.js Route Handlers (`src/app/api/`)
- Do NOT use `useEffect` + `fetch` or any client-side data fetching pattern
- Do NOT use SWR, React Query, or any client-side data fetching library

If a component needs data, it must be a Server Component (no `'use client'` directive). Pass data down as props to any child Client Components that need it.

## Data Helper Functions

**ALL database queries MUST go through helper functions located in the `/src/data/` directory.**

- Do NOT write database queries directly in page or component files
- Do NOT use raw SQL strings
- All queries MUST use [Drizzle ORM](https://orm.drizzle.team/)

```
src/
  data/
    workouts.ts      # e.g. getWorkouts, getWorkoutById
    exercises.ts     # e.g. getExercises
    sets.ts          # e.g. getSetsByWorkoutExercise
```

### Example helper function

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

### Calling a helper from a Server Component

```tsx
// src/app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { getWorkouts } from '@/data/workouts';

export default async function DashboardPage() {
  const { userId } = await auth();
  const userWorkouts = await getWorkouts(userId);

  return <WorkoutList workouts={userWorkouts} />;
}
```

## User Data Isolation — Critical Security Requirement

**A logged-in user MUST only ever be able to access their own data.**

Every helper function that returns user-owned data MUST:

1. Accept `userId` as a parameter
2. Filter all queries by that `userId`
3. Never return rows belonging to another user

The `userId` must always be obtained from the authenticated session (e.g. `auth()`) inside the Server Component and passed into the helper. **Never accept a `userId` from URL params, query strings, or request bodies without verifying it matches the authenticated user.**

### The `workouts` table owns data via `userId`

The `workouts` table has a `userId` column. All workout-related queries must include a `where(eq(workouts.userId, userId))` clause. Because `workoutExercises` and `sets` are children of `workouts` (via foreign keys with cascade), joining through `workouts` with a `userId` filter is sufficient to scope those tables as well.

### Example — correct (scoped by userId)

```ts
export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}
```

### Example — WRONG (missing userId filter — never do this)

```ts
// ❌ Any authenticated user could fetch any workout by guessing an ID
export async function getWorkoutById(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId));

  return workout ?? null;
}
```
