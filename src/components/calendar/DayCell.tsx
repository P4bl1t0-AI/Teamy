'use client'

import { useState } from 'react'
import { EditDayDialog } from './EditDayDialog'
import type { Enums } from '@/types/database'

type PresenceType = Enums['presence_type'] | null

interface DayCellProps {
  profileId: string
  date: string
  presence: PresenceType
  holidayName?: string
  note?: string | null
  onUpdate: () => void
}

export function DayCell({ profileId, date, presence, holidayName, note, onUpdate }: DayCellProps) {
  const [open, setOpen] = useState(false)

  const presenceStyles: Record<string, string> = {
    office: 'bg-blue-100 border-blue-200',
    remote: 'bg-violet-100 border-violet-200',
    leave: 'bg-emerald-100 border-emerald-200',
    holiday: 'bg-red-100 border-red-200',
  }

  return (
    <>
      <td
        className={`text-center border px-0.5 py-1 cursor-pointer transition-colors hover:opacity-80 ${
          presence ? presenceStyles[presence] : 'bg-slate-50 border-slate-200'
        }`}
        onClick={() => setOpen(true)}
        title={holidayName || note || undefined}
      >
        <div className="w-full h-4" />
      </td>
      {open && (
        <EditDayDialog
          open={open}
          onClose={() => setOpen(false)}
          profileId={profileId}
          date={date}
          currentPresence={presence}
          holidayName={holidayName}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
