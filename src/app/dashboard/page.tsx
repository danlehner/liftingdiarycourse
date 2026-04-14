"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Placeholder workout data — replace with real data fetching later
const MOCK_WORKOUTS = [
  { id: 1, name: "Back Squat", sets: 4, reps: 5, weight: "100kg" },
  { id: 2, name: "Romanian Deadlift", sets: 3, reps: 8, weight: "80kg" },
  { id: 3, name: "Leg Press", sets: 3, reps: 12, weight: "120kg" },
]

export default function DashboardPage() {
  const [date, setDate] = React.useState<Date>(new Date())
  const [open, setOpen] = React.useState(false)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Workout Log</h1>

      {/* Date picker */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-64 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {date ? format(date, "do MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) {
                setDate(d)
                setOpen(false)
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Workout list */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-medium text-muted-foreground">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>

        {MOCK_WORKOUTS.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <ul className="space-y-3">
            {MOCK_WORKOUTS.map((workout) => (
              <li
                key={workout.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <span className="font-medium">{workout.name}</span>
                <span className="text-sm text-muted-foreground">
                  {workout.sets} × {workout.reps} @ {workout.weight}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
