'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DayCell } from './DayCell'
import type { Profile, CalendarEntry, TeamHoliday } from '@/types/database'

interface CalendarGridProps {
  year: number
  month: number
}

export function CalendarGrid({ year, month }: CalendarGridProps) {
  const supabase = createClient()
  const [members, setMembers] = useState<Profile[]>([])
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [holidays, setHolidays] = useState<TeamHoliday[]>([])
  const [loading, setLoading] = useState(true)

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month])

  const formattedToday = useMemo(() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  }, [])

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [membersRes, entriesRes, holidaysRes] = await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('calendar_entries').select('*').gte('date', startDate).lte('date', endDate),
      supabase.from('team_holidays').select('*'),
    ])
    if (membersRes.data) setMembers(membersRes.data)
    if (entriesRes.data) setEntries(entriesRes.data)
    if (holidaysRes.data) setHolidays(holidaysRes.data)
    setLoading(false)
  }, [supabase, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getEntry = useCallback((profileId: string, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return entries.find(e => e.profile_id === profileId && e.date === dateStr)
  }, [entries, year, month])

  const getHoliday = useCallback((day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return holidays.find(h => {
      if (h.is_recurring) {
        return h.date.slice(5) === dateStr.slice(5)
      }
      return h.date === dateStr
    })
  }, [holidays, year, month])

  const getDefaultPresence = useCallback((profile: Profile, day: number) => {
    const date = new Date(year, month, day)
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const defaults = (profile.default_days as Record<string, string>) || {}
    const val = defaults[weekday]
    if (val === 'office' || val === 'remote') return val
    return null
  }, [year, month])

  if (loading) return <p className="text-muted-foreground">Chargement du calendrier...</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 text-left px-2 py-2 text-sm font-semibold border-b">
              Membre
            </th>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === formattedToday
              const date = new Date(year, month, day)
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              return (
                <th
                  key={day}
                  className={`text-center py-1 text-xs w-8 border-b ${
                    isToday ? 'bg-blue-50 border-blue-300' : isWeekend ? 'bg-slate-50' : ''
                  }`}
                >
                  {day}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id} className="hover:bg-slate-50/50">
              <td className="sticky left-0 bg-white z-10 px-2 py-1 text-sm font-medium border-b whitespace-nowrap">
                {member.full_name}
              </td>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const entry = getEntry(member.id, day)
                const holiday = getHoliday(day)
                const defaultPresence = getDefaultPresence(member, day)
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                return (
                  <DayCell
                    key={day}
                    profileId={member.id}
                    date={dateStr}
                    presence={entry?.presence || (holiday ? 'holiday' : defaultPresence || null)}
                    holidayName={holiday?.name}
                    note={entry?.note}
                    onUpdate={fetchData}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
