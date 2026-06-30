import { useState } from 'react'
import { Check, User, Bell, Shield, Palette } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'

const ROLE_VARIANT = { admin: 'primary', manager: 'purple', developer: 'info', tester: 'warning' }

const PRESET_COLORS = [
  '#6366f1','#ec4899','#10b981','#f59e0b',
  '#8b5cf6','#06b6d4','#f97316','#14b8a6',
]

const TABS = [
  { key: 'profile',       label: 'Profile',        icon: User    },
  { key: 'notifications', label: 'Notifications',   icon: Bell    },
  { key: 'security',      label: 'Security',        icon: Shield  },
  { key: 'appearance',    label: 'Appearance',      icon: Palette },
]

function Section({ title, description, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function ProfileTab({ user, onSave }) {
  const [form, setForm] = useState({
    name:       user?.name       ?? '',
    email:      user?.email      ?? '',
    department: user?.department ?? '',
  })
  const [color, setColor]   = useState(user?.color ?? '#6366f1')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setSaved(false)
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const handleSave = async () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      await onSave({ ...form, color })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Section title="Personal Information" description="Update your name, email and avatar.">
        <div className="flex items-center gap-4">
          <Avatar user={{ ...user, color }} size="xl" />
          <div>
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.email}</p>
            <Badge variant={ROLE_VARIANT[user?.role] ?? 'default'} className="capitalize mt-2">
              {user?.role}
            </Badge>
          </div>
        </div>

        <Input
          label="Full Name"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Your full name"
        />
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={e => set('email', e.target.value)}
          error={errors.email}
          required
          placeholder="you@company.io"
        />
        <Input
          label="Department"
          value={form.department}
          onChange={e => set('department', e.target.value)}
          placeholder="e.g. Engineering"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Avatar Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setColor(c); setSaved(false) }}
                className={cn(
                  'w-8 h-8 rounded-lg transition-all flex items-center justify-center',
                  color === c ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'
                )}
                style={{ backgroundColor: c }}
              >
                {color === c && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      </Section>
    </div>
  )
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    taskAssigned:   true,
    taskCompleted:  true,
    commentAdded:   true,
    projectCreated: false,
    memberAdded:    true,
    weeklyDigest:   false,
  })
  const [saved, setSaved] = useState(false)

  const toggle = (key) => { setPrefs(p => ({ ...p, [key]: !p[key] })); setSaved(false) }

  const ITEMS = [
    { key: 'taskAssigned',   label: 'Task assigned to you',     desc: 'When a task is assigned to you' },
    { key: 'taskCompleted',  label: 'Task completed',            desc: 'When a task you created is completed' },
    { key: 'commentAdded',   label: 'New comment on your tasks', desc: 'When someone comments on your task' },
    { key: 'projectCreated', label: 'New project created',       desc: 'When a new project is created' },
    { key: 'memberAdded',    label: 'Member added to project',   desc: 'When a member joins your project' },
    { key: 'weeklyDigest',   label: 'Weekly digest email',       desc: 'A weekly summary of your activity' },
  ]

  return (
    <Section title="Notification Preferences" description="Choose what you want to be notified about.">
      <div className="space-y-4">
        {ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                prefs[item.key] ? 'bg-indigo-500' : 'bg-gray-200'
              )}
            >
              <span className={cn(
                'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
                prefs[item.key] ? 'translate-x-4' : 'translate-x-1'
              )} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Button onClick={() => setSaved(true)}>Save Preferences</Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><Check size={14} /> Saved</span>}
      </div>
    </Section>
  )
}

function SecurityTab() {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const toast = useNotification()

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
    setSaved(false)
  }

  const handleChange = async () => {
    const errs = {}
    if (!form.current)                      errs.current = 'Current password is required'
    if (!form.next || form.next.length < 6) errs.next    = 'New password must be at least 6 characters'
    if (form.next !== form.confirm)         errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setSaved(true)
    setForm({ current: '', next: '', confirm: '' })
    toast.success('Password changed', 'Your password has been updated.')
  }

  return (
    <Section title="Change Password" description="Keep your account secure with a strong password.">
      <Input label="Current Password" type="password" value={form.current} onChange={e => set('current', e.target.value)} error={errors.current} placeholder="••••••••" />
      <Input label="New Password" type="password" value={form.next} onChange={e => set('next', e.target.value)} error={errors.next} placeholder="Minimum 6 characters" />
      <Input label="Confirm New Password" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} error={errors.confirm} placeholder="Repeat new password" />
      <div className="flex items-center gap-3 pt-1">
        <Button onClick={handleChange} loading={saving}>Change Password</Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><Check size={14} /> Password changed</span>}
      </div>
    </Section>
  )
}

function AppearanceTab() {
  const [theme, setTheme]     = useState('light')
  const [density, setDensity] = useState('default')
  const [saved, setSaved]     = useState(false)

  return (
    <Section title="Appearance" description="Customize how TaskFlow looks for you.">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Theme</label>
        <div className="flex gap-3">
          {['light', 'dark', 'system'].map(t => (
            <button
              key={t}
              onClick={() => { setTheme(t); setSaved(false) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all capitalize',
                theme === t
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Density</label>
        <div className="flex gap-3">
          {['compact', 'default', 'comfortable'].map(d => (
            <button
              key={d}
              onClick={() => { setDensity(d); setSaved(false) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all capitalize',
                density === d
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button onClick={() => setSaved(true)}>Save Preferences</Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium"><Check size={14} /> Saved</span>}
      </div>
    </Section>
  )
}

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const toast = useNotification()
  const [activeTab, setActiveTab] = useState('profile')

  const handleProfileSave = async (data) => {
    try {
      await updateProfile(data)
      toast.success('Profile updated', 'Your profile has been saved.')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences." />

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="animate-[fadeIn_0.2s_ease]">
        {activeTab === 'profile'       && <ProfileTab user={user} onSave={handleProfileSave} />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security'      && <SecurityTab />}
        {activeTab === 'appearance'    && <AppearanceTab />}
      </div>
    </div>
  )
}
