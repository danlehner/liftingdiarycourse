import { auth } from "@clerk/nextjs/server"
import { format } from "date-fns"
import Link from "next/link"
import { getWorkoutsByDate } from "@/data/workouts"
import { DatePicker } from "./_components/DatePicker"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { userId } = await auth()
  if (!userId) return null

  const { date: dateParam } = await searchParams
  const dateStr = typeof dateParam === "string" ? dateParam : null
  const selectedDate = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date()

  const workoutList = await getWorkoutsByDate(userId, selectedDate)

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Workout Log</h1>

      <DatePicker selectedDate={selectedDate} />

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-medium text-muted-foreground">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

        {workoutList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <ul className="space-y-3">
            {workoutList.map((workout) => (
              <li key={workout.id}>
                <Link
                  href={`/dashboard/workout/${workout.id}`}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-accent transition-colors"
                >
                  <span className="font-medium">
                    {workout.name ?? "Untitled Workout"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(workout.startedAt, "h:mm a")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
