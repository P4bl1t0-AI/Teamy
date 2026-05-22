'use client'

import { PRESENCE_COLORS } from '@/lib/constants'
import type { PresenceType, Profile, CalendarEntry, TeamHoliday } from '@/types'

interface DayCellProps {
  date: Date
  entries: CalendarEntry[]
  profiles: Profile[]
  holiday?: TeamHoliday
  isCurrentMonth: boolean
  isToday: boolean
  onClick: () => void
}

function getPresenceForProfile(
  profile: Profile,
  dateStr: string,
  entries: CalendarEntry[]
): PresenceType | null {
  const entry = entries.find((e) => e.profile_id === profile.id && e.date === dateStr)
  if (entry) return entry.presence

  // Fallback sur default_days
  const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    new Date(dateStr).getDay()
  ] as string

  const defaults = profile.default_days as Record<string, string> | null
  if (defaults && defaults[dayKey]) {
    return defaults[dayKey] as PresenceType
  }
  return null
}

export function DayCell({ date, entries, profiles, holiday, isCurrentMonth, isToday, onClick }: DayCellProps) {
  const dateStr = date.toISOString().split('T')[0]

  return (
    <div
      onClick={onClick}
      className={`
        relative border rounded-lg p-2 min-h-[120px] cursor-pointer transition-colors hover:bg-accent/50
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
        ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
      `}
    >
      {holiday && (
        <div className="absolute top-0 left-0 right-0 bg-rose-100 text-rose-800 text-[10px] font-medium px-2 py-0.5 rounded-t-lg truncate">
          {holiday.name}
        </div>
      )}
      <div className={`text-sm font-semibold mb-1 ${!isCurrentMonth ? 'text-gray-300' : 'text-foreground'}`}>
        {date.getDate()}
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {profiles.map((profile) => {
          const presence = getPresenceForProfile(profile, dateStr, entries)
          if (!presence) return null
          const colorClass = PRESENCE_COLORS[presence] ?? 'bg-gray-100 text-gray-600'
          const bgClass = colorClass.split(' ')[0]
          return (
            <div
              key={profile.id}
              title={`${profile.full_name} — ${presence}`}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${bgClass.replace('bg-', 'bg-').replace('100', '500')}`}
            >
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
