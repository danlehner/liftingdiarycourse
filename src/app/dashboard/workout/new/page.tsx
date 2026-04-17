import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { NewWorkoutForm } from './_components/NewWorkoutForm';

export default async function NewWorkoutPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New Workout</h1>
      <NewWorkoutForm />
    </main>
  );
}
