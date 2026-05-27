'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PRESENCE_OPTIONS } from '@/lib/constants'
import { Check, CalendarX2 } from 'lucide-react'
import type { Profile, CalendarEntry, PresenceType, TeamHoliday } from '@/types'
import { setDayStatus, deleteCalendarEntry } from '@/app/calendar-actions'
import { formatDateLocal } from '@/lib/utils'

interface DayEditModalProps {
  date: Date
  profiles: Profile[]
  entries: CalendarEntry[]
  holidays: TeamHoliday[]
  onClose: () => void
}

export function DayEditModal({ date, profiles, entries, holidays, onClose }: DayEditModalProps) {
  const dateStr = formatDateLocal(date)
  const label = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const holiday = holidays.find((h) => h.date === dateStr)
  const isHoliday = !!holiday

  const [loading, setLoading] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const getEntry = (profileId: string) => entries.find((e) => e.profile_id === profileId)

  const handleChange = async (profileId: string, presence: PresenceType, note?: string) => {
    setLoading(profileId)
    try {
      await setDayStatus(profileId, dateStr, presence, note)
      setSavedIds((prev) => new Set(prev).add(profileId))
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  const handleClear = async (profileId: string, entryId?: string) => {
    if (!entryId) return
    setLoading(profileId)
    try {
      await deleteCalendarEntry(entryId)
      setSavedIds((prev) => new Set(prev).add(profileId))
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{label}</DialogTitle>
        </DialogHeader>
      <div className="space-y-4 mt-2">
        {isHoliday ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <CalendarX2 size={40} className="text-rose-400" />
            <div>
              <p className="font-medium text-rose-700 text-lg">Jour férié</p>
              <p className="text-sm text-muted-foreground mt-1">{holiday.name}</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              Les jours fériés s&apos;appliquent automatiquement à tous les membres de l&apos;équipe.
            </p>
          </div>
        ) : (
          profiles.map((profile) => {
            const entry = getEntry(profile.id)
            const currentValue = entry?.presence ?? ''
            const isSaved = savedIds.has(profile.id)
            return (
              <div key={profile.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-sm flex items-center gap-2">
                    {profile.full_name}
                    {isSaved && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                        <Check size={12} /> Sauvegardé
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentValue}
                      onValueChange={(val) => handleChange(profile.id, val as PresenceType, entry?.note ?? undefined)}
                      disabled={loading === profile.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Non défini" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESENCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {entry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleClear(profile.id, entry.id)}
                        disabled={loading === profile.id}
                      >
                        Réinitialiser
                      </Button>
                    )}
                  </div>
                  {entry && (
                    <Textarea
                      placeholder="Note optionnelle..."
                      defaultValue={entry.note ?? ''}
                      className="text-xs min-h-[60px]"
                      onBlur={(e) => {
                        if (e.target.value !== (entry.note ?? '')) {
                          handleChange(profile.id, entry.presence, e.target.value)
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
