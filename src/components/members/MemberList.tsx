'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { Profile } from '@/types/database'
import { Mail, UserCircle } from 'lucide-react'

export function MemberList({ refreshKey }: { refreshKey: number }) {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
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
      {members.map((m) => (
        <Card key={m.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-medium">
                {m.full_name?.[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{m.full_name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail size={12} />
                <span className="truncate">{m.email}</span>
              </div>
            </div>
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
        </Card>
      ))}
    </div>
  )
}
