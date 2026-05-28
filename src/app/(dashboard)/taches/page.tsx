import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TaskBoard } from "@/components/tasks/TaskBoard"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tâches de l&apos;équipe</h1>
      <TaskBoard
        tasks={tasks || []}
        members={members || []}
        currentProfileId={currentProfile?.id || ""}
      />
    </div>
  )
}
