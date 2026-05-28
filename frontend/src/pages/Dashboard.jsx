import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import CreateProjectModal from "../components/CreateProjectModal"
import ProjectCard from "../components/ProjectCard"
import JoinProjectModal from "../components/JoinProjectModal"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/projects/")
      .then(res => setProjects(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject])
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-white">Group Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">Hi, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Projects</h2>
            <p className="text-gray-400 text-sm">Create a project and invite your team</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Join Project
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              + New Project
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-20">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-10 text-center border border-gray-700">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-400 text-sm mb-6">Create your first project to start tracking contributions</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Join Project
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                + New Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {showJoinModal && (
        <JoinProjectModal onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  )
}