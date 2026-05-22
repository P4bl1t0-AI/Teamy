"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { PresenceType } from "@/types"

// ─── Calendar Entries ───

export async function getCalendarEntries(year: number, month: number) {
  const supabase = await createClient()
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`

  const { data, error } = await supabase
    .from("calendar_entries")
    .select("*, profiles(id, full_name)")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function setDayStatus(
  profileId: string,
  date: string,
  presence: PresenceType,
  note?: string | null
) {
  const supabase = await createClient()

  // Upsert : si une entrée existe déjà pour ce profil+date, on update
  const { data: existing } = await supabase
    .from("calendar_entries")
    .select("id")
    .eq("profile_id", profileId)
    .eq("date", date)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("calendar_entries")
      .update({ presence, note: note ?? null, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from("calendar_entries").insert({
      profile_id: profileId,
      date,
      presence,
      note: note ?? null,
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath("/calendrier")
}

export async function deleteCalendarEntry(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("calendar_entries").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/calendrier")
}

// ─── Team Holidays ───

export async function getTeamHolidays(year: number) {
  const supabase = await createClient()
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data, error } = await supabase
    .from("team_holidays")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addTeamHoliday(date: string, name: string, isRecurring = false) {
  const supabase = await createClient()
  const { error } = await supabase.from("team_holidays").insert({
    date,
    name,
    is_recurring: isRecurring,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/calendrier")
}

export async function removeTeamHoliday(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("team_holidays").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/calendrier")
}

// ─── Profiles (default days) ───

export type DefaultDays = {
  monday?: PresenceType | null
  tuesday?: PresenceType | null
  wednesday?: PresenceType | null
  thursday?: PresenceType | null
  friday?: PresenceType | null
  saturday?: PresenceType | null
  sunday?: PresenceType | null
}

export async function getProfiles() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateProfileDefaults(profileId: string, defaults: DefaultDays) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ default_days: defaults })
    .eq("id", profileId)

  if (error) throw new Error(error.message)
  revalidatePath("/calendrier")
  revalidatePath("/membres")
}
