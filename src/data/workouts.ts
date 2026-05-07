import { db } from '@/db';
import { workouts } from '@/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

export async function createWorkout(userId: string, name: string | undefined, startedAt: Date) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();

  return workout;
}

export async function getWorkoutById(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));

  return workout ?? null;
}

export async function updateWorkout(
  workoutId: string,
  userId: string,
  values: { name?: string | null; startedAt?: Date },
) {
  const [workout] = await db
    .update(workouts)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout;
}

export async function getWorkoutsByDate(userId: string, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, start),
        lt(workouts.startedAt, end),
      ),
    );
}
