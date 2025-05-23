"use client"

import { useAuth } from "@/contexts/auth-context"

export interface TaskProgress {
  guideId: string
  taskId: string
  completed: boolean
}

export async function getUserProgress(supabase: any, userId: string) {
  const { data, error } = await supabase.from("task_progress").select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching user progress:", error)
    return []
  }

  return data
}

export async function getGuideProgress(supabase: any, userId: string, guideId: string) {
  const { data, error } = await supabase.from("task_progress").select("*").eq("user_id", userId).eq("guide_id", guideId)

  if (error) {
    console.error("Error fetching guide progress:", error)
    return []
  }

  return data
}

// export async function updateTaskProgress(
//   supabase: any,
//   userId: string,
//   guideId: string,
//   taskId: string,
//   completed: boolean,
// ) {
//   const { data, error } = await supabase
//     .from("task_progress")
//     .upsert(
//       {
//         user_id: userId,
//         guide_id: guideId,
//         task_id: taskId,
//         completed,
//         updated_at: new Date().toISOString(),
//       },
//       { onConflict: "user_id,guide_id,task_id" },
//     )
//     .select()

//   if (error) {
//     console.error("Error updating task progress:", error)
//     return null
//   }

//   return data[0]
// }

export function useProgressService() {
  const { user, supabase } = useAuth()

  const getUserProgressData = async () => {
    if (!user) return []
    return getUserProgress(supabase, user.id)
  }

  const getGuideProgressData = async (guideId: string) => {
    if (!user) return []
    return getGuideProgress(supabase, user.id, guideId)
  }

  // const updateTaskProgressData = async (guideId: string, taskId: string, completed: boolean) => {
  //   if (!user) return null
  //   return updateTaskProgress(supabase, user.id, guideId, taskId, completed)
  // }

  return {
    getUserProgress: getUserProgressData,
    getGuideProgress: getGuideProgressData,
    // updateTaskProgress: updateTaskProgressData,
  }
}

//New Functions
// export async function updateTaskProgress(guideId: string, completedTasks: number[]) {
//   try {
//     const supabase = createClient()

//     // Get the user ID from the session
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()
//     const userId = session?.user?.id

//     if (!userId) {
//       // If not logged in, store in localStorage (handled client-side)
//       return { success: false, message: "User not authenticated" }
//     }

//     // Check if a record already exists
//     const { data: existingProgress } = await supabase
//       .from("task_progress")
//       .select()
//       .eq("user_id", userId)
//       .eq("guide_id", guideId)
//       .single()

//     if (existingProgress) {
//       // Update existing record
//       const { error } = await supabase
//         .from("task_progress")
//         .update({
//           completed_tasks: completedTasks,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("id", existingProgress.id)

//       if (error) throw error
//     } else {
//       // Insert new record
//       const { error } = await supabase.from("task_progress").insert({
//         user_id: userId,
//         guide_id: guideId,
//         completed_tasks: completedTasks,
//       })

//       if (error) throw error
//     }

//     return { success: true }
//   } catch (error) {
//     console.error("Error updating task progress:", error)
//     return { success: false, message: "Failed to update progress" }
//   }
// }

// export async function getTaskProgress(guideId: string) {
//   try {
//     const supabase = createClient()

//     // Get the user ID from the session
//     const {
//       data: { session },
//     } = await supabase.auth.getSession()
//     const userId = session?.user?.id

//     if (!userId) {
//       // If not logged in, return empty progress (localStorage handling is done client-side)
//       return null
//     }

//     // Get the progress for this guide
//     const { data } = await supabase
//       .from("task_progress")
//       .select("completed_tasks")
//       .eq("user_id", userId)
//       .eq("guide_id", guideId)
//       .single()

//     return data
//   } catch (error) {
//     console.error("Error getting task progress:", error)
//     return null
//   }
// }

// Simple client-side progress service that uses localStorage
// In a real app, this would connect to a database

export async function getTaskProgress(guideId: string) {
  try {
    // In a real app, this would fetch from a database
    // For now, we'll use localStorage
    if (typeof window !== "undefined") {
      const savedProgress = localStorage.getItem(`${guideId}-progress`)
      if (savedProgress) {
        return { completedTasks: JSON.parse(savedProgress) }
      }
    }
    return { completedTasks: [] }
  } catch (error) {
    console.error("Error getting task progress:", error)
    return { completedTasks: [] }
  }
}

export async function updateTaskProgress(guideId: string, completedTasks: number[]) {
  try {
    // In a real app, this would save to a database
    // For now, we'll use localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(`${guideId}-progress`, JSON.stringify(completedTasks))
    }
    return { success: true }
  } catch (error) {
    console.error("Error updating task progress:", error)
    return { success: false, message: "Failed to update progress" }
  }
}
