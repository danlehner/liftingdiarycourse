'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout } from '@/data/workouts';

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
