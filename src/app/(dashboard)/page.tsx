import { createClient } from "@/lib/supabase/server"
import { DashboardView } from "@/components/dashboard/DashboardView"
import { redirect } from "next/navigation"
import { getTaskComments } from "@/app/actions"
import type { Profile, Task, CalendarEntry, TeamHoliday } from "@/types"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // ─── Profile courant ───
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!myProfile) {
    redirect("/login")
  }

  // ─── Toutes les tâches ───
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  // ─── Tous les membres ───
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })

  // ─── Entries calendrier 90 jours ───
  const now = new Date()
  const day = now.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff)
  const startDate = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
  const endDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 89)
  const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`

  const { data: entries } = await supabase
    .from("calendar_entries")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDateStr)
    .order("date", { ascending: true })

  // ─── Jours fériés ───
  const startYear = monday.getFullYear()
  const endYear = endDate.getFullYear()

  const { data: fixedHolidays } = await supabase
    .from("team_holidays")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDateStr)
    .eq("is_recurring", false)
    .order("date", { ascending: true })

  const { data: recurringHolidays } = await supabase
    .from("team_holidays")
    .select("*")
    .eq("is_recurring", true)
    .order("date", { ascending: true })

  const mappedRecurring: TeamHoliday[] = []
  for (const h of (recurringHolidays ?? [])) {
    const [, month, day] = h.date.split("-")
    for (let year = startYear; year <= endYear; year++) {
      const mappedDate = `${year}-${month}-${day}`
      if (mappedDate >= startDate && mappedDate <= endDateStr) {
        mappedRecurring.push({ ...h, date: mappedDate })
      }
    }
  }

  const holidays = [...(fixedHolidays ?? []), ...mappedRecurring]

  // ─── Comment counts par tâche (pour le dashboard) ───
  const commentCounts: Record<string, number> = {}
  const myTasks = (tasks ?? []).filter((t: Task) => t.assigned_to === myProfile.id)
  for (const task of myTasks) {
    const comments = await getTaskComments(task.id)
    commentCounts[task.id] = comments.length
  }

  return (
    <DashboardView
      initialTasks={tasks ?? []}
      myProfile={myProfile as Profile}
      allMembers={(members ?? []) as Profile[]}
      initialEntries={(entries ?? []) as CalendarEntry[]}
      initialHolidays={holidays as TeamHoliday[]}
      commentCounts={commentCounts}
    />
  )
}
