import { useNavigate } from "react-router-dom"

export default function ProjectCard({ project }) {
  const navigate = useNavigate()

  const copyInviteCode = (e) => {
  e.stopPropagation()
  navigator.clipboard.writeText(project.invite_code)
  alert("Invite code copied!")
  }
  
  const copyInviteLink = (e) => {
    e.stopPropagation()
    const link = `${window.location.origin}/join/${project.invite_code}`
    navigator.clipboard.writeText(link)
    alert("Invite link copied!")
  }

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-semibold text-lg">{project.name}</h3>
        <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-full">Active</span>
      </div>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {project.description || "No description"}
      </p>
      {project.deadline && (
        <p className="text-gray-500 text-xs mb-4">📅 Due: {project.deadline}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs font-mono bg-gray-700 px-2 py-1 rounded">
          #{project.invite_code}
        </span>
        <button
          onClick={copyInviteCode}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Copy code
        </button>
        <button
          onClick={copyInviteLink}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Copy invite link
        </button>
      </div>
    </div>
  )
}