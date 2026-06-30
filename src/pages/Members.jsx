import { useState, useMemo } from 'react'
import { UserPlus, Users, Briefcase, Clock } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import SearchBox from '@/components/ui/SearchBox'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonStatCard, SkeletonMemberCard } from '@/components/ui/Skeleton'
import { timeAgo } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/contexts/UserContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useNotification } from '@/contexts/NotificationContext'
import { hasPermission } from '@/utils/permissions'

const ROLE_FILTERS = ['all', 'admin', 'manager', 'developer', 'tester']
const INVITE_ROLES = ['manager', 'developer', 'tester']

const ROLE_VARIANT = {
  admin:     'primary',
  manager:   'purple',
  developer: 'info',
  tester:    'warning',
}

const selectCls =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white ' +
  'transition-all appearance-none cursor-pointer'

const BLANK_INVITE = { name: '', email: '', role: 'developer' }

export default function Members() {
  const { user: currentUser } = useAuth()
  const { users, loading, inviteUser } = useUsers()
  const { projects } = useProjects()
  const toast = useNotification()

  const canInvite = hasPermission(currentUser?.role, 'member:manage')

  const [search, setSearch]       = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite]       = useState(BLANK_INVITE)
  const [inviteErrors, setInviteErrors] = useState({})
  const [inviting, setInviting]   = useState(false)

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    invited:  users.filter(u => u.status === 'invited').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  }), [users])

  const roleCounts = useMemo(() => {
    const counts = { all: users.length }
    ROLE_FILTERS.slice(1).forEach(r => { counts[r] = users.filter(u => u.role === r).length })
    return counts
  }, [users])

  const filtered = useMemo(() =>
    users.filter(u => {
      const q = search.toLowerCase()
      const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchRole   = roleFilter === 'all' || u.role === roleFilter
      return matchSearch && matchRole
    }),
  [users, search, roleFilter])

  const projectCountFor = (userId) => projects.filter(p => p.memberIds.includes(userId)).length

  const closeInvite = () => {
    setInviteOpen(false)
    setInvite(BLANK_INVITE)
    setInviteErrors({})
  }

  const handleInvite = async () => {
    const errors = {}
    if (!invite.name.trim()) errors.name = 'Name is required'
    if (!invite.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) errors.email = 'Invalid email address'
    if (Object.keys(errors).length) { setInviteErrors(errors); return }

    setInviting(true)
    try {
      await inviteUser(invite)
      toast.success('Invitation sent', `${invite.name} has been invited.`)
      closeInvite()
    } catch {
      toast.error('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Members"
        description="View and manage your team members."
        actions={
          canInvite && (
            <Button icon={UserPlus} onClick={() => setInviteOpen(true)}>
              Invite Member
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [0, 1, 2, 3].map(i => <SkeletonStatCard key={i} />)
          : [
              { label: 'Total Members', value: stats.total,    textColor: 'text-indigo-600'  },
              { label: 'Active',        value: stats.active,   textColor: 'text-emerald-600' },
              { label: 'Invited',       value: stats.invited,  textColor: 'text-amber-600'   },
              { label: 'Inactive',      value: stats.inactive, textColor: 'text-gray-400'    },
            ].map((s, i) => (
              <div
                key={s.label}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-[slideUp_0.3s_ease_both]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <p className={cn('text-3xl font-bold', s.textColor)}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))
        }
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBox value={search} onChange={setSearch} placeholder="Search members..." className="w-full sm:w-72" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_FILTERS.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize',
                roleFilter === role
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
              )}
            >
              {role === 'all' ? 'All' : role}
              <span className={cn('ml-1.5 text-[10px] font-semibold tabular-nums', roleFilter === role ? 'text-indigo-200' : 'text-gray-400')}>
                {roleCounts[role] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <SkeletonMemberCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="Try adjusting your search or role filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member, i) => {
            const projectCount = projectCountFor(member.id)
            return (
              <div
                key={member.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all animate-[slideUp_0.3s_ease_both]"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <Avatar user={member} size="lg" />
                  <StatusBadge status={member.status} />
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5 mb-3">{member.email}</p>
                <Badge variant={ROLE_VARIANT[member.role] ?? 'default'} className="capitalize mb-4">
                  {member.role}
                </Badge>
                <div className="border-t border-gray-50 pt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Briefcase size={12} className="shrink-0" />
                    <span>{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={12} className="shrink-0" />
                    <span>{member.lastActiveAt ? `Active ${timeAgo(member.lastActiveAt)}` : 'Never active'}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={inviteOpen}
        onClose={closeInvite}
        title="Invite Member"
        footer={
          <>
            <Button variant="secondary" onClick={closeInvite} disabled={inviting}>Cancel</Button>
            <Button icon={UserPlus} onClick={handleInvite} loading={inviting}>Send Invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={invite.name}
            onChange={e => { setInvite(f => ({ ...f, name: e.target.value })); setInviteErrors(er => ({ ...er, name: '' })) }}
            error={inviteErrors.name}
            required
            placeholder="e.g. Jane Smith"
          />
          <Input
            label="Email Address"
            type="email"
            value={invite.email}
            onChange={e => { setInvite(f => ({ ...f, email: e.target.value })); setInviteErrors(er => ({ ...er, email: '' })) }}
            error={inviteErrors.email}
            required
            placeholder="jane@company.io"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
            <select value={invite.role} onChange={e => setInvite(f => ({ ...f, role: e.target.value }))} className={selectCls}>
              {INVITE_ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
