'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Profile } from '@/types'
import { Mail, UserCircle, Pencil, Check, X } from 'lucide-react'
import { DAY_KEYS, PRESENCE_OPTIONS, PRESENCE_LABELS } from '@/lib/constants'
import { updateProfileDefaults } from '@/app/calendar-actions'
import { toast } from 'sonner'

const DAY_KEY_TO_LABEL: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
}

export function MemberList({ refreshKey }: { refreshKey: number }) {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMembers(data as Profile[])
        setLoading(false)
      })
  }, [refreshKey])

  const handleSave = async (profile: Profile) => {
    setSavingId(profile.id)
    try {
      const form = document.getElementById(`defaults-form-${profile.id}`) as HTMLFormElement
      const formData = new FormData(form)
      const defaults: Record<string, string> = {}
      DAY_KEYS.slice(0, 5).forEach((key) => {
        defaults[key] = (formData.get(key) as string) || 'office'
      })
      await updateProfileDefaults(profile.id, defaults)
      toast.success('Jours par défaut mis à jour')
      setEditingId(null)
      // Refresh
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
      if (data) setMembers(data as Profile[])
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSavingId(null)
    }
  }

  if (loading)
    return <p className="text-muted-foreground">Chargement des membres...</p>

  if (members.length === 0)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun membre pour le moment.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez votre première équipe.
        </p>
      </div>
    )

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => {
        const isEditing = editingId === m.id
        const defaults = (m.default_days as Record<string, string> | null) ?? {}
        return (
          <Card key={m.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="text-sm font-medium">
                  {m.full_name?.[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate">{m.full_name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail size={12} />
                  <span className="truncate">{m.email}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditingId(isEditing ? null : m.id)}
              >
                {isEditing ? <X size={14} /> : <Pencil size={14} />}
              </Button>
            </CardHeader>
            {m.role_label && (
              <>
                <Separator className="mx-4 w-auto" />
                <CardContent className="pt-3">
                  <div className="flex items-center gap-1">
                    <UserCircle size={14} className="text-muted-foreground" />
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {m.role_label}
                    </span>
                  </div>
                </CardContent>
              </>
            )}
            {/* Jours par défaut */}
            <Separator className="mx-4 w-auto" />
            <CardContent className="pt-3">
              {isEditing ? (
                <form id={`defaults-form-${m.id}`} className="space-y-2" onSubmit={(e) => { e.preventDefault(); handleSave(m) }}>
                  {DAY_KEYS.slice(0, 5).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs w-16">{DAY_KEY_TO_LABEL[key]}</span>
                      <Select name={key} defaultValue={defaults[key] || 'office'}>
                        <SelectTrigger className="h-7 text-xs w-full">
                          <SelectValue />
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
                  <Button size="sm" className="w-full mt-2" disabled={savingId === m.id}>
                    <Check size={14} className="mr-1" />
                    {savingId === m.id ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </form>
              ) : (
                <div className="space-y-1">
                  {DAY_KEYS.slice(0, 5).map((key) => {
                    const val = defaults[key]
                    return (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{DAY_KEY_TO_LABEL[key]}</span>
                        <span className={val ? 'font-medium' : 'text-gray-300'}>
                          {val ? PRESENCE_LABELS[val] : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
