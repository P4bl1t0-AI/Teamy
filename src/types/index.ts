import type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes } from "./database"

export type { Database, Json, Tables, TablesInsert, TablesUpdate, Enums, CompositeTypes }

export type Profile = Tables<"profiles">
export type Task = Tables<"tasks">
export type CalendarEntry = Tables<"calendar_entries">
export type TeamHoliday = Tables<"team_holidays">

export type TaskStatus = Enums<"task_status">
export type TaskPriority = Enums<"task_priority">
export type PresenceType = Enums<"presence_type">
