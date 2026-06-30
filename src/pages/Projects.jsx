import { useState, useMemo } from 'react'
import { FolderKanban, Plus } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import SearchBox from '@/components/ui/SearchBox'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import ProjectCard from '@/components/projects/ProjectCard'
import ProjectForm from '@/components/projects/ProjectForm'
import { SkeletonProjectCard } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useUsers } from '@/contexts/UserContext'
import { useNotification } from '@/contexts/NotificationContext'
import { hasPermission } from '@/utils/permissions'

const STATUS_FILTERS = [
  { value: 'all',       label: 'All'       },
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
]

export default function Projects() {
  const { user } = useAuth()
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const { users } = useUsers()
  const toast = useNotification()

  const canCreate = hasPermission(user?.role, 'project:create')
  const canDelete  = hasPermission(user?.role, 'project:delete')
  const canEdit    = hasPermission(user?.role, 'project:edit')
  const viewAll    = hasPermission(user?.role, 'project:view:all')

  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen]   = useState(false)
  const [editingProject, setEditingProject]   = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [saving, setSaving]           = useState(false)

  // Developers only see projects they're a member of
  const visibleProjects = useMemo(() =>
    viewAll ? projects : projects.filter(p => p.memberIds.includes(user?.id)),
  [projects, viewAll, user])

  const filtered = useMemo(() => {
    return visibleProjects
      .filter(p => statusFilter === 'all' || p.status === statusFilter)
      .filter(p => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      })
  }, [visibleProjects, search, statusFilter])

  const statusCounts = useMemo(() => {
    const counts = { all: visibleProjects.length }
    STATUS_FILTERS.slice(1).forEach(f => {
      counts[f.value] = visibleProjects.filter(p => p.status === f.value).length
    })
    return counts
  }, [visibleProjects])

  const getMembersForProject = (project) => users.filter(u => project.memberIds.includes(u.id))

  const handleCreate = async (formData) => {
    setSaving(true)
    try {
      await createProject(formData, user.id)
      toast.success('Project created', `"${formData.name}" has been created.`)
      setCreateOpen(false)
    } catch {
      toast.error('Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (formData) => {
    setSaving(true)
    try {
      await updateProject(editingProject.id, formData, user.id)
      toast.success('Project updated', `"${formData.name}" has been saved.`)
      setEditingProject(null)
    } catch {
      toast.error('Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      const name = deletingProject.name
      await deleteProject(deletingProject.id, user.id)
      toast.success('Project deleted', `"${name}" has been permanently removed.`)
      setDeletingProject(null)
    } catch {
      toast.error('Failed to delete project')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Projects"
        description={`${visibleProjects.length} total project${visibleProjects.length !== 1 ? 's' : ''}`}
        actions={
          canCreate && (
            <Button icon={Plus} onClick={() => setCreateOpen(true)}>
              New Project
            </Button>
          )
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          className="sm:w-72"
        />
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150',
                statusFilter === f.value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {f.label}
              {(statusCounts[f.value] ?? 0) > 0 && (
                <span className={cn(
                  'text-[11px] font-semibold px-1.5 py-0.5 rounded-md leading-none',
                  statusFilter === f.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {statusCounts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <SkeletonProjectCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => (
            <div
              key={project.id}
              className="animate-[slideUp_0.3s_ease_both]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ProjectCard
                project={project}
                members={getMembersForProject(project)}
                onEdit={canEdit ? setEditingProject : undefined}
                onDelete={canDelete ? setDeletingProject : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title={search ? 'No projects found' : 'No projects yet'}
          description={
            search
              ? `No projects match "${search}". Try a different search term.`
              : canCreate
                ? 'Create your first project to get started.'
                : 'You have not been added to any projects yet.'
          }
          action={
            !search && canCreate && (
              <Button icon={Plus} onClick={() => setCreateOpen(true)}>New Project</Button>
            )
          }
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="project-form" loading={saving}>Create Project</Button>
          </>
        }
      >
        <ProjectForm onSubmit={handleCreate} loading={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingProject(null)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="project-form" loading={saving}>Save Changes</Button>
          </>
        }
      >
        {editingProject && (
          <ProjectForm
            key={editingProject.id}
            initial={editingProject}
            onSubmit={handleEdit}
            loading={saving}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={
          deletingProject
            ? `Are you sure you want to delete "${deletingProject.name}"? All tasks and data will be permanently removed.`
            : ''
        }
        loading={saving}
      />
    </div>
  )
}
