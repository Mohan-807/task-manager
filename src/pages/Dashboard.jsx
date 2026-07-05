import { useEffect, useState } from 'react'
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
import { dashboardService } from '@/services/dashboardService'

export default function Dashboard() {
  const { user } = useAuth()
  const { projects, loading: projLoading } = useProjects()

  const [stats, setStats] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [dashLoading, setDashLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(true)

  const loading = projLoading || dashLoading

  useEffect(() => {
    Promise.all([
      dashboardService.getStats(),
      dashboardService.getRecentProjects(),
      dashboardService.getRecentTasks(),
      dashboardService.getActivities(),
    ]).then(([statsRes, projectsRes, tasksRes, activitiesRes]) => {
      setStats(statsRes)
      setRecentProjects(projectsRes)
      setRecentTasks(tasksRes)
      setRecentActivities(activitiesRes)
      setDashLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShowSkeleton(false), 300)
      return () => clearTimeout(t)
    }
  }, [loading])

  const STATS = stats ? [
    {
      title:     'Active Projects',
      value:     stats.activeProjects,
      icon:      FolderKanban,
      iconBg:    'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
    {
      title:     'Total Tasks',
      value:     stats.totalTasks,
      icon:      CheckSquare,
      iconBg:    'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title:     'Team Members',
      value:     stats.teamMembers,
      icon:      Users,
      iconBg:    'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      title:     'Completion Rate',
      value:     `${stats.completionRate}%`,
      icon:      TrendingUp,
      iconBg:    'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ] : []

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
              <RecentProjects projects={recentProjects} />
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
              <RecentTasks tasks={recentTasks} />
            </div>
            <div>
              <ActivityTimeline activities={recentActivities} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
