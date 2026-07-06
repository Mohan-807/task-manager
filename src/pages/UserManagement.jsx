import { useState, useMemo } from 'react'
import { UserPlus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import StatusBadge from '@/components/ui/StatusBadge'
import SearchBox from '@/components/ui/SearchBox'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Input from '@/components/ui/Input'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonStatCard, SkeletonTableRow } from '@/components/ui/Skeleton'
import { timeAgo, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useUsers } from '@/contexts/UserContext'
import { useProjects } from '@/contexts/ProjectContext'
import { useNotification } from '@/contexts/NotificationContext'

const ROLE_FILTERS   = ['all', 'admin', 'manager', 'developer']
const STATUS_FILTERS = ['all', 'active', 'invited', 'inactive']
const ALL_ROLES      = ['admin', 'manager', 'developer']

const ROLE_VARIANT = {
  admin:     'primary',
  manager:   'purple',
  developer: 'info',
}

const selectCls =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white ' +
  'transition-all appearance-none cursor-pointer'

const BLANK = { name: '', email: '', role: 'developer', status: 'active' }

export default function UserManagement() {
  const { user: currentUser } = useAuth()
  const { users, loading, createUser, updateUser, deleteUser } = useUsers()
  const { projects, loadProjects } = useProjects()
  const toast = useNotification()

  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [addOpen, setAddOpen]         = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [form, setForm]               = useState(BLANK)
  const [formErrors, setFormErrors]   = useState({})
  const [saving, setSaving]           = useState(false)

  const stats = useMemo(() => ({
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    invited:  users.filter(u => u.status === 'invited').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  }), [users])

  const filtered = useMemo(() =>
    users.filter(u => {
      const q = search.toLowerCase()
      return (
        (!search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (roleFilter === 'all'   || u.role === roleFilter) &&
        (statusFilter === 'all' || u.status === statusFilter)
      )
    }),
  [users, search, roleFilter, statusFilter])

  const projectCountFor = (userId) => projects.filter(p => p.memberIds.includes(userId)).length

  const setField = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setFormErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const errors = {}
    if (!form.name.trim())  errors.name  = 'Name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address'
    return errors
  }

  const handleAdd = async () => {
    const errors = validate()
    if (Object.keys(errors).length) { setFormErrors(errors); return }
    setSaving(true)
    try {
      await createUser(form)
      toast.success('User added', `${form.name} has been added.`)
      setAddOpen(false)
      setForm(BLANK)
    } catch {
      toast.error('Failed to add user')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    const errors = validate()
    if (Object.keys(errors).length) { setFormErrors(errors); return }
    setSaving(true)
    try {
      await updateUser(editTarget.id, { name: form.name.trim(), email: form.email.trim(), role: form.role, status: form.status })
      await loadProjects()
      toast.success('User updated', `${form.name} has been saved.`)
      setEditTarget(null)
    } catch {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteTarget.id === currentUser?.id) {
      toast.error('Cannot delete your own account')
      setDeleteTarget(null)
      return
    }
    try {
      await deleteUser(deleteTarget.id)
      await loadProjects()
      toast.success('User deleted', `${deleteTarget.name} has been removed.`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const openAdd = () => { setForm(BLANK); setFormErrors({}); setAddOpen(true) }
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, role: u.role, status: u.status }); setFormErrors({}); setEditTarget(u) }

  const formBody = (
    <div className="space-y-4">
      <Input label="Full Name" value={form.name} onChange={e => setField('name', e.target.value)} error={formErrors.name} required placeholder="e.g. Jane Smith" />
      <Input label="Email Address" type="email" value={form.email} onChange={e => setField('email', e.target.value)} error={formErrors.email} required placeholder="jane@company.io" />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
          <select value={form.role} onChange={e => setField('role', e.target.value)} className={selectCls}>
            {ALL_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select value={form.status} onChange={e => setField('status', e.target.value)} className={selectCls}>
            {['active', 'invited', 'inactive'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all users, roles, and access permissions."
        actions={<Button icon={UserPlus} onClick={openAdd}>Add User</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [0, 1, 2, 3].map(i => <SkeletonStatCard key={i} />)
          : [
              { label: 'Total Users', value: stats.total,    textColor: 'text-indigo-600'  },
              { label: 'Active',      value: stats.active,   textColor: 'text-emerald-600' },
              { label: 'Invited',     value: stats.invited,  textColor: 'text-amber-600'   },
              { label: 'Inactive',    value: stats.inactive, textColor: 'text-gray-400'    },
            ].map((s, i) => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm animate-[slideUp_0.3s_ease_both]" style={{ animationDelay: `${i * 60}ms` }}>
                <p className={cn('text-3xl font-bold', s.textColor)}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))
        }
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <SearchBox value={search} onChange={setSearch} placeholder="Search users..." className="w-full sm:w-72" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ROLE_FILTERS.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize', roleFilter === r ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700')}>
              {r === 'all' ? 'All Roles' : r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize', statusFilter === s ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700')}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  {['User', 'Email', 'Role', 'Status', 'Projects', 'Joined', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[0, 1, 2, 3, 4, 5].map(i => <SkeletonTableRow key={i} />)}
              </tbody>
            </table>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden animate-[slideUp_0.3s_ease_both]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  {['User', 'Email', 'Role', 'Status', 'Projects', 'Joined', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide first:pl-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => {
                  const projectCount = projectCountFor(u.id)
                  const isSelf = u.id === currentUser?.id
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} size="sm" className="shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{u.name}{isSelf && <span className="ml-1.5 text-[10px] font-semibold text-indigo-500">(you)</span>}</p>
                            {u.lastActiveAt && <p className="text-[11px] text-gray-400">Active {timeAgo(u.lastActiveAt)}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><p className="text-sm text-gray-500 truncate max-w-50">{u.email}</p></td>
                      <td className="px-6 py-4"><Badge variant={ROLE_VARIANT[u.role] ?? 'default'} className="capitalize whitespace-nowrap">{u.role}</Badge></td>
                      <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                      <td className="px-6 py-4"><span className="text-sm font-medium text-gray-600 tabular-nums">{projectCount}</span></td>
                      <td className="px-6 py-4"><span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(u.joinedAt)}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors" title="Edit user"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteTarget(u)} disabled={isSelf} className={cn('p-1.5 rounded-lg transition-colors', isSelf ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:bg-red-50 hover:text-red-500')} title={isSelf ? 'Cannot delete your own account' : 'Delete user'}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add User" footer={<><Button variant="secondary" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button><Button icon={UserPlus} onClick={handleAdd} loading={saving}>Add User</Button></>}>{formBody}</Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User" footer={<><Button variant="secondary" onClick={() => setEditTarget(null)} disabled={saving}>Cancel</Button><Button onClick={handleEdit} loading={saving}>Save Changes</Button></>}>{formBody}</Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name ?? 'this user'}? This action cannot be undone.`}
        confirmLabel="Delete User"
      />
    </div>
  )
}
