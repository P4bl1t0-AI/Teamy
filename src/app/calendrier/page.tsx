'use client'

import { useState, useCallback } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarLegend } from '@/components/calendar/CalendarLegend'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function CalendrierPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const goToPrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  const monthNames = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon size={24} /> Calendrier équipe
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevMonth}>
            <ChevronLeft size={16} />
          </Button>
          <span className="text-lg font-semibold min-w-[160px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
      <CalendarLegend />
      <CalendarGrid year={currentYear} month={currentMonth} />
    </div>
  )
}
