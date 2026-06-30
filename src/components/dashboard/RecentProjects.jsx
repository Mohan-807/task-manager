import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProjectProgressCard from './ProjectProgressCard'

export default function RecentProjects({ projects, users }) {
  const getUsersForProject = (project) =>
    users.filter(u => project.memberIds.includes(u.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Active Projects</h2>
          <p className="text-xs text-gray-400 mt-0.5">{projects.length} projects in progress</p>
        </div>
        <Link
          to="/projects"
          className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map(project => (
          <ProjectProgressCard
            key={project.id}
            project={project}
            members={getUsersForProject(project)}
          />
        ))}
      </div>
    </div>
  )
}
