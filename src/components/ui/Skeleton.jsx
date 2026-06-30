import { cn } from '@/utils/cn'

// Base shimmer piece — every composed skeleton is built from this
export function Bone({ className }) {
  return <div className={cn('skeleton rounded-lg', className)} />
}

// ─── Stat card (Dashboard / Members / UserManagement top row) ────────────────

export function SkeletonStatCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <Bone className="w-10 h-10 rounded-xl" />
        <Bone className="h-5 w-14 rounded-full" />
      </div>
      <Bone className="h-9 w-16 rounded-xl mb-2" />
      <Bone className="h-4 w-28" />
    </div>
  )
}

// ─── Project card (Projects grid) ────────────────────────────────────────────

export function SkeletonProjectCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <Bone className="h-1 w-full rounded-none" />
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Bone className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map(i => <Bone key={i} className="h-12 rounded-xl" />)}
        </div>
        <Bone className="h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map(i => (
              <Bone key={i} className="w-7 h-7 rounded-full ring-2 ring-white" />
            ))}
          </div>
          <Bone className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// ─── Member card (Members grid) ──────────────────────────────────────────────

export function SkeletonMemberCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <Bone className="w-12 h-12 rounded-full" />
        <Bone className="h-5 w-16 rounded-full" />
      </div>
      <Bone className="h-4 w-3/4 mb-1.5" />
      <Bone className="h-3 w-full mb-3" />
      <Bone className="h-5 w-20 rounded-full mb-4" />
      <div className="border-t border-gray-50 pt-3 space-y-2">
        <Bone className="h-3 w-2/3" />
        <Bone className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// ─── Table row (UserManagement table) ────────────────────────────────────────

export function SkeletonTableRow() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Bone className="w-8 h-8 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Bone className="h-3.5 w-28" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Bone className="h-3.5 w-40" /></td>
      <td className="px-6 py-4"><Bone className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-4"><Bone className="h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-4"><Bone className="h-4 w-6" /></td>
      <td className="px-6 py-4"><Bone className="h-3.5 w-24" /></td>
      <td className="px-6 py-4">
        <div className="flex gap-1 justify-end">
          <Bone className="h-7 w-7 rounded-lg" />
          <Bone className="h-7 w-7 rounded-lg" />
        </div>
      </td>
    </tr>
  )
}

// ─── Dashboard content block ──────────────────────────────────────────────────

export function SkeletonDashboardBlock() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Bone className="h-5 w-32" />
        <Bone className="h-4 w-16" />
      </div>
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Bone className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Bone className="h-3.5 w-3/4" />
            <Bone className="h-3 w-1/2" />
          </div>
          <Bone className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}
