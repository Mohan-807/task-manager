import { useState, useEffect, useCallback } from 'react'
import { Trash2, Calendar, MessageSquare, Send, Pencil, X, Check } from 'lucide-react'
import Drawer from '@/components/ui/Drawer'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/utils/cn'
import { formatDate, timeAgo } from '@/utils/formatters'
import { useAuth } from '@/contexts/AuthContext'
import { useTasks } from '@/contexts/TaskContext'
import { useNotification } from '@/contexts/NotificationContext'
import { activityService } from '@/services/activityService'
import { canEditTask, canDeleteTask, hasPermission } from '@/utils/permissions'

const STATUSES = [
  { value: 'todo',        label: 'Todo',        color: 'bg-gray-100 text-gray-600 hover:bg-gray-200'          },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100'           },
  { value: 'testing',     label: 'Testing',     color: 'bg-amber-50 text-amber-700 hover:bg-amber-100'        },
  { value: 'done',        label: 'Done',        color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'  },
]

const PRIORITIES = [
  { value: 'critical', label: 'Critical', color: 'bg-red-50 text-red-700 hover:bg-red-100'         },
  { value: 'high',     label: 'High',     color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'},
  { value: 'medium',   label: 'Medium',   color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'},
  { value: 'low',      label: 'Low',      color: 'bg-slate-50 text-slate-600 hover:bg-slate-100'   },
]

function PillSelector({ options, value, onChange, disabled }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(opt.value)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
            disabled && 'cursor-not-allowed opacity-60',
            value === opt.value
              ? cn(opt.color, 'ring-2 ring-offset-1 ring-current/30')
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MetaRow({ label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className="w-24 shrink-0 text-xs font-medium text-gray-400 pt-0.5">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function CommentItem({ comment, author, currentUserId, isAdmin, onEdit, onDelete }) {
  const [editing, setEditing]     = useState(false)
  const [editText, setEditText]   = useState(comment.content)
  const [deleting, setDeleting]   = useState(false)

  const isOwn = comment.userId === currentUserId
  const canEdit   = isOwn
  const canDelete = isOwn || isAdmin

  const handleSaveEdit = () => {
    if (!editText.trim()) return
    onEdit(comment.id, editText)
    setEditing(false)
  }

  return (
    <div className="flex gap-3">
      <Avatar user={author} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 bg-gray-50 rounded-xl px-3.5 py-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">{author?.name ?? 'Unknown'}</span>
            <span className="text-[11px] text-gray-400">{timeAgo(comment.createdAt)}</span>
            {comment.isEdited && <span className="text-[10px] text-gray-300 italic">edited</span>}
          </div>
          {(canEdit || canDelete) && !editing && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <button
                  onClick={() => { setEditing(true); setEditText(comment.content) }}
                  className="p-1 rounded text-gray-300 hover:text-indigo-500 transition-colors"
                >
                  <Pencil size={11} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setDeleting(true)}
                  className="p-1 rounded text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="flex gap-2 items-start">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={2}
              className="flex-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              autoFocus
            />
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={handleSaveEdit} className="p-1 rounded text-emerald-500 hover:bg-emerald-50"><Check size={13} /></button>
              <button onClick={() => setEditing(false)} className="p-1 rounded text-gray-400 hover:bg-gray-100"><X size={13} /></button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={() => { onDelete(comment.id); setDeleting(false) }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default function TaskDrawer({ task, users, isOpen, onClose, onSave, onDelete }) {
  const { user } = useAuth()
  const { loadComments, comments: allComments, addComment, updateComment, deleteComment } = useTasks()
  const toast = useNotification()

  const [form, setForm]           = useState(null)
  const [newComment, setNewComment] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [sendingComment, setSendingComment] = useState(false)
  const [taskActivities, setTaskActivities] = useState([])

  const comments = task ? (allComments[task.id] ?? []) : []

  const isAdmin = user?.role === 'admin'
  const canEdit = form ? canEditTask(user?.role, user?.id, form) : false
  const canDelete = form ? canDeleteTask(user?.role, user?.id, form) : false
  const canChangeStatus = canEdit && (form?.status !== 'done' || hasPermission(user?.role, 'task:reopen'))
  const canAssign = hasPermission(user?.role, 'task:assign')

  useEffect(() => {
    if (task && isOpen) {
      setForm({ ...task })
      setNewComment('')
      setConfirmDelete(false)
      loadComments(task.id)
      activityService.getTaskActivities(task.id, { limit: 5 }).then(({ data }) => setTaskActivities(data))
    }
  }, [task, isOpen, loadComments])

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), [])
  const getUser = (id) => users.find(u => u.id === id)

  if (!form || !isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setSendingComment(true)
    try {
      await addComment(task.id, newComment)
      setNewComment('')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSendingComment(false)
    }
  }

  const handleEditComment = async (commentId, content) => {
    try {
      await updateComment(commentId, content)
    } catch {
      toast.error('Failed to edit comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId, task.id)
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const assignee = getUser(form.assigneeId)

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      width="md"
      footer={
        <>
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-red-600 font-medium flex-1">Delete this task?</span>
              <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(form.id)}>Confirm Delete</Button>
            </div>
          ) : (
            <>
              {canDelete && (
                <Button variant="danger-ghost" size="sm" icon={Trash2} onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
                {canEdit && (
                  <Button size="sm" onClick={handleSave} loading={saving}>Save Changes</Button>
                )}
              </div>
            </>
          )}
        </>
      }
    >
      <div className="px-6 py-5 space-y-5">
        {/* Title */}
        <textarea
          value={form.title}
          onChange={e => set('title', e.target.value)}
          disabled={!canEdit}
          rows={2}
          className={cn(
            'w-full text-lg font-semibold text-gray-900 leading-snug resize-none',
            'bg-transparent focus:outline-none focus:bg-gray-50 rounded-lg px-2 py-1 -mx-2 -my-1',
            'placeholder:text-gray-300 transition-colors',
            !canEdit && 'cursor-default'
          )}
          placeholder="Task title"
        />

        {/* Meta */}
        <div className="bg-gray-50/60 rounded-xl px-4 py-1">
          <MetaRow label="Status">
            <PillSelector options={STATUSES} value={form.status} onChange={v => set('status', v)} disabled={!canChangeStatus} />
          </MetaRow>

          <MetaRow label="Priority">
            <PillSelector options={PRIORITIES} value={form.priority} onChange={v => set('priority', v)} disabled={!canEdit} />
          </MetaRow>

          <MetaRow label="Assignee">
            <div className="flex flex-wrap gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  disabled={!canAssign}
                  onClick={() => canAssign && set('assigneeId', u.id)}
                  title={u.name}
                  className={cn(
                    'rounded-full transition-all',
                    !canAssign && 'cursor-default',
                    form.assigneeId === u.id
                      ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110'
                      : 'opacity-60 hover:opacity-100'
                  )}
                >
                  <Avatar user={u} size="sm" />
                </button>
              ))}
              {form.assigneeId && canAssign && (
                <button
                  type="button"
                  onClick={() => set('assigneeId', null)}
                  className="text-[10px] text-gray-400 hover:text-red-500 transition-colors ml-1"
                >
                  Clear
                </button>
              )}
            </div>
          </MetaRow>

          <MetaRow label="Due Date">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 shrink-0" />
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={e => set('dueDate', e.target.value)}
                disabled={!canEdit}
                className={cn(
                  'text-sm text-gray-700 bg-transparent focus:outline-none',
                  'focus:bg-white focus:border focus:border-gray-200 focus:px-2 focus:py-0.5 focus:rounded-md',
                  'transition-all',
                  !canEdit && 'cursor-default'
                )}
              />
            </div>
          </MetaRow>

          {form.reporterId && (
            <MetaRow label="Reporter">
              <div className="flex items-center gap-2">
                <Avatar user={getUser(form.reporterId)} size="xs" />
                <span className="text-sm text-gray-600">{getUser(form.reporterId)?.name ?? '—'}</span>
              </div>
            </MetaRow>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            disabled={!canEdit}
            rows={4}
            placeholder={canEdit ? 'Add a description...' : 'No description.'}
            className={cn(
              'w-full text-sm text-gray-700 leading-relaxed rounded-lg border border-gray-100',
              'bg-gray-50 px-3.5 py-3 resize-none',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white',
              'placeholder:text-gray-300 transition-all',
              !canEdit && 'cursor-default'
            )}
          />
        </div>

        {/* Comments */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <MessageSquare size={12} />
            Comments
            {comments.length > 0 && <span className="text-gray-300">({comments.length})</span>}
          </label>

          {comments.length > 0 && (
            <div className="space-y-3 mb-4 group">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  author={getUser(comment.userId)}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}

          {/* New comment */}
          <div className="flex gap-3">
            <Avatar user={getUser(user?.id)} size="sm" className="shrink-0 mt-1" />
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment()
                }}
                rows={2}
                placeholder="Add a comment… (⌘+Enter to send)"
                className={cn(
                  'w-full text-sm text-gray-700 rounded-xl border border-gray-200 bg-gray-50',
                  'px-3.5 py-2.5 pr-10 resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white',
                  'placeholder:text-gray-300 transition-all'
                )}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || sendingComment}
                className="absolute right-2.5 bottom-2.5 p-1 rounded-lg text-gray-300 hover:text-indigo-500 disabled:cursor-not-allowed transition-colors"
              >
                {sendingComment
                  ? <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin block" />
                  : <Send size={14} />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Activity */}
        {taskActivities.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 block">
              Activity
            </label>
            <div className="space-y-2.5">
              {taskActivities.map(act => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <Avatar user={act.user} size="xs" className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p
                      className="text-gray-500 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: act.message }}
                    />
                    <span className="text-gray-300 text-[11px]">{timeAgo(act.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
