'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addSetAction } from '../actions';

interface AddSetFormProps {
  workoutExerciseId: string;
  workoutId: string;
  nextSetNumber: number;
}

export function AddSetForm({ workoutExerciseId, workoutId, nextSetNumber }: AddSetFormProps) {
  const router = useRouter();
  const [reps, setReps] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await addSetAction({
        workoutExerciseId,
        workoutId,
        reps: reps ? parseInt(reps, 10) : null,
        weight: weight.trim() || null,
      });
      router.refresh();
      setReps('');
      setWeight('');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <span className="text-sm text-muted-foreground w-14">Set {nextSetNumber}</span>
      <Input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        disabled={pending}
        className="w-20"
        min={1}
      />
      <Input
        type="number"
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        disabled={pending}
        className="w-24"
        min={0}
        step="0.01"
      />
      <Button type="submit" size="sm" disabled={pending}>
        Log
      </Button>
    </form>
  );
}
