'use client'

import { useMemo } from 'react'
import type { Profile, CalendarEntry, TeamHoliday, PresenceType } from '@/types'
import { PRESENCE_COLORS, PRESENCE_LABELS, DAY_LABELS } from '@/lib/constants'

interface WeekViewProps {
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

export function WeekView({ currentDate, entries, holidays, profiles, onDateClick }: WeekViewProps) {
  // Calcul du lundi de la semaine courante
  const weekDays = useMemo(() => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    d.setDate(d.getDate() + diff)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i))
    }
    return days
  }, [currentDate])

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left p-3 font-medium text-muted-foreground w-40">Membre</th>
              {weekDays.map((date) => {
                const dateStr = date.toISOString().split('T')[0]
                const holiday = getHoliday(dateStr, holidays)
                const isToday = dateStr === todayStr
                return (
                  <th
                    key={dateStr}
                    className={`p-3 text-center font-medium min-w-[80px] ${isToday ? 'bg-primary/5' : ''}`}
                  >
                    <div className="text-xs text-muted-foreground">{DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                    <div className={`text-base ${isToday ? 'text-primary font-bold' : ''}`}>{date.getDate()}</div>
                    {holiday && (
                      <div className="text-[10px] text-rose-600 truncate max-w-[80px] mx-auto">{holiday.name}</div>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium truncate">{profile.full_name}</span>
                  </div>
                </td>
                {weekDays.map((date) => {
                  const dateStr = date.toISOString().split('T')[0]
                  const presence = getPresence(profile, dateStr, entries)
                  const colorClasses = presence ? PRESENCE_COLORS[presence] : 'bg-gray-50 text-gray-300'
                  const bgClass = presence ? colorClasses.split(' ')[0] : 'bg-gray-50'
                  const textClass = presence ? colorClasses.split(' ')[1] : 'text-gray-300'
                  return (
                    <td
                      key={dateStr}
                      className="p-2 text-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onDateClick(date)}
                    >
                      <div className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium ${bgClass} ${textClass} border`}>
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
  )
}
