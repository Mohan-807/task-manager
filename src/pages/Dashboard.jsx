import { useMemo, useEffect, useState } from 'react'
import { FolderKanban, CheckSquare, Users, TrendingUp } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import StatsCard from '@/components/dashboard/StatsCard'
import RecentProjects from '@/components/dashboard/RecentProjects'
import RecentTasks from '@/components/dashboard/RecentTasks'
import TaskStatusOverview from '@/components/dashboard/TaskStatusOverview'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline'
import { SkeletonStatCard, SkeletonDashboardBlock } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useTasks } from '@/contexts/TaskContext'
import { useUsers } from '@/contexts/UserContext'

export default function Dashboard() {
  const { user } = useAuth()
  const { projects, loading: projLoading } = useProjects()
  const { tasks, activities, loading: taskLoading } = useTasks()
  const { users } = useUsers()
  const [showSkeleton, setShowSkeleton] = useState(true)

  const loading = projLoading || taskLoading

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShowSkeleton(false), 300)
      return () => clearTimeout(t)
    }
  }, [loading])

  const stats = useMemo(() => {
    const activeProjects  = projects.filter(p => p.status === 'active')
    const totalTasks      = tasks.length
    const completedTasks  = tasks.filter(t => t.status === 'done').length
    const activeMembers   = users.filter(u => u.status === 'active').length
    const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    return { activeProjects, totalTasks, completedTasks, activeMembers, completionRate }
  }, [projects, tasks, users])

  const recentProjects = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4),
  [projects])

  const recentTasks = useMemo(() =>
    [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 7),
  [tasks])

  const recentActivities = useMemo(() => activities.slice(0, 8), [activities])

  const STATS = useMemo(() => [
    {
      title:      'Active Projects',
      value:      stats.activeProjects.length,
      icon:       FolderKanban,
      iconBg:     'bg-indigo-50',
      iconColor:  'text-indigo-500',
      trend:      20,
      trendLabel: 'vs last month',
    },
    {
      title:      'Total Tasks',
      value:      stats.totalTasks,
      icon:       CheckSquare,
      iconBg:     'bg-blue-50',
      iconColor:  'text-blue-500',
      trend:      12,
      trendLabel: 'vs last month',
    },
    {
      title:      'Team Members',
      value:      stats.activeMembers,
      icon:       Users,
      iconBg:     'bg-emerald-50',
      iconColor:  'text-emerald-500',
      trend:      14,
      trendLabel: 'new this month',
    },
    {
      title:      'Completion Rate',
      value:      `${stats.completionRate}%`,
      icon:       TrendingUp,
      iconBg:     'bg-amber-50',
      iconColor:  'text-amber-500',
      trend:      -3,
      trendLabel: 'vs last month',
    },
  ], [stats])

  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-[1600px] mx-auto">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's what's happening today.`}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {showSkeleton
          ? [0, 1, 2, 3].map(i => <SkeletonStatCard key={i} />)
          : STATS.map((stat, i) => (
              <div
                key={stat.title}
                className="animate-[slideUp_0.3s_ease_both]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <StatsCard {...stat} />
              </div>
            ))
        }
      </div>

      {showSkeleton ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2"><SkeletonDashboardBlock /></div>
            <SkeletonDashboardBlock />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2"><SkeletonDashboardBlock /></div>
            <SkeletonDashboardBlock />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-[slideUp_0.35s_ease_both]">
            <div className="xl:col-span-2">
              <RecentProjects projects={recentProjects} users={users} />
            </div>
            <div>
              <TaskStatusOverview projects={projects} />
            </div>
          </div>

          <div
            className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-[slideUp_0.35s_ease_both]"
            style={{ animationDelay: '80ms' }}
          >
            <div className="xl:col-span-2">
              <RecentTasks tasks={recentTasks} users={users} projects={projects} />
            </div>
            <div>
              <ActivityTimeline activities={recentActivities} users={users} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
