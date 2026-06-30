import { useState, useMemo } from 'react'
import { UserPlus, UserMinus, Search, X } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import StatusBadge from '@/components/ui/StatusBadge'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'
import { useProjects } from '@/contexts/ProjectContext'
import { useNotification } from '@/contexts/NotificationContext'

const ROLE_VARIANT = {
  admin:     'primary',
  manager:   'purple',
  developer: 'info',
}

export default function ProjectMembers({ project, members, allUsers = [], canManage = false }) {
  const { addMember, removeMember } = useProjects()
  const toast = useNotification()

  const [addOpen, setAddOpen]       = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [search, setSearch]         = useState('')
  const [adding, setAdding]         = useState(false)
  const [selected, setSelected]     = useState(null)

  const nonMembers = useMemo(() =>
    allUsers.filter(u =>
      !project.memberIds.includes(u.id) &&
      u.status !== 'inactive' &&
      (
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    ),
  [allUsers, project.memberIds, search])

  const handleAdd = async () => {
    if (!selected) return
    setAdding(true)
    try {
      await addMember(project.id, selected.id)
      toast.success('Member added', `${selected.name} has been added to the project.`)
      setAddOpen(false)
      setSelected(null)
      setSearch('')
    } catch {
      toast.error('Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    try {
      await removeMember(project.id, removeTarget.id)
      toast.success('Member removed', `${removeTarget.name} has been removed.`)
      setRemoveTarget(null)
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const openAdd = () => {
    setSelected(null)
    setSearch('')
    setAddOpen(true)
  }

  if (members.length === 0) {
    return (
      <>
        <EmptyState
          icon={UserPlus}
          title="No members yet"
          description="Add team members to collaborate on this project."
          action={canManage && <Button icon={UserPlus} onClick={openAdd}>Add Member</Button>}
        />
        {addModal}
      </>
    )
  }

  const addModal = (
    <Modal
      isOpen={addOpen}
      onClose={() => setAddOpen(false)}
      title="Add Member"
      footer={
        <>
          <Button variant="secondary" onClick={() => setAddOpen(false)} disabled={adding}>Cancel</Button>
          <Button icon={UserPlus} onClick={handleAdd} loading={adding} disabled={!selected}>Add Member</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all"
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {nonMembers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {search ? 'No users match your search.' : 'All active users are already members.'}
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 -mx-6 px-6">
            {nonMembers.map(u => (
              <button
                key={u.id}
                onClick={() => setSelected(u.id === selected?.id ? null : u)}
                className={cn(
                  'flex items-center gap-3 w-full py-3 text-left rounded-lg px-2 -mx-2 transition-colors',
                  selected?.id === u.id
                    ? 'bg-indigo-50'
                    : 'hover:bg-gray-50'
                )}
              >
                <Avatar user={u} size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <Badge variant={ROLE_VARIANT[u.role] ?? 'default'} className="capitalize shrink-0">
                  {u.role}
                </Badge>
                {selected?.id === u.id && (
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Team Members</h3>
          <p className="text-xs text-gray-400 mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && (
          <Button icon={UserPlus} size="sm" onClick={openAdd}>
            Add Member
          </Button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/50">
          {['Member', 'Email', 'Role', 'Status', ''].map(h => (
            <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {members.map(member => (
            <div
              key={member.id}
              className="grid grid-cols-[1fr_1.5fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <Avatar user={member} size="sm" className="shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                  {member.id === project.ownerId && (
                    <span className="text-[10px] font-semibold text-indigo-500">Owner</span>
                  )}
                </div>
              </div>

              {/* Email */}
              <p className="text-sm text-gray-500 truncate">{member.email}</p>

              {/* Role */}
              <Badge variant={ROLE_VARIANT[member.role] ?? 'default'} className="capitalize">
                {member.role}
              </Badge>

              {/* Status */}
              <StatusBadge status={member.status} />

              {/* Action */}
              {canManage ? (
                <button
                  disabled={member.id === project.ownerId}
                  onClick={() => setRemoveTarget(member)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    member.id === project.ownerId
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                  )}
                  title={member.id === project.ownerId ? 'Cannot remove owner' : 'Remove from project'}
                >
                  <UserMinus size={15} />
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>

      {addModal}

      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        title="Remove Member"
        message={`Remove ${removeTarget?.name ?? 'this member'} from the project? They will lose access immediately.`}
        confirmLabel="Remove"
      />
    </div>
  )
}
