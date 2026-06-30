import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function SearchBox({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-sm',
          'text-gray-900 placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400',
          'transition-all duration-150'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  )
}
