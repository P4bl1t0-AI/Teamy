'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Filter, LayoutGrid, Table } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { CalendarLegend } from './CalendarLegend'
import { DayCell } from './DayCell'
import { DayEditModal } from './DayEditModal'
import { CompanyHolidayForm } from './CompanyHolidayForm'
import { WeekView } from './WeekView'
import type { Profile, CalendarEntry, TeamHoliday } from '@/types'
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
  const [view, setView] = useState<'month' | 'week'>('month')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(profiles.map((p) => p.id)))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  // ─── Label selon la vue ───
  const headerLabel = useMemo(() => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }
    // Vue semaine
    const d = new Date(currentDate)
    const day = d.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    d.setDate(d.getDate() + diff)
    const start = new Date(d)
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 6)

    const startStr = start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    const endStr = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    return `Semaine du ${startStr} au ${endStr}`
  }, [currentDate, view])

  // ─── Jours du mois (vue mensuelle) ───
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1)
    const lastDayOfMonth = new Date(year, month, 0)
    const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1
    const daysInMonth = lastDayOfMonth.getDate()

    const result: Date[] = []
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      result.push(new Date(year, month - 2, prevMonthLastDay - i))
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(new Date(year, month - 1, i))
    }
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

  const filteredProfiles = useMemo(
    () => profiles.filter((p) => selectedIds.has(p.id)),
    [profiles, selectedIds]
  )

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(profiles.map((p) => p.id)))
  const selectNone = () => setSelectedIds(new Set())

  // ─── Navigation ───
  const goToPrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month - 2, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))
    }
  }
  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month, 1))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))
    }
  }
  const goToToday = () => setCurrentDate(new Date())

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold capitalize min-w-[180px]">{headerLabel}</h2>
          <Button variant="outline" size="icon" onClick={goToPrev}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Aujourd&apos;hui
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Vue */}
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setView('month')}
            >
              <LayoutGrid size={14} className="mr-1" /> Mois
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-none"
              onClick={() => setView('week')}
            >
              <Table size={14} className="mr-1" /> Semaine
            </Button>
          </div>

          <CalendarLegend />
          <Button variant="secondary" size="sm" onClick={() => setShowHolidayForm(true)}>
            <CalendarDays size={14} className="mr-1" /> Jours fériés
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-1 cursor-pointer'
              )}
            >
              <Filter size={14} /> Membres
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {selectedIds.size}/{profiles.length}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-xs font-medium text-muted-foreground">Filtrer par membre</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={selectAll}>
                    Tous
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={selectNone}>
                    Aucun
                  </Button>
                </div>
              </div>
              {profiles.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p.id}
                  checked={selectedIds.has(p.id)}
                  onCheckedChange={() => toggleMember(p.id)}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                      {p.full_name.charAt(0).toUpperCase()}
                    </span>
                    {p.full_name}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ─── Vue Mois ─── */}
      {view === 'month' && (
        <div className="grid grid-cols-7 gap-1">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center text-xs font-medium text-muted-foreground py-1">
              {label}
            </div>
          ))}
          {monthDays.map((date) => {
            const dateStr = date.toISOString().split('T')[0]
            const isCurrentMonth = date.getMonth() === month - 1
            const isToday = dateStr === todayStr
            return (
              <DayCell
                key={dateStr}
                date={date}
                entries={entriesMap.get(dateStr) ?? []}
                profiles={filteredProfiles}
                holiday={holidaysMap.get(dateStr)}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                onClick={() => setSelectedDate(date)}
              />
            )
          })}
        </div>
      )}

      {/* ─── Vue Semaine ─── */}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          entries={initialEntries}
          holidays={initialHolidays}
          profiles={filteredProfiles}
          onDateClick={(date) => setSelectedDate(date)}
        />
      )}

      {selectedDate && (
        <DayEditModal
          date={selectedDate}
          profiles={filteredProfiles}
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
