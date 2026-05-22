'use client'

import { Building2, Home, Umbrella, CalendarX, Minus } from 'lucide-react'

export function CalendarLegend() {
  const items = [
    { icon: Building2, label: 'Sur site', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    { icon: Home, label: 'Télétravail', className: 'bg-violet-100 text-violet-700 border-violet-200' },
    { icon: Umbrella, label: 'Congés', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { icon: CalendarX, label: 'Férié / Fermeture', className: 'bg-red-100 text-red-700 border-red-200' },
    { icon: Minus, label: 'Non défini', className: 'bg-slate-50 text-slate-400 border-slate-200' },
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(item => (
        <div key={item.label} className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${item.className}`}>
          <item.icon size={12} />
          {item.label}
        </div>
      ))}
    </div>
  )
}
