import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, LayoutDashboard,
  KanbanSquare, Users, Settings2, CalendarDays
} from 'lucide-react'
import Tabs from '@/components/ui/Tabs'
import Button from '@/components/ui/Button'
import AvatarGroup from '@/components/ui/AvatarGroup'
import StatusBadge from '@/components/ui/StatusBadge'
import PriorityBadge from '@/components/ui/PriorityBadge'
import ProgressBar from '@/components/ui/ProgressBar'
import Modal from '@/components/ui/Modal'
import ProjectOverview from '@/components/projects/ProjectOverview'
import ProjectMembers from '@/components/projects/ProjectMembers'
import ProjectSettings from '@/components/projects/ProjectSettings'
import ProjectForm from '@/components/projects/ProjectForm'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { formatShortDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useTasks } from '@/contexts/TaskContext'
import { useUsers } from '@/contexts/UserContext'
import { useNotification } from '@/contexts/NotificationContext'
import { activityService } from '@/services/activityService'
import { hasPermission, canViewProject } from '@/utils/permissions'

const TABS = [
  { key: 'overview',  label: 'Overview', icon: LayoutDashboard },
  { key: 'board',     label: 'Board',    icon: KanbanSquare    },
  { key: 'members',   label: 'Members',  icon: Users           },
  { key: 'settings',  label: 'Settings', icon: Settings2       },
]

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const { user } = useAuth()
  const { projects, updateProject, deleteProject, fetchProjectById } = useProjects()
  const { getTasksForProject, loadTasksForProject } = useTasks()
  const { users } = useUsers()
  const toast = useNotification()

  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [projectActivities, setProjectActivities] = useState([])
  const [notFound, setNotFound] = useState(false)

  // `id` from useParams() is always a string; project ids from the API may be
  // numbers — compare as strings so this doesn't break (and loop-refetch, since
  // a failed match here also fails the `some()` upsert check in ProjectContext).
  const project = projects.find(p => String(p.id) === id)

  // Project list may not have loaded (or never will, e.g. a direct link) by the
  // time this page mounts — fetch it by id instead of trusting list membership.
  useEffect(() => {
    setNotFound(false)
    if (projects.find(p => String(p.id) === id)) return
    fetchProjectById(id).catch(() => setNotFound(true))
  }, [id, projects, fetchProjectById])

  useEffect(() => {
    if (!project) return
    loadTasksForProject(id)
    activityService.getProjectActivities(id, { limit: 20 }).then(({ data }) => setProjectActivities(data))
  }, [id, project, loadTasksForProject])

  if (!project) {
    if (notFound) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-gray-500 text-sm">Project not found.</p>
          <Link to="/projects" className="text-indigo-600 text-sm font-medium hover:underline">
            ← Back to Projects
          </Link>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // RBAC: developers can only see projects they belong to
  if (!canViewProject(user?.role, user?.id, project)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">You don't have access to this project.</p>
        <Link to="/projects" className="text-indigo-600 text-sm font-medium hover:underline">
          ← Back to Projects
        </Link>
      </div>
    )
  }

  const members  = users.filter(u => project.memberIds.includes(u.id))
  const owner    = users.find(u => u.id === project.ownerId)
  const tasks    = getTasksForProject(id)

  const canEdit     = hasPermission(user?.role, 'project:edit')
  const canManageMembers = hasPermission(user?.role, 'member:manage')
  const canSettings = hasPermission(user?.role, 'project:edit')
  const canDeleteProj = hasPermission(user?.role, 'project:delete')

  const setTab = (tab) => setSearchParams({ tab }, { replace: true })

  const handleEditSave = async (formData) => {
    setSaving(true)
    try {
      await updateProject(id, formData, user.id)
      toast.success('Project updated', `"${formData.name}" has been saved.`)
      setEditOpen(false)
    } catch {
      toast.error('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingsSave = async (formData) => {
    try {
      await updateProject(id, formData, user.id)
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const handleDeleteProject = async () => {
    try {
      await deleteProject(id, user.id)
      toast.success('Project deleted')
      navigate('/projects', { replace: true })
    } catch {
      toast.error('Failed to delete project')
    }
  }

  // Filter tabs based on permissions
  const visibleTabs = TABS.filter(tab => {
    if (tab.key === 'settings' && !canSettings) return false
    return true
  })

  return (
    <div className="flex flex-col min-h-full">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-100" style={{ borderTop: `3px solid ${project.color}` }}>
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 pt-5 pb-0">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            All Projects
          </Link>

          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 mt-0.5"
                style={{ backgroundColor: project.color }}
              >
                {project.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{project.description}</p>
              </div>
            </div>

            {canEdit && (
              <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditOpen(true)} className="shrink-0">
                Edit
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 mb-5">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            {project.dueDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CalendarDays size={13} className="text-gray-400" />
                <span>Due {formatShortDate(project.dueDate)}</span>
              </div>
            )}
            <AvatarGroup users={members} max={5} size="xs" />
            <div className="flex items-center gap-2 ml-auto min-w-40">
              <ProgressBar value={project.progress} color={project.color} size="sm" showLabel className="flex-1" />
            </div>
          </div>

          <Tabs tabs={visibleTabs} active={activeTab} onChange={setTab} />
        </div>
      </div>

      {/* Tab Content */}
      <div className={cn(
        'flex-1 max-w-[1600px] mx-auto w-full',
        activeTab === 'board' ? 'px-6 lg:px-8 py-6 overflow-x-auto' : 'px-6 lg:px-8 py-6'
      )}>
        {activeTab === 'overview' && (
          <ProjectOverview
            project={project}
            members={members}
            owner={owner}
            activities={projectActivities}
            users={users}
          />
        )}

        {activeTab === 'board' && (
          <KanbanBoard tasks={tasks} users={users} members={members} projectId={id} />
        )}

        {activeTab === 'members' && (
          <ProjectMembers
            project={project}
            members={members}
            allUsers={users}
            canManage={canManageMembers}
          />
        )}

        {activeTab === 'settings' && canSettings && (
          <ProjectSettings
            project={project}
            onSave={handleSettingsSave}
            onDelete={canDeleteProj ? handleDeleteProject : undefined}
          />
        )}
      </div>

      {/* Edit Modal */}
      {canEdit && (
        <Modal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          title="Edit Project"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" form="project-form" loading={saving}>Save Changes</Button>
            </>
          }
        >
          <ProjectForm key={project.id} initial={project} onSubmit={handleEditSave} loading={saving} />
        </Modal>
      )}
    </div>
  )
}
