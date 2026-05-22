import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { getCalendarEntries, getTeamHolidays, getProfiles } from '@/app/calendar-actions'

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1

  const [entries, holidays, profiles] = await Promise.all([
    getCalendarEntries(year, month),
    getTeamHolidays(year),
    getProfiles(),
  ])

  return (
    <main className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Calendrier</h1>
      <CalendarGrid
        initialEntries={entries}
        initialHolidays={holidays}
        profiles={profiles}
      />
    </main>
  )
}
