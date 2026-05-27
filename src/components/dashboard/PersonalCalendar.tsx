'use client'

import { useMemo, useState, useCallback } from 'react'
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
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
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
  const { days, months } = useMemo(() => {
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    d.setDate(d.getDate() + diff)

    const result: Date[] = []
    for (let i = 0; i < 90; i++) {
      result.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i))
    }

    // Group by month for headers
    const monthGroups: { month: number; year: number; startIdx: number; count: number }[] = []
    result.forEach((date, idx) => {
      if (idx === 0 || date.getMonth() !== result[idx - 1].getMonth()) {
        monthGroups.push({
          month: date.getMonth(),
          year: date.getFullYear(),
          startIdx: idx,
          count: 0,
        })
      }
      if (monthGroups.length > 0) {
        monthGroups[monthGroups.length - 1].count++
      }
    })

    return { days: result, months: monthGroups }
  }, [currentDate])

  // Group into weeks
  const weeks = useMemo(() => {
    const w: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7))
    }
    return w
  }, [days])

  return (
    <div className="space-y-3">
      {/* Header : navigation */}
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
          {days[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          {' – '}
          {days[days.length - 1].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              {/* Month headers */}
              <tr className="border-b">
                <th className="p-2 w-10 border-r bg-muted/30" />
                {months.map((m, idx) => (
                  <th
                    key={idx}
                    colSpan={m.count}
                    className="p-1.5 text-center text-xs font-semibold bg-muted/30 border-r last:border-r-0"
                  >
                    {MONTH_NAMES[m.month]} {m.year}
                  </th>
                ))}
              </tr>
              {/* Day headers */}
              <tr className="bg-muted/50 border-b">
                <th className="p-2 w-10 border-r bg-muted/50" />
                {days.map((date) => {
                  const dateStr = formatDateLocal(date)
                  const isToday = dateStr === todayStr
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6
                  const dayLabel = DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]

                  return (
                    <th
                      key={dateStr}
                      className={`p-1.5 text-center min-w-[36px] ${
                        isToday ? 'bg-primary/10' : isWeekend ? 'bg-gray-100/50' : ''
                      }`}
                    >
                      <div className={`text-[9px] ${isWeekend ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        {dayLabel}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-primary font-bold' : isWeekend ? 'text-gray-400' : ''}`}>
                        {date.getDate()}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIdx) => (
                <tr key={weekIdx} className="border-b last:border-0">
                  {/* Week number */}
                  <td className="p-1 text-center border-r bg-muted/20 text-[10px] text-muted-foreground">
                    S{weekIdx + 1}
                  </td>
                  {week.map((date) => {
                    const dateStr = formatDateLocal(date)
                    const presence = getPresence(profile, dateStr, entries, holidays)
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    const isToday = dateStr === todayStr
                    const isHoliday = presence === 'holiday'

                    if (isWeekend) {
                      return (
                        <td
                          key={dateStr}
                          className={`p-1 text-center bg-gray-50/30 ${isToday ? 'bg-primary/5' : ''}`}
                        >
                          <span className="text-gray-200 text-xs">—</span>
                        </td>
                      )
                    }

                    const colorClasses = presence ? PRESENCE_COLORS[presence] : 'bg-gray-50 text-gray-200'
                    const bgClass = presence ? colorClasses.split(' ')[0] : 'bg-gray-50'
                    const textClass = presence ? colorClasses.split(' ')[1] : 'text-gray-200'

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
                          className={`inline-flex items-center justify-center rounded-md w-7 h-7 text-[10px] font-medium ${bgClass} ${textClass} border`}
                        >
                          {presence
                            ? PRESENCE_LABELS[presence].charAt(0)
                            : '—'}
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
