import { db } from '@/db';
import { sets, workoutExercises } from '@/db/schema';
import { and, eq, max } from 'drizzle-orm';

export async function getMaxSetNumber(workoutExerciseId: string): Promise<number> {
  const [result] = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));
  return result?.maxSetNumber ?? 0;
}

export async function addSet(
  workoutExerciseId: string,
  setNumber: number,
  reps: number | null,
  weight: string | null,
) {
  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weight })
    .returning();
  return set;
}

export async function getSetInWorkout(setId: string, workoutId: string) {
  const [result] = await db
    .select({ set: sets })
    .from(sets)
    .innerJoin(
      workoutExercises,
      and(eq(sets.workoutExerciseId, workoutExercises.id), eq(workoutExercises.workoutId, workoutId)),
    )
    .where(eq(sets.id, setId));
  return result?.set ?? null;
}

export async function deleteSet(setId: string) {
  await db.delete(sets).where(eq(sets.id, setId));
}
