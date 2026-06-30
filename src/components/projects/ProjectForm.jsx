import { useState } from 'react'
import { Check } from 'lucide-react'
import Input from '@/components/ui/Input'
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

export default function ProjectForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? '',
    description: initial?.description ?? '',
    priority:    initial?.priority    ?? 'medium',
    status:      initial?.status      ?? 'active',
    dueDate:     initial?.dueDate     ?? '',
    color:       initial?.color       ?? PRESET_COLORS[0],
  })

  const [errors, setErrors] = useState({})

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Project name is required'
    if (form.name.trim().length > 60) e.name = 'Name must be 60 characters or fewer'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit(form)
  }

  return (
    <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        label="Project Name"
        placeholder="e.g. Website Redesign"
        value={form.name}
        onChange={e => set('name', e.target.value)}
        error={errors.name}
        required
        maxLength={60}
      />

      {/* Description */}
      <Input
        label="Description"
        placeholder="Briefly describe the project goals and scope..."
        value={form.description}
        onChange={e => set('description', e.target.value)}
        textarea
        rows={3}
      />

      {/* Priority + Status row */}
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

      {/* Due Date */}
      <Input
        label="Due Date"
        type="date"
        value={form.dueDate}
        onChange={e => set('dueDate', e.target.value)}
        min={new Date().toISOString().split('T')[0]}
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
                'w-8 h-8 rounded-lg transition-all duration-150 flex items-center justify-center',
                form.color === color
                  ? 'ring-2 ring-offset-2 scale-110'
                  : 'hover:scale-105'
              )}
              style={{
                backgroundColor: color,
                ringColor: color,
              }}
              title={color}
            >
              {form.color === color && <Check size={14} className="text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
