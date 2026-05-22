'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const frenchDays = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
]

type DayType = 'office' | 'remote' | null

export function DefaultDaysForm() {
  const { user } = useAuth()
  const supabase = createClient()
  const [defaults, setDefaults] = useState<Record<string, DayType>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('default_days').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data?.default_days) {
          setDefaults(data.default_days as Record<string, DayType>)
        }
        setLoading(false)
      })
  }, [user, supabase])

  const setDay = (day: string, value: DayType) => {
    setDefaults(prev => ({ ...prev, [day]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ default_days: defaults }).eq('user_id', user.id)
    setSaving(false)
    if (error) {
      toast.error('Erreur lors de la sauvegarde')
    } else {
      toast.success('Paramètres mis à jour')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold">Jours par défaut</h2>
      <p className="text-sm text-muted-foreground">
        Ces valeurs seront utilisées pour pré-remplir votre calendrier. Vous pourrez toujours modifier chaque jour individuellement.
      </p>
      {frenchDays.map(day => (
        <div key={day.key} className="flex items-center justify-between py-2 border-b">
          <Label className="font-medium">{day.label}</Label>
          <div className="flex gap-1">
            <button
              onClick={() => setDay(day.key, 'office')}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                defaults[day.key] === 'office' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              Sur site
            </button>
            <button
              onClick={() => setDay(day.key, 'remote')}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                defaults[day.key] === 'remote' ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              Télétravail
            </button>
            <button
              onClick={() => setDay(day.key, null)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                !defaults[day.key] ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              Non défini
            </button>
          </div>
        </div>
      ))}
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </Button>
    </div>
  )
}
