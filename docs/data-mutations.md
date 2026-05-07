# Data Mutations Standards

## Helper Functions in `/src/data/`

**ALL database mutations MUST go through helper functions located in the `/src/data/` directory.**

- Do NOT write database mutations directly in page, component, or action files
- Do NOT use raw SQL strings
- All mutations MUST use [Drizzle ORM](https://orm.drizzle.team/)

```
src/
  data/
    workouts.ts      # e.g. createWorkout, updateWorkout, deleteWorkout
    exercises.ts     # e.g. createExercise
    sets.ts          # e.g. createSet, updateSet, deleteSet
```

### Example helper function

```ts
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(userId: string, name: string) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name })
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string, userId: string) {
  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

## Server Actions

**ALL data mutations MUST be triggered via Server Actions.**

- Do NOT mutate data from Route Handlers (`src/app/api/`)
- Do NOT mutate data directly inside Server or Client Components
- Server Actions MUST be defined in colocated `actions.ts` files, co-located next to the route that uses them

```
src/app/
  workouts/
    new/
      page.tsx
      actions.ts    ← server actions for this route
```

### `'use server'` directive

Every `actions.ts` file MUST begin with the `'use server'` directive.

```ts
'use server';
```

### Typed parameters — no `FormData`

Server Action parameters MUST be explicitly typed. **Do NOT use `FormData` as a parameter type.**

```ts
// ✓ Correct — typed parameters
export async function createWorkout(name: string, startedAt: Date) { ... }

// ✗ Wrong — FormData is not permitted
export async function createWorkout(formData: FormData) { ... }
```

### Zod validation

**ALL Server Action arguments MUST be validated with [Zod](https://zod.dev/) before use.**

Parse and validate at the top of every action before calling any helper or touching the database.

```ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createWorkout } from '@/data/workouts';

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startedAt: z.date(),
});

export async function createWorkoutAction(input: {
  name?: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  const parsed = CreateWorkoutSchema.parse(input);

  return createWorkout(userId, parsed.name, parsed.startedAt);
}
```

## Redirects After Mutations

**Do NOT call `redirect()` inside Server Actions. Redirects MUST be handled client-side after the action resolves.**

Calling `redirect()` inside a Server Action throws internally and can cause unexpected behaviour when the action is invoked programmatically from a Client Component. Instead, return a value from the action and let the calling Client Component perform the navigation using the Next.js router.

```ts
// ✓ Correct — action returns a value, client navigates
// actions.ts
export async function createWorkoutAction(input: { name?: string; startedAt: Date }) {
  // ... validate, mutate ...
  return { workoutId: workout.id, startedAt: workout.startedAt };
}

// Component.tsx (Client Component)
const router = useRouter();
const result = await createWorkoutAction(input);
router.push(`/dashboard?date=${result.startedAt.toISOString().slice(0, 10)}`);

// ✗ Wrong — redirect inside the action
export async function createWorkoutAction(input: { name?: string; startedAt: Date }) {
  // ... validate, mutate ...
  redirect('/dashboard'); // ← do not do this
}
```

## User Data Isolation — Critical Security Requirement

**A logged-in user MUST only ever be able to mutate their own data.**

Every mutation helper that operates on user-owned data MUST:

1. Accept `userId` as a parameter
2. Scope all writes/deletes by that `userId`
3. Never modify rows belonging to another user

The `userId` must always come from the authenticated session (`auth()`) inside the Server Action. **Never accept a `userId` from URL params, form fields, or any client-supplied input.**

### Example — correct (userId from session, scoped in query)

```ts
// src/app/workouts/[id]/actions.ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { deleteWorkout } from '@/data/workouts';

const DeleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function deleteWorkoutAction(input: { workoutId: string }) {
  const { userId } = await auth();
  const { workoutId } = DeleteWorkoutSchema.parse(input);

  await deleteWorkout(workoutId, userId);
}
```

### Example — WRONG (userId from client — never do this)

```ts
// ✗ Never trust userId from the client
export async function deleteWorkoutAction(input: {
  workoutId: string;
  userId: string; // ← attacker can supply any userId
}) {
  await deleteWorkout(input.workoutId, input.userId);
}
```
