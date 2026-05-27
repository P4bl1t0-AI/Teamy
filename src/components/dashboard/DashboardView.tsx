'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { PersonalCalendar } from './PersonalCalendar'
import { DashboardTaskColumns } from './DashboardTaskColumns'
import { DayEditModal } from '@/components/calendar/DayEditModal'
import type { Task, Profile, CalendarEntry, TeamHoliday } from '@/types'
import { getCalendarEntriesRange, setDayStatus } from '@/app/calendar-actions'
import { getTaskComments } from '@/app/actions'
import { formatDateLocal, getMonday, addDays } from '@/lib/utils'
import { AlertTriangle, Clock, CheckCircle2, LayoutList } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DashboardViewProps {
  initialTasks: Task[]
  myProfile: Profile
  allMembers: Profile[]
  initialEntries: CalendarEntry[]
  initialHolidays: TeamHoliday[]
  commentCounts: Record<string, number>
}

export function DashboardView({
  initialTasks,
  myProfile,
  allMembers,
  initialEntries,
  initialHolidays,
  commentCounts,
}: DashboardViewProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState(initialEntries)
  const [holidays] = useState(initialHolidays)
  const [editDate, setEditDate] = useState<Date | null>(null)

  // ─── Navigation calendrier ───
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    setCurrentDate((prev) => {
      const d = new Date(prev)
      if (direction === 'today') return new Date()
      const days = direction === 'prev' ? -7 : 7
      d.setDate(d.getDate() + days)
      return d
    })
  }, [])

  // ─── Refresh entries when calendar navigation changes ───
  const refreshEntries = useCallback(async () => {
    const monday = getMonday(currentDate)
    const start = formatDateLocal(monday)
    const end = formatDateLocal(addDays(monday, 89))
    try {
      const newEntries = await getCalendarEntriesRange(start, end)
      setEntries(newEntries as CalendarEntry[])
    } catch {
      // silent
    }
  }, [currentDate])

  useEffect(() => {
    refreshEntries()
  }, [refreshEntries])

  // ─── Day edit ───
  const handleDateClick = useCallback((date: Date) => {
    setEditDate(date)
  }, [])

  const handleModalClose = useCallback(() => {
    setEditDate(null)
    // Give server actions time to complete, then refresh
    setTimeout(() => {
      refreshEntries()
      router.refresh()
    }, 300)
  }, [refreshEntries, router])

  // ─── Metrics ───
  const myTasks = useMemo(
    () => initialTasks.filter((t) => t.assigned_to === myProfile.id),
    [initialTasks, myProfile.id]
  )

  const metrics = useMemo(() => {
    const overdue = myTasks.filter((t) => {
      if (t.status === 'done' || t.status === 'cancelled' || !t.due_date) return false
      return new Date(t.due_date + 'T23:59:59') < new Date()
    })

    const deadlineSoon = myTasks.filter((t) => {
      if (t.status === 'done' || t.status === 'cancelled' || !t.due_date) return false
      const due = new Date(t.due_date + 'T23:59:59')
      const now = new Date()
      const diffMs = due.getTime() - now.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      return diffDays >= 0 && diffDays <= 2
    })

    const wip = myTasks.filter((t) => t.status === 'todo' || t.status === 'in_progress').length
    const wipMax = 3

    return { overdue, deadlineSoon, wip, wipMax }
  }, [myTasks])

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Bonjour, {myProfile.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Voici votre aperçu personnel
          </p>
        </div>

        {/* Metrics pills */}
        <div className="flex flex-wrap gap-2">
          {metrics.overdue.length > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 text-xs text-red-700">
              <AlertTriangle size={14} />
              <span className="font-semibold">{metrics.overdue.length}</span> retard
            </div>
          )}
          {metrics.deadlineSoon.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 text-xs text-amber-700">
              <Clock size={14} />
              <span className="font-semibold">{metrics.deadlineSoon.length}</span> échéance proche
            </div>
          )}
          <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border ${
            metrics.wip >= metrics.wipMax
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-muted/40 border-border text-muted-foreground'
          }`}>
            <LayoutList size={14} />
            <span className="font-semibold">{metrics.wip}/{metrics.wipMax}</span> WIP
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 text-xs text-emerald-700">
            <CheckCircle2 size={14} />
            <span className="font-semibold">
              {myTasks.filter((t) => t.status === 'done').length}
            </span>{' '}
            terminées
          </div>
        </div>
      </div>

      {/* ─── Calendar ─── */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Mon calendrier — 90 jours
        </h2>
        <PersonalCalendar
          currentDate={currentDate}
          entries={entries}
          holidays={holidays}
          profile={myProfile}
          onDateClick={handleDateClick}
          onNavigate={handleNavigate}
        />
      </section>

      {/* ─── Tasks ─── */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Mes tâches</h2>
        <DashboardTaskColumns
          tasks={initialTasks}
          myProfile={myProfile}
          members={allMembers}
          commentCounts={commentCounts}
        />
      </section>

      {/* ─── Day Edit Modal ─── */}
      {editDate && (
        <DayEditModal
          date={editDate}
          profiles={[myProfile]}
          entries={entries}
          holidays={holidays}
          onClose={handleModalClose}
        />
      )}
    </div>
  )
}
