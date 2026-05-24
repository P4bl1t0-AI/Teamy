import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { getCalendarEntriesRange, getTeamHolidays, getProfiles } from '@/app/calendar-actions'

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; day?: string }>
}) {
  const params = await searchParams
  const now = new Date()

  // Date de référence : aujourd'hui par défaut, ou celle fournie en paramètre
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1
  const day = params.day ? parseInt(params.day) : now.getDate()
  const refDate = new Date(year, month - 1, day)

  // Calcul du lundi de la semaine de référence
  const d = new Date(refDate)
  const dayOfWeek = d.getDay()
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek
  d.setDate(d.getDate() + diff)

  // 4 semaines à partir de ce lundi
  const startDate = d.toISOString().split('T')[0]
  const endD = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 27)
  const endDate = endD.toISOString().split('T')[0]

  const [entries, holidays, profiles] = await Promise.all([
    getCalendarEntriesRange(startDate, endDate),
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
