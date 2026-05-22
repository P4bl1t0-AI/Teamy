'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { DAY_KEYS, PRESENCE_OPTIONS, DAY_LABELS } from '@/lib/constants'
import type { DefaultDays } from '@/app/calendar-actions'

const DAY_KEY_TO_LABEL: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche',
}

export function MemberForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [roleLabel, setRoleLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdPassword, setCreatedPassword] = useState<string | null>(null)
  const [defaultDays, setDefaultDays] = useState<DefaultDays>({
    monday: 'office',
    tuesday: 'office',
    wednesday: 'office',
    thursday: 'office',
    friday: 'office',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const password = Math.random().toString(36).slice(-10) + 'A1!'
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        role_label: roleLabel || undefined,
        password,
        default_days: defaultDays,
      }),
    })
    setLoading(false)
    if (res.ok) {
      setCreatedPassword(password)
      toast.success('Membre ajouté avec succès')
      onCreated()
    } else {
      const { error } = await res.json()
      toast.error(error || "Impossible d'ajouter le membre")
    }
  }

  const handleClose = () => {
    setOpen(false)
    setCreatedPassword(null)
    setFullName('')
    setEmail('')
    setRoleLabel('')
    setDefaultDays({
      monday: 'office',
      tuesday: 'office',
      wednesday: 'office',
      thursday: 'office',
      friday: 'office',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Plus size={16} className="mr-1" /> Ajouter un membre
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {createdPassword ? 'Membre créé !' : 'Ajouter un membre'}
          </DialogTitle>
        </DialogHeader>
        {createdPassword ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Le compte a été créé. Voici le mot de passe temporaire à transmettre :
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={createdPassword}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(createdPassword)
                  toast.success('Mot de passe copié')
                }}
              >
                Copier
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le nouveau membre pourra se connecter avec son email et ce mot de passe, puis le modifier dans ses paramètres.
            </p>
            <Button className="w-full" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="roleLabel">Rôle / Fonction</Label>
              <Input
                id="roleLabel"
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                placeholder="Ex: Développeur, Chef de projet..."
              />
            </div>

            <div className="space-y-2">
              <Label>Jours par défaut (Lundi–Vendredi)</Label>
              <div className="grid grid-cols-1 gap-2">
                {DAY_KEYS.slice(0, 5).map((key) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm w-24 shrink-0">{DAY_KEY_TO_LABEL[key]}</span>
                    <Select
                      value={defaultDays[key] ?? ''}
                      onValueChange={(val) =>
                        setDefaultDays((prev) => ({ ...prev, [key]: val as DefaultDays[keyof DefaultDays] }))
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
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
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Un mot de passe temporaire sera généré. Le membre pourra le
              réinitialiser.
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
