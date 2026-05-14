import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getWorkoutById } from '@/data/workouts';
import { getWorkoutExercisesWithSets, getAllExercises } from '@/data/exercises';
import { EditWorkoutForm } from './_components/EditWorkoutForm';
import { ExerciseList } from './_components/ExerciseList';
import { AddExerciseForm } from './_components/AddExerciseForm';

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { workoutId } = await params;
  const workout = await getWorkoutById(workoutId, userId);

  if (!workout) notFound();

  const [workoutExercises, allExercises] = await Promise.all([
    getWorkoutExercisesWithSets(workoutId),
    getAllExercises(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        initialName={workout.name}
        initialStartedAt={workout.startedAt}
      />

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">Exercises</h2>
        <ExerciseList workoutId={workout.id} exercises={workoutExercises} />
        <AddExerciseForm workoutId={workout.id} existingExercises={allExercises} />
      </section>
    </main>
  );
}
