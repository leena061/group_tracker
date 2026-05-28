import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">Your Projects</h2>
          <p className="text-gray-400 text-sm">Create a project and invite your team</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-10 text-center border border-gray-700">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first project to start tracking contributions</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            + New Project
          </button>
        </div>
      </main>
    </div>
  )
}