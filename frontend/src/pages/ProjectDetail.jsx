import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import ScoreChart from "../components/ScoreChart"
import ScoreCard from "../components/ScoreCard"
import GitHubSync from "../components/GitHubSync"

const TASK_TYPES = ["code", "design", "docs", "research"]

const TYPE_COLORS = {
  code: "bg-blue-500/20 text-blue-400",
  design: "bg-purple-500/20 text-purple-400",
  docs: "bg-yellow-500/20 text-yellow-400",
  research: "bg-green-500/20 text-green-400",
}

function MemberMenu({ onRemove }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative ml-1">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-white px-1 py-0.5 rounded transition-colors text-lg leading-none"
        title="Options"
      >
        ⋯
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-gray-700 border border-gray-600 rounded-lg shadow-xl w-36 py-1">
            <button
              onClick={() => { onRemove(); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 transition-colors"
            >
              Remove member
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [scores, setScores] = useState([])
  const [imbalance, setImbalance] = useState(null)
  const [commits, setCommits] = useState([])       // ← added
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "",
    description: "",
    task_type: "code",
    hours: ""
  })

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/members`),
      api.get(`/projects/${projectId}/tasks`),
      api.get(`/projects/${projectId}/scores`)
    ]).then(([projRes, membersRes, tasksRes, scoresRes]) => {
      setProject(projRes.data)
      setMembers(membersRes.data)
      setTasks(tasksRes.data)
      setScores(scoresRes.data.scores)
      setImbalance(scoresRes.data.imbalance)
      api.get(`/projects/${projectId}/github/commits`)  // ← added
        .then(res => setCommits(res.data))
        .catch(() => {})
    }).catch(() => navigate("/dashboard"))
      .finally(() => setLoading(false))
  }, [projectId])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the project?")) return
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`)
      setMembers(members.filter(m => m.id !== userId))
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove member")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, {
        ...form,
        hours: parseFloat(form.hours)
      })
      setTasks([...tasks, res.data])
      setForm({ title: "", description: "", task_type: "code", hours: "" })
      setShowForm(false)
      const scoresRes = await api.get(`/projects/${projectId}/scores`)
      setScores(scoresRes.data.scores)
      setImbalance(scoresRes.data.imbalance)
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to log task")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Loading project...</p>
    </div>
  )

  const isAdmin = members.find(m => m.id === user?.id)?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Dashboard
          </button>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-bold text-white">{project?.name}</h1>
        </div>
        {project?.deadline && (
          <span className="text-gray-400 text-sm">📅 Due: {project.deadline}</span>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Members section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Team Members</h2>
          <div className="flex flex-wrap gap-3">
            {members.map(m => (
              <div key={m.id} className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-700 relative">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  {m.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{m.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{m.role}</p>
                </div>
                {isAdmin && m.id !== user?.id && (
                  <MemberMenu onRemove={() => handleRemoveMember(m.id)} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scores section */}
        {scores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Contribution Scores</h2>

            {imbalance?.imbalanced && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl p-4 mb-4 flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-sm">Workload imbalance detected</p>
                  <p className="text-xs mt-1 text-yellow-300">
                    One member is contributing significantly more than others.
                    Consider redistributing tasks before the deadline.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {scores.map((member, i) => (
                <ScoreCard key={member.user_id} member={member} rank={i} />
              ))}
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-sm">Score Comparison</h3>
              <ScoreChart scores={scores} />
            </div>
          </div>
        )}

        {/* GitHub section ← added */}
        <GitHubSync
          projectId={projectId}
          isAdmin={isAdmin}
          commits={commits}
          onSynced={() => {
            api.get(`/projects/${projectId}/github/commits`).then(r => setCommits(r.data))
            api.get(`/projects/${projectId}/scores`).then(r => {
              setScores(r.data.scores)
              setImbalance(r.data.imbalance)
            })
          }}
        />

        {/* Log task button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Contributions</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {showForm ? "Cancel" : "+ Log Work"}
          </button>
        </div>

        {/* Log task form */}
        {showForm && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Log your contribution</h3>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-1">What did you work on?</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Built login page"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Hours spent</label>
                  <input
                    name="hours"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={form.hours}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 2.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Type of work</label>
                  <select
                    name="task_type"
                    value={form.task_type}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TASK_TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Description (optional)</label>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any extra details"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {submitting ? "Logging..." : "Log Contribution"}
              </button>
            </form>
          </div>
        )}

        {/* Tasks table */}
        {tasks.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-10 text-center border border-gray-700">
            <div className="text-3xl mb-3">📝</div>
            <p className="text-gray-400 text-sm">No contributions logged yet</p>
            <p className="text-gray-500 text-xs mt-1">Click "+ Log Work" to add your first contribution</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Member</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Task</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Hours</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr key={task.id} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-750"}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                          {task.member_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white text-sm">{task.member_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{task.title}</p>
                      {task.description && (
                        <p className="text-gray-500 text-xs mt-0.5">{task.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[task.task_type]}`}>
                        {task.task_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm">{task.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}