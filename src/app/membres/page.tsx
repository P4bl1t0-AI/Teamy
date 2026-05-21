'use client'

import { useState, useCallback } from 'react'
import { MemberList } from '@/components/members/MemberList'
import { MemberForm } from '@/components/members/MemberForm'

export default function MembersPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Membres de l&apos;équipe</h1>
        <MemberForm onCreated={refresh} />
      </div>
      <MemberList refreshKey={refreshKey} />
    </div>
  )
}
