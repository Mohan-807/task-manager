import { useState } from 'react'
import { Check, AlertTriangle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { cn } from '@/utils/cn'

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6',
]

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High'     },
  { value: 'medium',   label: 'Medium'   },
  { value: 'low',      label: 'Low'      },
]

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
]

const selectClass = cn(
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white',
  'transition-all duration-150 appearance-none cursor-pointer'
)

export default function ProjectSettings({ project, onSave, onDelete }) {
  const [form, setForm] = useState({
    name:        project.name,
    description: project.description,
    priority:    project.priority,
    status:      project.status,
    dueDate:     project.dueDate ?? '',
    color:       project.color,
  })
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [errors, setErrors]           = useState({})
  const [deleteOpen, setDeleteOpen] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setSaved(false)
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Project name is required' })
      return
    }
    setSaving(true)
    try {
      await onSave?.(form)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* General settings */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-semibold text-gray-800">General</h3>

        <Input
          label="Project Name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          error={errors.name}
          required
          maxLength={60}
        />

        <Input
          label="Description"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          textarea
          rows={3}
          placeholder="Describe this project..."
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select
              value={form.priority}
              onChange={e => set('priority', e.target.value)}
              className={selectClass}
            >
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={form.dueDate}
          onChange={e => set('dueDate', e.target.value)}
        />

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Project Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => set('color', color)}
                className={cn(
                  'w-8 h-8 rounded-lg transition-all flex items-center justify-center',
                  form.color === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                )}
                style={{ backgroundColor: color }}
              >
                {form.color === color && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-400" />
          <h3 className="text-sm font-semibold text-red-600">Danger Zone</h3>
        </div>
        <div className="space-y-3">
          {onDelete && (
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Delete project</p>
                <p className="text-xs text-gray-400">Permanently delete all tasks and data.</p>
              </div>
              <Button variant="danger" size="sm" icon={AlertTriangle} onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          )}
          {!onDelete && (
            <p className="text-xs text-gray-400 py-2">
              You don't have permission to delete this project.
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => { setDeleteOpen(false); onDelete?.() }}
        title="Delete Project"
        message={`Permanently delete "${project.name}"? All tasks, comments, and data will be removed. This cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  )
}
