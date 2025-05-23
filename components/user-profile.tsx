"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserProgress } from "@/lib/progress-service"
import Link from "next/link"
import { LogOut, User } from "lucide-react"

export function UserProfile() {
  const { user, signOut, isLoading } = useAuth()
  const [progressStats, setProgressStats] = useState({
    completedTasks: 0,
    totalGuides: 0,
    completedGuides: 0,
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadStats() {
      if (!user) return

      try {
        const progress = await getUserProgress(user.id)

        // Count completed tasks
        const completedTasks = progress.filter((task) => task.completed).length

        // Count unique guides
        const guides = new Set(progress.map((task) => task.guide_id))
        const totalGuides = guides.size

        // Count completed guides (all tasks completed)
        const guideTaskCounts: Record<string, { total: number; completed: number }> = {}

        progress.forEach((task) => {
          if (!guideTaskCounts[task.guide_id]) {
            guideTaskCounts[task.guide_id] = { total: 0, completed: 0 }
          }

          guideTaskCounts[task.guide_id].total++
          if (task.completed) {
            guideTaskCounts[task.guide_id].completed++
          }
        })

        const completedGuides = Object.values(guideTaskCounts).filter(
          (guide) => guide.completed === guide.total && guide.total > 0,
        ).length

        setProgressStats({
          completedTasks,
          totalGuides,
          completedGuides,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    if (!isLoading) {
      loadStats()
    }
  }, [user, isLoading])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-pulse h-20 w-full bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">Sign in to track your progress</h3>
            <div className="flex gap-2 justify-center">
              <Link href="/auth/sign-in">
                <Button variant="secondary">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Your Profile</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <CardDescription>Track your airdrop farming progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-slate-700 p-3 rounded-full">
            <User className="h-6 w-6" />
          </div>
          <div>
            <div className="font-medium">{user.email}</div>
            <div className="text-sm text-slate-400">Member since {new Date(user.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{progressStats.completedTasks}</div>
            <div className="text-sm text-slate-400">Tasks Completed</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{progressStats.totalGuides}</div>
            <div className="text-sm text-slate-400">Guides Started</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{progressStats.completedGuides}</div>
            <div className="text-sm text-slate-400">Guides Completed</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/guides">
              <Button variant="outline" className="w-full">
                Browse Guides
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
