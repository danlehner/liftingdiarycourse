'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type WorkoutExerciseWithSets } from '@/data/exercises';
import { removeExerciseAction, deleteSetAction } from '../actions';
import { AddSetForm } from './AddSetForm';

interface ExerciseListProps {
  workoutId: string;
  exercises: WorkoutExerciseWithSets[];
}

export function ExerciseList({ workoutId, exercises }: ExerciseListProps) {
  const router = useRouter();
  const [pendingExerciseId, setPendingExerciseId] = React.useState<string | null>(null);
  const [pendingSetId, setPendingSetId] = React.useState<string | null>(null);

  async function handleRemoveExercise(workoutExerciseId: string) {
    setPendingExerciseId(workoutExerciseId);
    try {
      await removeExerciseAction({ workoutExerciseId, workoutId });
      router.refresh();
    } finally {
      setPendingExerciseId(null);
    }
  }

  async function handleDeleteSet(setId: string) {
    setPendingSetId(setId);
    try {
      await deleteSetAction({ setId, workoutId });
      router.refresh();
    } finally {
      setPendingSetId(null);
    }
  }

  if (exercises.length === 0) {
    return <p className="text-sm text-muted-foreground mb-4">No exercises logged yet.</p>;
  }

  return (
    <div className="space-y-4 mb-4">
      {exercises.map((we) => (
        <div key={we.id} className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">{we.exercise.name}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveExercise(we.id)}
              disabled={pendingExerciseId === we.id}
            >
              Remove
            </Button>
          </div>
          {we.sets.length > 0 && (
            <div className="space-y-1 mb-3">
              {we.sets.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground w-12">Set {s.setNumber}</span>
                  <span>{s.reps != null ? `${s.reps} reps` : '—'}</span>
                  <span>{s.weight != null ? `${s.weight} kg` : '—'}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteSet(s.id)}
                    disabled={pendingSetId === s.id}
                    aria-label="Delete set"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <AddSetForm
            workoutExerciseId={we.id}
            workoutId={workoutId}
            nextSetNumber={we.sets.length + 1}
          />
        </div>
      ))}
    </div>
  );
}
