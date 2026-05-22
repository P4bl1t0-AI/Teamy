'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Users, ListChecks, CalendarDays, User } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl tracking-tight">
          Teamy
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className={`text-sm font-medium flex items-center gap-1 ${
              pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListChecks size={16} /> Tâches
          </Link>
          <Link
            href="/membres"
            className={`text-sm font-medium flex items-center gap-1 ${
              pathname === '/membres' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={16} /> Membres
          </Link>
          <Link
            href="/calendrier"
            className={`text-sm font-medium flex items-center gap-1 ${
              pathname === '/calendrier' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CalendarDays size={16} /> Calendrier
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user?.email?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">
                  {user?.email?.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2"
                onClick={() => window.location.href = '/profil'}
              >
                <User size={14} /> Profil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-600 cursor-pointer"
              >
                <LogOut size={14} className="mr-2" /> Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
