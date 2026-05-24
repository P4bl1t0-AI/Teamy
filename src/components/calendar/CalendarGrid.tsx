'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Filter } from 'lucide-react'
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
import { DayEditModal } from './DayEditModal'
import { CompanyHolidayForm } from './CompanyHolidayForm'
import { PlanningView } from './PlanningView'
import type { Profile, CalendarEntry, TeamHoliday } from '@/types'

interface CalendarGridProps {
  initialEntries: CalendarEntry[]
  initialHolidays: TeamHoliday[]
  profiles: Profile[]
}

export function CalendarGrid({ initialEntries, initialHolidays, profiles }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(profiles.map((p) => p.id)))

  // ─── Navigation par semaine ───
  const goToPrev = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))
  }
  const goToNext = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))
  }
  const goToToday = () => setCurrentDate(new Date())

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

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold min-w-[120px]">Planning</h2>
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

      {/* ─── Planning View ─── */}
      <PlanningView
        currentDate={currentDate}
        entries={initialEntries}
        holidays={initialHolidays}
        profiles={filteredProfiles}
        onDateClick={(date) => setSelectedDate(date)}
      />

      {selectedDate && (
        <DayEditModal
          date={selectedDate}
          profiles={filteredProfiles}
          entries={initialEntries.filter(
            (e) => e.date === selectedDate.toISOString().split('T')[0]
          )}
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
