import { db } from '@/db';
import { exercises, workoutExercises } from '@/db/schema';
import { and, asc, eq, ilike, max } from 'drizzle-orm';

export type WorkoutExerciseWithSets = {
  id: string;
  order: number;
  exercise: { id: string; name: string };
  sets: Array<{ id: string; setNumber: number; reps: number | null; weight: string | null }>;
};

export async function getAllExercises() {
  return db.select({ id: exercises.id, name: exercises.name }).from(exercises).orderBy(asc(exercises.name));
}

export async function findExerciseByName(name: string) {
  const [exercise] = await db
    .select()
    .from(exercises)
    .where(ilike(exercises.name, name));
  return exercise ?? null;
}

export async function createExercise(name: string) {
  const [exercise] = await db.insert(exercises).values({ name }).returning();
  return exercise;
}

export async function getWorkoutExercisesWithSets(workoutId: string): Promise<WorkoutExerciseWithSets[]> {
  const results = await db.query.workoutExercises.findMany({
    where: eq(workoutExercises.workoutId, workoutId),
    orderBy: [asc(workoutExercises.order)],
    with: {
      exercise: true,
      sets: {
        orderBy: (s, { asc: a }) => [a(s.setNumber)],
      },
    },
  });
  return results.map((we) => ({
    id: we.id,
    order: we.order,
    exercise: { id: we.exercise.id, name: we.exercise.name },
    sets: we.sets.map((s) => ({
      id: s.id,
      setNumber: s.setNumber,
      reps: s.reps,
      weight: s.weight,
    })),
  }));
}

export async function getMaxExerciseOrder(workoutId: string): Promise<number> {
  const [result] = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  return result?.maxOrder ?? 0;
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string, order: number) {
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning();
  return workoutExercise;
}

export async function getWorkoutExerciseById(workoutExerciseId: string, workoutId: string) {
  const [we] = await db
    .select()
    .from(workoutExercises)
    .where(and(eq(workoutExercises.id, workoutExerciseId), eq(workoutExercises.workoutId, workoutId)));
  return we ?? null;
}

export async function removeExerciseFromWorkout(workoutExerciseId: string) {
  await db.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId));
}
