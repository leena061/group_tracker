import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"

export default function JoinProject() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("Joining project...")
  const [error, setError] = useState("")

  useEffect(() => {
    api.post(`/projects/join/${inviteCode}`)
      .then(res => {
        setStatus(`Joined "${res.data.project_name}" successfully!`)
        setTimeout(() => navigate("/dashboard"), 2000)
      })
      .catch(err => {
        setError(err.response?.data?.detail || "Failed to join project")
        setStatus("")
      })
  }, [inviteCode])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-10 text-center max-w-md w-full">
        <div className="text-4xl mb-4">{error ? "❌" : "🔗"}</div>
        <h2 className="text-xl font-bold text-white mb-2">
          {error ? "Couldn't join" : status}
        </h2>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {!error && !status.includes("success") && (
          <p className="text-gray-400 text-sm">Please wait...</p>
        )}
        {(error || status.includes("success")) && (
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  )
}