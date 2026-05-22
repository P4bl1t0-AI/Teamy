'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CalendarLegend } from './CalendarLegend'
import { DayCell } from './DayCell'
import { DayEditModal } from './DayEditModal'
import { CompanyHolidayForm } from './CompanyHolidayForm'
import type { Profile, CalendarEntry, TeamHoliday, PresenceType } from '@/types'
import { DAY_LABELS } from '@/lib/constants'

interface CalendarGridProps {
  initialEntries: CalendarEntry[]
  initialHolidays: TeamHoliday[]
  profiles: Profile[]
}

export function CalendarGrid({ initialEntries, initialHolidays, profiles }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showHolidayForm, setShowHolidayForm] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const monthLabel = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1)
    const lastDayOfMonth = new Date(year, month, 0)
    const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1 // Lundi = 0
    const daysInMonth = lastDayOfMonth.getDate()

    const result: Date[] = []

    // Jours du mois précédent pour compléter la première semaine
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      result.push(new Date(year, month - 2, prevMonthLastDay - i))
    }

    // Jours du mois courant
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(new Date(year, month - 1, i))
    }

    // Jours du mois suivant pour compléter la dernière semaine
    const remaining = (7 - (result.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      result.push(new Date(year, month, i))
    }

    return result
  }, [year, month])

  const todayStr = new Date().toISOString().split('T')[0]

  const holidaysMap = useMemo(() => {
    const map = new Map<string, TeamHoliday>()
    initialHolidays.forEach((h) => {
      map.set(h.date, h)
    })
    return map
  }, [initialHolidays])

  const entriesMap = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    initialEntries.forEach((e) => {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    })
    return map
  }, [initialEntries])

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 2, 1))
  const goToNextMonth = () => setCurrentDate(new Date(year, month, 1))
  const goToToday = () => setCurrentDate(new Date())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold capitalize min-w-[180px]">{monthLabel}</h2>
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <CalendarLegend />
          <Button variant="secondary" size="sm" onClick={() => setShowHolidayForm(true)}>
            <CalendarDays size={14} className="mr-1" /> Jours fériés
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
            {label}
          </div>
        ))}
        {days.map((date) => {
          const dateStr = date.toISOString().split('T')[0]
          const isCurrentMonth = date.getMonth() === month - 1
          const isToday = dateStr === todayStr
          return (
            <DayCell
              key={dateStr}
              date={date}
              entries={entriesMap.get(dateStr) ?? []}
              profiles={profiles}
              holiday={holidaysMap.get(dateStr)}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              onClick={() => setSelectedDate(date)}
            />
          )
        })}
      </div>

      {selectedDate && (
        <DayEditModal
          date={selectedDate}
          profiles={profiles}
          entries={entriesMap.get(selectedDate.toISOString().split('T')[0]) ?? []}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {showHolidayForm && (
        <CompanyHolidayForm
          holidays={initialHolidays}
          onClose={() => setShowHolidayForm(false)}
        />
      )}
    </div>
  )
}
