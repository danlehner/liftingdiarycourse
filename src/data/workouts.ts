import { db } from '@/db';
import { workouts } from '@/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

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
