'use client'

import { useMemo } from 'react'
import type { Profile, CalendarEntry, TeamHoliday, PresenceType } from '@/types'
import { PRESENCE_COLORS, PRESENCE_LABELS, DAY_LABELS } from '@/lib/constants'

interface PlanningViewProps {
  currentDate: Date
  entries: CalendarEntry[]
  holidays: TeamHoliday[]
  profiles: Profile[]
  onDateClick: (date: Date) => void
}

function getPresence(
  profile: Profile,
  dateStr: string,
  allEntries: CalendarEntry[]
): PresenceType | null {
  const entry = allEntries.find((e) => e.profile_id === profile.id && e.date === dateStr)
  if (entry) return entry.presence

  const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    new Date(dateStr).getDay()
  ] as string

  const defaults = profile.default_days as Record<string, string> | null
  if (defaults && defaults[dayKey]) return defaults[dayKey] as PresenceType
  return null
}

function getHoliday(dateStr: string, holidays: TeamHoliday[]) {
  return holidays.find((h) => h.date === dateStr)
}

function formatPeriod(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth()
  const sameYear = start.getFullYear() === end.getFullYear()

  const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: sameMonth ? undefined : 'long' })
  const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (sameMonth && sameYear) {
    return `${start.getDate()}–${endStr}`
  }
  return `${startStr} – ${endStr}`
}

export function PlanningView({ currentDate, entries, holidays, profiles, onDateClick }: PlanningViewProps) {
  // ─── 4 semaines à partir du lundi de la semaine courante ───
  const days = useMemo(() => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    d.setDate(d.getDate() + diff)

    const result: Date[] = []
    for (let i = 0; i < 28; i++) {
      result.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i))
    }
    return result
  }, [currentDate])

  const todayStr = new Date().toISOString().split('T')[0]

  // ─── Regroupement par semaine pour les séparateurs ───
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
      {/* Période affichée */}
      <div className="text-sm text-muted-foreground">
        {formatPeriod(startDay, endDay)}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-muted/50 border-b">
                {/* Colonne fixe : Membre */}
                <th className="text-left p-3 font-medium text-muted-foreground w-44 sticky left-0 bg-muted/50 z-10 border-r">
                  Membre
                </th>
                {days.map((date, idx) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const holiday = getHoliday(dateStr, holidays)
                  const isToday = dateStr === todayStr
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6
                  const isWeekStart = idx % 7 === 0 && idx > 0

                  return (
                    <th
                      key={dateStr}
                      className={`p-2 text-center font-medium min-w-[52px] ${
                        isToday ? 'bg-primary/10' : isWeekend ? 'bg-gray-100/50' : ''
                      } ${isWeekStart ? 'border-l-2 border-l-border' : ''}`}
                    >
                      <div className={`text-[10px] ${isWeekend ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}
                      </div>
                      <div className={`text-sm ${isToday ? 'text-primary font-bold' : isWeekend ? 'text-gray-400' : ''}`}>
                        {date.getDate()}
                      </div>
                      {holiday && (
                        <div className="text-[9px] text-rose-600 truncate max-w-[50px] mx-auto leading-tight">
                          {holiday.name}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/20">
                  {/* Colonne fixe : nom membre */}
                  <td className="p-3 sticky left-0 bg-background z-10 border-r">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium truncate">{profile.full_name}</span>
                    </div>
                  </td>
                  {days.map((date, idx) => {
                    const dateStr = date.toISOString().split('T')[0]
                    const presence = getPresence(profile, dateStr, entries)
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    const isToday = dateStr === todayStr
                    const isWeekStart = idx % 7 === 0 && idx > 0

                    if (isWeekend) {
                      return (
                        <td
                          key={dateStr}
                          className={`p-1 text-center bg-gray-50/50 ${isWeekStart ? 'border-l-2 border-l-border' : ''}`}
                        >
                          <span className="text-gray-200 text-xs">—</span>
                        </td>
                      )
                    }

                    const colorClasses = presence ? PRESENCE_COLORS[presence] : 'bg-gray-50 text-gray-300'
                    const bgClass = presence ? colorClasses.split(' ')[0] : 'bg-gray-50'
                    const textClass = presence ? colorClasses.split(' ')[1] : 'text-gray-300'

                    return (
                      <td
                        key={dateStr}
                        className={`p-1 text-center cursor-pointer hover:opacity-80 transition-opacity ${
                          isToday ? 'bg-primary/5' : ''
                        } ${isWeekStart ? 'border-l-2 border-l-border' : ''}`}
                        onClick={() => onDateClick(date)}
                      >
                        <div
                          className={`inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${bgClass} ${textClass} border`}
                        >
                          {presence ? PRESENCE_LABELS[presence] : '—'}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
