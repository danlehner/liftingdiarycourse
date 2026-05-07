import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getWorkoutById } from '@/data/workouts';
import { EditWorkoutForm } from './_components/EditWorkoutForm';

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId, userId);

  if (!workout) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        initialName={workout.name}
        initialStartedAt={workout.startedAt}
      />
    </main>
  );
}
