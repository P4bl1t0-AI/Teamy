'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import type { TeamHoliday } from '@/types'
import { addTeamHoliday, removeTeamHoliday } from '@/app/calendar-actions'

interface CompanyHolidayFormProps {
  holidays: TeamHoliday[]
  onClose: () => void
}

export function CompanyHolidayForm({ holidays, onClose }: CompanyHolidayFormProps) {
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !name) return
    setLoading(true)
    try {
      await addTeamHoliday(date, name, isRecurring)
      setDate('')
      setName('')
      setIsRecurring(false)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Supprimer ce jour férié ?')) return
    try {
      await removeTeamHoliday(id)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jours fériés & collectifs</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="holiday-date" className="text-xs">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="holiday-name" className="text-xs">Nom</Label>
              <Input
                id="holiday-name"
                placeholder="Ex: Pont de l'Ascension"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={(v) => setIsRecurring(v === true)}
            />
            <Label htmlFor="recurring" className="text-xs cursor-pointer">Récurrent chaque année</Label>
          </div>
          <Button type="submit" size="sm" disabled={loading} className="w-full">
            Ajouter
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Liste actuelle</h4>
          {holidays.length === 0 && (
            <p className="text-xs text-muted-foreground">Aucun jour férié défini.</p>
          )}
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-2 rounded border bg-card text-sm">
              <div>
                <div className="font-medium">{h.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(h.date).toLocaleDateString('fr-FR')}
                  {h.is_recurring && ' · Récurrent'}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-red-600 h-8 w-8" onClick={() => handleRemove(h.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
