'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { updateWorkoutAction } from '../actions';

interface EditWorkoutFormProps {
  workoutId: string;
  initialName: string | null;
  initialStartedAt: Date;
}

export function EditWorkoutForm({ workoutId, initialName, initialStartedAt }: EditWorkoutFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(initialName ?? '');
  const [startedAt, setStartedAt] = React.useState<Date>(initialStartedAt);
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const workout = await updateWorkoutAction({
      workoutId,
      name: name.trim() || undefined,
      startedAt,
    });
    router.push(`/dashboard?date=${workout.startedAt.toISOString().slice(0, 10)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name (optional)</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Push day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn('w-64 justify-start text-left font-normal')}
            >
              <CalendarIcon className="mr-2 size-4" />
              {format(startedAt, 'do MMM yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startedAt}
              onSelect={(d) => {
                if (!d) return;
                setStartedAt(d);
                setCalendarOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
