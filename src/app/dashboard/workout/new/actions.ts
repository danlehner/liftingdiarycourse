'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
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
  if (!userId) throw new Error('Unauthorized');

  const parsed = CreateWorkoutSchema.parse(input);

  return createWorkout(userId, parsed.name, parsed.startedAt);
}
