'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout, getWorkoutById } from '@/data/workouts';
import {
  findExerciseByName,
  createExercise,
  getMaxExerciseOrder,
  addExerciseToWorkout,
  getWorkoutExerciseById,
  removeExerciseFromWorkout,
} from '@/data/exercises';
import { getMaxSetNumber, addSet, getSetInWorkout, deleteSet } from '@/data/sets';

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  startedAt: z.date(),
});

export async function updateWorkoutAction(input: {
  workoutId: string;
  name?: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = UpdateWorkoutSchema.parse(input);

  return updateWorkout(parsed.workoutId, userId, {
    name: parsed.name ?? null,
    startedAt: parsed.startedAt,
  });
}

const AddExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

export async function addExerciseAction(input: { workoutId: string; name: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = AddExerciseSchema.parse(input);

  const workout = await getWorkoutById(parsed.workoutId, userId);
  if (!workout) throw new Error('Unauthorized');

  const existing = await findExerciseByName(parsed.name);
  const exercise = existing ?? (await createExercise(parsed.name));

  const maxOrder = await getMaxExerciseOrder(parsed.workoutId);
  await addExerciseToWorkout(parsed.workoutId, exercise.id, maxOrder + 1);
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  workoutId: z.string().uuid(),
});

export async function removeExerciseAction(input: {
  workoutExerciseId: string;
  workoutId: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = RemoveExerciseSchema.parse(input);

  const workout = await getWorkoutById(parsed.workoutId, userId);
  if (!workout) throw new Error('Unauthorized');

  const we = await getWorkoutExerciseById(parsed.workoutExerciseId, parsed.workoutId);
  if (!we) throw new Error('Unauthorized');

  await removeExerciseFromWorkout(parsed.workoutExerciseId);
}

const AddSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  workoutId: z.string().uuid(),
  reps: z.number().int().positive().nullable(),
  weight: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable(),
});

export async function addSetAction(input: {
  workoutExerciseId: string;
  workoutId: string;
  reps: number | null;
  weight: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = AddSetSchema.parse(input);

  const workout = await getWorkoutById(parsed.workoutId, userId);
  if (!workout) throw new Error('Unauthorized');

  const we = await getWorkoutExerciseById(parsed.workoutExerciseId, parsed.workoutId);
  if (!we) throw new Error('Unauthorized');

  const maxSetNumber = await getMaxSetNumber(parsed.workoutExerciseId);
  await addSet(parsed.workoutExerciseId, maxSetNumber + 1, parsed.reps, parsed.weight);
}

const DeleteSetSchema = z.object({
  setId: z.string().uuid(),
  workoutId: z.string().uuid(),
});

export async function deleteSetAction(input: { setId: string; workoutId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const parsed = DeleteSetSchema.parse(input);

  const workout = await getWorkoutById(parsed.workoutId, userId);
  if (!workout) throw new Error('Unauthorized');

  const set = await getSetInWorkout(parsed.setId, parsed.workoutId);
  if (!set) throw new Error('Unauthorized');

  await deleteSet(parsed.setId);
}
