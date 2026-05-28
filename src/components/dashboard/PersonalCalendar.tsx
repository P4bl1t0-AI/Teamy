'use client'

import { useMemo } from 'react'
import type { Profile, CalendarEntry, TeamHoliday, PresenceType } from '@/types'
import { PRESENCE_COLORS, PRESENCE_LABELS, DAY_LABELS } from '@/lib/constants'
import { formatDateLocal } from '@/lib/utils'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PersonalCalendarProps {
  currentDate: Date
  entries: CalendarEntry[]
  holidays: TeamHoliday[]
  profile: Profile
  onDateClick: (date: Date) => void
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
}

const MONTH_NAMES = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août',
  'Sep', 'Oct', 'Nov', 'Déc',
]

function getPresence(
  profile: Profile,
  dateStr: string,
  entries: CalendarEntry[],
  holidays: TeamHoliday[]
): PresenceType | null {
  const holiday = holidays.find((h) => h.date === dateStr)
  if (holiday) return 'holiday'

  const entry = entries.find((e) => e.profile_id === profile.id && e.date === dateStr)
  if (entry) return entry.presence

  const [yy, mm, dd] = dateStr.split('-').map(Number)
  const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    new Date(yy, mm - 1, dd).getDay()
  ] as string

  const defaults = profile.default_days as Record<string, string> | null
  if (defaults && defaults[dayKey]) return defaults[dayKey] as PresenceType
  return null
}

export function PersonalCalendar({
  currentDate,
  entries,
  holidays,
  profile,
  onDateClick,
  onNavigate,
}: PersonalCalendarProps) {
  const todayStr = formatDateLocal(new Date())

  // ─── 90 days from Monday of current week ───
  const days = useMemo(() => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    d.setDate(d.getDate() + diff)

    const result: Date[] = []
    for (let i = 0; i < 90; i++) {
      result.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i))
    }
    return result
  }, [currentDate])

  // Group into weeks
  const weeks = useMemo(() => {
    const w: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7))
    }
    return w
  }, [days])

  const startDay = days[0]
  const endDay = days[days.length - 1]

  return (
    <div className="space-y-3">
      {/* Header navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onNavigate('prev')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('today')}>
            <CalendarDays size={14} className="mr-1" />
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
            <ChevronRight size={16} />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {startDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {' – '}
          {endDay.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left p-2 font-medium text-muted-foreground w-20 sticky left-0 bg-muted/50 z-10 border-r text-xs">
                  Semaine
                </th>
                {DAY_LABELS.map((label) => (
                  <th key={label} className="p-2 text-center text-xs text-muted-foreground min-w-[44px]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIdx) => {
                const weekStart = week[0]
                const weekStartStr = `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`

                return (
                  <tr key={weekIdx} className="border-b last:border-0">
                    {/* Week label */}
                    <td className="p-2 text-xs text-muted-foreground border-r sticky left-0 bg-background z-10">
                      {weekStartStr}
                    </td>
                    {DAY_LABELS.map((_, dayIdx) => {
                      const date = week[dayIdx]
                      if (!date) {
                        // Semaine incomplète (dernière semaine)
                        return <td key={dayIdx} className="p-1 bg-gray-50/20" />
                      }

                      const dateStr = formatDateLocal(date)
                      const presence = getPresence(profile, dateStr, entries, holidays)
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      const isToday = dateStr === todayStr
                      const isHoliday = presence === 'holiday'

                      if (isWeekend) {
                        return (
                          <td
                            key={dateStr}
                            className={`p-1 text-center ${isToday ? 'bg-primary/5' : 'bg-gray-50/30'}`}
                          >
                            <span className="text-gray-200 text-xs">—</span>
                          </td>
                        )
                      }

                      const colorClasses = presence
                        ? PRESENCE_COLORS[presence]
                        : 'bg-gray-50 text-gray-200 border-gray-100'
                      const bgClass = colorClasses.split(' ')[0]
                      const textClass = colorClasses.split(' ')[1]

                      return (
                        <td
                          key={dateStr}
                          className={`p-1 text-center ${isHoliday ? '' : 'cursor-pointer hover:opacity-80 transition-opacity'} ${
                            isToday ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => !isHoliday && onDateClick(date)}
                          title={presence ? PRESENCE_LABELS[presence] : 'Non défini'}
                        >
                          <div
                            className={`inline-flex items-center justify-center rounded-md w-8 h-8 text-[10px] font-semibold border ${bgClass} ${textClass}`}
                          >
                            {presence
                              ? PRESENCE_LABELS[presence].charAt(0)
                              : '—'}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
