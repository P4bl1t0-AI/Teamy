'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Building2, Home, Umbrella, RotateCcw } from 'lucide-react'
import type { Enums } from '@/types/database'

type PresenceType = Enums['presence_type'] | null

interface EditDayDialogProps {
  open: boolean
  onClose: () => void
  profileId: string
  date: string
  currentPresence: PresenceType
  holidayName?: string
  onUpdate: () => void
}

export function EditDayDialog({ open, onClose, profileId, date, currentPresence, holidayName, onUpdate }: EditDayDialogProps) {
  const supabase = createClient()
  const [presence, setPresence] = useState<PresenceType>(currentPresence)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setPresence(currentPresence)
      setNote('')
    }
  }, [open, currentPresence])

  const handleSave = async () => {
    if (!presence) return
    setLoading(true)
    const { error } = await supabase
      .from('calendar_entries')
      .upsert({
        profile_id: profileId,
        date,
        presence,
        note: note || null,
      }, { onConflict: 'profile_id,date' })
    setLoading(false)
    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      toast.success('Jour mis à jour')
      onUpdate()
      onClose()
    }
  }

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.from('calendar_entries').delete().eq('profile_id', profileId).eq('date', date)
    setLoading(false)
    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Réinitialisé au défaut')
      onUpdate()
      onClose()
    }
  }

  const options: { value: NonNullable<PresenceType>; label: string; icon: typeof Home }[] = [
    { value: 'office', label: 'Sur site', icon: Building2 },
    { value: 'remote', label: 'Télétravail', icon: Home },
    { value: 'leave', label: 'Congés', icon: Umbrella },
  ]

  if (holidayName) {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{holidayName}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Ce jour est férié ou de fermeture. Les équipes ne travaillent pas.</p>
          <Button onClick={onClose}>Fermer</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Modifier le {date}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-2">
            {options.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPresence(opt.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                  presence === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <opt.icon size={20} />
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          <div>
            <Label htmlFor="note">Note (optionnel)</Label>
            <Input id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Ex: Réunion à 14h" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !presence} className="flex-1">
              {loading ? '...' : 'Enregistrer'}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              <RotateCcw size={14} className="mr-1" /> Défaut
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
