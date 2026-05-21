"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TaskStatus, TaskPriority } from "@/types/database"

export async function createTask(data: {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  due_date: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Non authentifié")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!profile) throw new Error("Profil non trouvé")

  const { error } = await supabase.from("tasks").insert({
    ...data,
    created_by: profile.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function updateTask(
  id: string,
  data: {
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    assigned_to: string | null
    due_date: string | null
  }
) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").update(data).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/")
}
