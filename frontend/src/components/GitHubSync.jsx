import { useState } from "react"
import api from "../api/axios"

export default function GitHubSync({ projectId, isAdmin, commits, onSynced }) {
  const [repoUrl, setRepoUrl] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const handleSync = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await api.post(`/projects/${projectId}/github/sync`, {
        repo_url: repoUrl,
        token: token || null
      })
      setResult(res.data)
      onSynced()
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.detail || "Sync failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">GitHub Integration</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            {commits.length > 0
              ? `${commits.length} commits synced`
              : "No commits synced yet"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <span>⚙</span>
            {showForm ? "Cancel" : "Sync Repo"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-2xl p-6 mb-4 border border-gray-700">
          <p className="text-gray-400 text-sm mb-4">
            Paste a public GitHub repo URL. For private repos, add a personal access token.
          </p>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSync} className="space-y-3">
            <input
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/username/repo"
            />
            <p className="text-gray-500 text-xs">
              💡 Commits match by email. Members should register with the same email
              used in their Git config — check with{" "}
              <code className="bg-gray-700 px-1 rounded">git config user.email</code>
            </p>
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="GitHub token (optional, for private repos)"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 hover:bg-black border border-gray-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? "Syncing..." : "Sync Commits"}
            </button>
          </form>
        </div>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-4">
          <p className="font-semibold text-sm">✓ Sync complete — {result.repo}</p>
          <p className="text-xs mt-1">
            {result.total_commits} commits found · {result.new_commits} new · {result.matched_to_members} matched to members
          </p>
        </div>
      )}

      {commits.length > 0 && (
        <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Commit</th>
                <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Author</th>
                <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Type</th>
                <th className="text-left px-6 py-3 text-gray-400 text-xs font-medium uppercase">Matched</th>
              </tr>
            </thead>
            <tbody>
              {commits.slice(0, 10).map((c, i) => (
                <tr key={c.sha} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-850"}>
                  <td className="px-6 py-3">
                    <p className="text-white text-sm">{c.message}</p>
                    <p className="text-gray-500 text-xs font-mono">#{c.sha}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-300 text-sm">{c.author_name}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      {c.task_type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {c.matched ? (
                      <span className="text-green-400 text-xs">✓ {c.member_name}</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Unmatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {commits.length > 10 && (
            <p className="text-center text-gray-500 text-xs py-3">
              Showing 10 of {commits.length} commits
            </p>
          )}
        </div>
      )}
    </div>
  )
}