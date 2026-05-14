'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addExerciseAction } from '../actions';

interface AddExerciseFormProps {
  workoutId: string;
  existingExercises: Array<{ id: string; name: string }>;
}

export function AddExerciseForm({ workoutId, existingExercises }: AddExerciseFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [pendingSelect, setPendingSelect] = React.useState(false);
  const [pendingNew, setPendingNew] = React.useState(false);

  async function handleSelectSubmit(e: React.FormEvent) {
    e.preventDefault();
    const exercise = existingExercises.find((ex) => ex.id === selectedId);
    if (!exercise) return;
    setPendingSelect(true);
    try {
      await addExerciseAction({ workoutId, name: exercise.name });
      router.refresh();
      setSelectedId('');
    } finally {
      setPendingSelect(false);
    }
  }

  async function handleNewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setPendingNew(true);
    try {
      await addExerciseAction({ workoutId, name: newName.trim() });
      router.refresh();
      setNewName('');
    } finally {
      setPendingNew(false);
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <form onSubmit={handleSelectSubmit} className="space-y-1.5">
        <Label htmlFor="existing-exercise">Select from Existing Exercises</Label>
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId} disabled={pendingSelect}>
            <SelectTrigger id="existing-exercise" className="flex-1">
              <SelectValue placeholder="Select an exercise…" />
            </SelectTrigger>
            <SelectContent>
              {existingExercises.map((ex) => (
                <SelectItem key={ex.id} value={ex.id}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={!selectedId || pendingSelect}>
            Add
          </Button>
        </div>
      </form>

      <div className="relative flex items-center">
        <div className="flex-1 border-t" />
        <span className="mx-3 text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t" />
      </div>

      <form onSubmit={handleNewSubmit} className="space-y-1.5">
        <Label htmlFor="new-exercise">Create a New Exercise</Label>
        <div className="flex gap-2">
          <Input
            id="new-exercise"
            placeholder="e.g. Bench Press"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={pendingNew}
            className="flex-1"
          />
          <Button type="submit" disabled={!newName.trim() || pendingNew}>
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}
