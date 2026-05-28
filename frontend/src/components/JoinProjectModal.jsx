import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"

export default function JoinProjectModal({ onClose }) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post(`/projects/join/${code.trim()}`)
      onClose()
      navigate(`/dashboard`)
      window.location.reload()
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid invite code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Join a Project</h2>
        <p className="text-gray-400 text-sm mb-6">Enter the invite code shared by your team lead</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Invite code</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="e.g. f81f9646"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg py-2.5 text-sm font-semibold transition-colors"
            >
              {loading ? "Joining..." : "Join Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}