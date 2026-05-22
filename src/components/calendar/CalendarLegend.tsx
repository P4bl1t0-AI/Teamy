'use client'

import { PRESENCE_LABELS, PRESENCE_COLORS } from '@/lib/constants'

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {Object.entries(PRESENCE_LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={`inline-block w-3 h-3 rounded-full border ${PRESENCE_COLORS[key].split(' ')[0]}`} />
          <span className="text-muted-foreground">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-full bg-gray-50 border border-gray-200" />
        <span className="text-muted-foreground">Non défini</span>
      </div>
    </div>
  )
}
