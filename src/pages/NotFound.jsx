import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f8fb] px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mb-6">
        <Zap size={24} className="text-white" />
      </div>
      <p className="text-[96px] font-black text-gray-100 leading-none select-none">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">Page not found</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
