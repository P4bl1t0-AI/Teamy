'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PRESENCE_OPTIONS, PRESENCE_LABELS } from '@/lib/constants'
import type { Profile, CalendarEntry, PresenceType } from '@/types'
import { setDayStatus, deleteCalendarEntry } from '@/app/calendar-actions'

interface DayEditModalProps {
  date: Date
  profiles: Profile[]
  entries: CalendarEntry[]
  onClose: () => void
}

export function DayEditModal({ date, profiles, entries, onClose }: DayEditModalProps) {
  const dateStr = date.toISOString().split('T')[0]
  const label = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const [loading, setLoading] = useState<string | null>(null)

  const getEntry = (profileId: string) => entries.find((e) => e.profile_id === profileId)

  const handleChange = async (profileId: string, presence: PresenceType, note?: string) => {
    setLoading(profileId)
    try {
      await setDayStatus(profileId, dateStr, presence, note)
      onClose()
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
      onClose()
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
          {profiles.map((profile) => {
            const entry = getEntry(profile.id)
            const currentValue = entry?.presence ?? ''
            return (
              <div key={profile.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold shrink-0">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-sm">{profile.full_name}</div>
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
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
