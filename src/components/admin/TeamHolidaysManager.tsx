'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

interface Holiday {
  id: string
  name: string
  date: string
  is_recurring: boolean
}

export function TeamHolidaysManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [newName, setNewName] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newRecurring, setNewRecurring] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchHolidays = async () => {
    const res = await fetch('/api/holidays')
    const data = await res.json()
    setHolidays(data)
    setLoading(false)
  }

  useEffect(() => { fetchHolidays() }, [])

  const handleAdd = async () => {
    if (!newName || !newDate) return
    const res = await fetch('/api/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, date: newDate, is_recurring: newRecurring }),
    })
    if (res.ok) {
      toast.success('Jour férié ajouté')
      setNewName('')
      setNewDate('')
      setNewRecurring(false)
      fetchHolidays()
    } else {
      toast.error('Erreur')
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/holidays?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Supprimé')
      fetchHolidays()
    } else {
      toast.error('Erreur')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-lg font-semibold">Jours fériés et fermetures</h2>
      <Card>
        <CardHeader className="pb-3"><h3 className="text-sm font-medium">Ajouter un jour</h3></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nom</Label>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Fermeture annuelle" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={newRecurring} onCheckedChange={setNewRecurring} id="recurring" />
            <Label htmlFor="recurring">Récurrent chaque année</Label>
          </div>
          <Button onClick={handleAdd} disabled={!newName || !newDate}>
            <Plus size={14} className="mr-1" /> Ajouter
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {holidays.map(h => (
          <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
            <div>
              <p className="font-medium">{h.name}</p>
              <p className="text-xs text-muted-foreground">{h.date} {h.is_recurring ? '(récurrent)' : ''}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)} className="text-red-600">
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
        {holidays.length === 0 && <p className="text-sm text-muted-foreground">Aucun jour férié défini.</p>}
      </div>
    </div>
  )
}
