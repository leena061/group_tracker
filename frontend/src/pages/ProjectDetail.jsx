import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../api/axios"
import { useAuth } from "../context/AuthContext"
import GitHubSync from "../components/GitHubSync"

const TASK_TYPES = ["code", "design", "docs", "research"]

const TYPE_META = {
  code:     { bg: "#38bdf810", text: "#7dd3fc", border: "#38bdf825", label: "Code",     color: "#38bdf8" },
  design:   { bg: "#a78bfa10", text: "#c4b5fd", border: "#a78bfa25", label: "Design",   color: "#a78bfa" },
  docs:     { bg: "#fbbf2410", text: "#fcd34d", border: "#fbbf2425", label: "Docs",     color: "#fbbf24" },
  research: { bg: "#34d39910", text: "#6ee7b7", border: "#34d39925", label: "Research", color: "#34d399" },
}

const AVATAR_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"]

// ── Deadline ring ──────────────────────────────────────────────────────────
function DeadlineRing({ deadline }) {
  if (!deadline) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const end   = new Date(deadline)
  const total = 30 // assume 30-day sprint window for ring display
  const left  = Math.max(0, Math.ceil((end - today) / 86400000))
  const pct   = Math.min(1, left / total)
  const r = 25, circ = 2 * Math.PI * r
  const color = left <= 3 ? "#ef4444" : left <= 7 ? "#f59e0b" : "#3b82f6"
  return (
    <div className="flex flex-col items-center justify-center gap-1" title={`Due ${deadline}`}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#ffffff08" strokeWidth="4"/>
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round" transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 1s ease" }}/>
        <text x="32" y="30" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="system-ui">{left}</text>
        <text x="32" y="42" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="system-ui">DAYS</text>
      </svg>
      <p className="text-lg text-gray-600 uppercase tracking-wider">left</p>
    </div>
  )
}

// ── Per-member type breakdown bar ──────────────────────────────────────────
function TypeBreakdown({ memberName, tasks }) {
  const mine = tasks.filter(t => t.member_name === memberName)
  if (!mine.length) return <p className="text-gray-700 text-base mt-2">No tasks yet</p>
  const totals = {}
  mine.forEach(t => { totals[t.task_type] = (totals[t.task_type] || 0) + t.hours })
  const total = Object.values(totals).reduce((a,b) => a+b, 0)
  return (
    <div className="mt-3">
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        {Object.entries(totals).map(([type, hrs]) => (
          <div key={type} style={{ width: `${(hrs/total)*100}%`, background: TYPE_META[type]?.color || "#6b7280" }}
            title={`${type}: ${hrs}h`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
        {Object.entries(totals).map(([type, hrs]) => (
          <span key={type} className="text-lg" style={{ color: TYPE_META[type]?.color || "#6b7280" }}>
            {type} {hrs}h
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Activity feed item ─────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return ""
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function ActivityFeed({ tasks, commits, members }) {
  const events = []
  tasks.forEach(t => {
    const mi = members.findIndex(m => m.name === t.member_name)
    events.push({
      key: `task-${t.id}`,
      color: AVATAR_COLORS[mi % AVATAR_COLORS.length],
      initial: t.member_name?.[0]?.toUpperCase(),
      text: <><span className="text-white font-medium">{t.member_name}</span> logged <span style={{ color: TYPE_META[t.task_type]?.color }}>{t.hours}h of {t.task_type}</span> — {t.title}</>,
      time: t.created_at,
      icon: "✦",
    })
  })
  commits.forEach(c => {
    events.push({
      key: `commit-${c.sha}`,
      color: "#6b7280",
      initial: c.author?.[0]?.toUpperCase() || "G",
      text: <><span className="text-white font-medium">{c.author}</span> pushed <span className="text-gray-400 font-mono text-base">#{c.sha?.slice(0,7)}</span> — {c.message}</>,
      time: c.date,
      icon: "⬡",
    })
  })
  events.sort((a,b) => new Date(b.time) - new Date(a.time))
  const shown = events.slice(0, 12)

  return (
    <div className="rounded-xl border border-white/[0.06]" style={{ background: "#0d1020" }}>
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <p className="text-base text-gray-600 uppercase tracking-widest font-semibold">Activity</p>
        <span className="text-lg text-gray-700">{shown.length} events</span>
      </div>
      {shown.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-gray-700 text-lg">No activity yet</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {shown.map(ev => (
            <div key={ev.key} className="flex gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold shrink-0 mt-0.5"
                style={{ background: ev.color + "30", color: ev.color }}>
                {ev.initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-[12px] leading-relaxed">{ev.text}</p>
                {ev.time && <p className="text-gray-700 text-lg mt-0.5">{timeAgo(ev.time)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Commit heatmap (7-day strip per member) ────────────────────────────────
function CommitHeatmap({ commits, members }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0)
    return d
  })
  const commitsByMember = {}
  commits.forEach(c => {
    const name = c.matched_user_name || c.author
    if (!commitsByMember[name]) commitsByMember[name] = []
    commitsByMember[name].push(c)
  })
  const dayLabel = d => ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()]

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: "#0d1020" }}>
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <p className="text-base text-gray-600 uppercase tracking-widest font-semibold">7-Day Commit Activity</p>
      </div>
      <div className="p-5 space-y-4">
        {/* Day labels */}
        <div className="flex items-center gap-2 pl-28">
          {days.map(d => (
            <div key={d.toISOString()} className="w-7 text-center text-lg text-gray-700">{dayLabel(d)}</div>
          ))}
        </div>
        {Object.entries(commitsByMember).map(([name, memberCommits], mi) => {
          const color = AVATAR_COLORS[members.findIndex(m => m.name === name) % AVATAR_COLORS.length] || AVATAR_COLORS[mi % AVATAR_COLORS.length]
          return (
            <div key={name} className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-base font-bold shrink-0"
                style={{ background: color + "30", color }}>
                {name[0]?.toUpperCase()}
              </div>
              <p className="text-gray-400 text-base w-20 truncate shrink-0">{name.split(" ")[0]}</p>
              {days.map(d => {
                const count = memberCommits.filter(c => {
                  const cd = new Date(c.date); cd.setHours(0,0,0,0)
                  return cd.getTime() === d.getTime()
                }).length
                return (
                  <div key={d.toISOString()} className="w-12 h-12 rounded-md flex items-center justify-center text-lg font-semibold transition-all"
                    title={`${count} commit${count !== 1 ? "s" : ""}`}
                    style={{
                      background: count === 0 ? "#ffffff06" : count === 1 ? color + "40" : color + "80",
                      color: count === 0 ? "#374151" : color,
                      border: `1px solid ${count > 0 ? color + "30" : "transparent"}`
                    }}>
                    {count > 0 ? count : "·"}
                  </div>
                )
              })}
            </div>
          )
        })}
        {Object.keys(commitsByMember).length === 0 && (
          <p className="text-gray-700 text-lg text-center py-4">No commits synced yet</p>
        )}
      </div>
    </div>
  )
}

// ── Colored bar chart replacing ScoreChart ─────────────────────────────────
function ColoredScoreChart({ scores, members }) {
  if (!scores.length) return null
  const max = Math.max(...scores.map(s => s.score), 1)
  return (
    <div className="flex items-end justify-around gap-3" style={{ height: 320 }}>
      {scores.map((s, i) => {
        const mi = members.findIndex(m => m.id === s.user_id)
        const color = AVATAR_COLORS[(mi >= 0 ? mi : i) % AVATAR_COLORS.length]
        const pct = s.score / max
        return (
          <div key={s.user_id} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
            <span className="text-base font-bold" style={{ color }}>{s.score}</span>
            <div className="w-full rounded-t-md transition-all"
              style={{ height: `${Math.max(pct * 120, 4)}px`, background: `linear-gradient(to top, ${color}cc, ${color}55)` }} />
            <span className="text-lg text-gray-600 truncate w-full text-center">{s.name?.split(" ")[0]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Score card with type breakdown ─────────────────────────────────────────
function EnhancedScoreCard({ member, rank, tasks, members }) {
  const mi = members.findIndex(m => m.id === member.user_id)
  const color = AVATAR_COLORS[(mi >= 0 ? mi : rank) % AVATAR_COLORS.length]
  const medals = ["🥇","🥈","🥉"]
  return (
    <div className="rounded-xl border border-white/[0.06] p-4" style={{ background: "#0d1020" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center text-base font-bold"
            style={{ background: color + "30", color }}>
            {member.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-lg font-semibold leading-none">{member.name}</p>
            <p className="text-gray-600 text-lg mt-0.5">{member.total_hours?.toFixed(1) || 0}h logged</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {rank < 3 && <span className="text-base">{medals[rank]}</span>}
          <span className="text-xl font-black" style={{ color }}>{member.score}</span>
        </div>
      </div>
      {/* Score bar */}
      <div className="w-full h-1 rounded-full bg-white/[0.05] mt-2 mb-1 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${member.score}%`, background: color }} />
      </div>
      {/* Type breakdown */}
      <TypeBreakdown memberName={member.name} tasks={tasks} />
    </div>
  )
}

// ── Member menu ────────────────────────────────────────────────────────────
function MemberMenu({ onRemove }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative ml-auto">
      <button onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-md flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all text-base">
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-[#161926] border border-white/[0.08] rounded-xl shadow-2xl w-40 py-1">
            <button onClick={() => { onRemove(); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-lg text-red-400/80 hover:text-red-400 hover:bg-white/[0.04] transition-colors">
              Remove member
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { projectId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project,    setProject]    = useState(null)
  const [members,    setMembers]    = useState([])
  const [tasks,      setTasks]      = useState([])
  const [scores,     setScores]     = useState([])
  const [imbalance,  setImbalance]  = useState(null)
  const [commits,    setCommits]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState("")
  const [activeTab,  setActiveTab]  = useState("overview")
  const [form, setForm] = useState({ title: "", description: "", task_type: "code", hours: "" })

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/members`),
      api.get(`/projects/${projectId}/tasks`),
      api.get(`/projects/${projectId}/scores`)
    ]).then(([pR, mR, tR, sR]) => {
      setProject(pR.data); setMembers(mR.data); setTasks(tR.data)
      setScores(sR.data.scores); setImbalance(sR.data.imbalance)
      api.get(`/projects/${projectId}/github/commits`).then(r => setCommits(r.data)).catch(() => {})
    }).catch(() => navigate("/dashboard")).finally(() => setLoading(false))
  }, [projectId])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRemoveMember = async uid => {
    if (!window.confirm("Remove this member?")) return
    try {
      await api.delete(`/projects/${projectId}/members/${uid}`)
      setMembers(members.filter(m => m.id !== uid))
    } catch (err) { alert(err.response?.data?.detail || "Failed") }
  }

  const handleSubmit = async e => {
    e.preventDefault(); setSubmitting(true); setError("")
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, { ...form, hours: parseFloat(form.hours) })
      setTasks([...tasks, res.data])
      setForm({ title: "", description: "", task_type: "code", hours: "" }); setShowForm(false)
      const s = await api.get(`/projects/${projectId}/scores`)
      setScores(s.data.scores); setImbalance(s.data.imbalance)
    } catch (err) { setError(err.response?.data?.detail || "Failed to log task") }
    finally { setSubmitting(false) }
  }

  const downloadReport = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/report`, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement("a"); a.href = url
      a.setAttribute("download", `${project.name}_report.pdf`)
      document.body.appendChild(a); a.click(); a.remove()
    } catch { alert("Failed to generate report") }
  }

  const isAdmin   = members.find(m => m.id === user?.id)?.role === "admin"
  const totalHours = tasks.reduce((s, t) => s + (t.hours || 0), 0)

  const tabs = [
    { id: "overview",      label: "Overview"      },
    { id: "contributions", label: `Contributions (${tasks.length})` },
    { id: "github",        label: `GitHub (${commits.length})`      },
  ]

  if (loading) return (
    <div className="min-h-screen bg-[#0a0c15] flex items-center justify-center">
      <div className="w-14 h-14 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0c15] text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp 0.2s ease both; }
        input:focus, select:focus { outline: none; border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
        input { color-scheme: dark; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="h-14 flex items-center justify-between px-6 border-b border-white/[0.05] sticky top-0 z-30"
        style={{ background: "rgba(10,12,21,0.97)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-gray-300 text-lg transition-colors">
            ← Dashboard
          </button>
          <span className="text-white/10 mx-1">/</span>
          <span className="text-white text-lg font-semibold">{project?.name}</span>
        </div>
        <button onClick={downloadReport}
          className="bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold px-4 py-2 rounded-lg transition-colors">
          ↓ Download Report
        </button>
      </nav>

      {/* ── HERO BAND (full-width) ── */}
      <div className="w-full border-b border-white/[0.05]"
        style={{ background: "linear-gradient(160deg, #0f1228 0%, #0a0c18 60%, #0a0c15 100%)" }}>
        <div className="px-12 py-10">
          {/* Top row: identity + ring + stats */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            {/* Project identity */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
                style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}>
                {project?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white tracking-tight truncate">{project?.name}</h1>
                {project?.description && <p className="text-gray-500 text-lg mt-0.5 truncate">{project.description}</p>}
              </div>
            </div>

            {/* Deadline ring */}
            <DeadlineRing deadline={project?.deadline} />

            {/* Stat chips */}
            <div className="flex items-center gap-2">
              {[
                { v: members.length,            l: "Members" },
                { v: tasks.length,              l: "Tasks"   },
                { v: `${totalHours.toFixed(1)}h`, l: "Logged" },
                { v: commits.length,            l: "Commits" },
              ].map(s => (
                <div key={s.l} className="text-center px-4 py-2.5 rounded-xl border border-white/[0.06]"
                  style={{ background: "#12152b" }}>
                  <p className="text-white font-bold text-lg leading-none">{s.v}</p>
                  <p className="text-gray-600 text-lg uppercase tracking-widest mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-white/[0.05] -mb-[1px]">
            {tabs.map(tab => {
              const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="relative px-5 py-2.5 text-lg font-medium transition-colors"
                  style={{ color: active ? "#fff" : "#6b7280" }}>
                  {tab.label}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-t" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-12 py-10">

        {/* ══ OVERVIEW ══ */}
        {activeTab === "overview" && (
          <div className="fade-up">
            {/* Two-column grid: sidebar + main */}
            <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-6">

              {/* ── LEFT SIDEBAR ── */}
              <div className="space-y-5">

                {/* Team members */}
                <div className="rounded-xl border border-white/[0.06]" style={{ background: "#0d1020" }}>
                  <div className="px-4 py-3 border-b border-white/[0.05]">
                    <p className="text-base text-gray-600 uppercase tracking-widest font-semibold">Team Members</p>
                  </div>
                  <div className="p-3 space-y-1">
                    {members.map((m, i) => (
                      <div key={m.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                        <div className="w-14 h-14 rounded-lg flex items-center justify-center text-base font-bold shrink-0 text-white"
                          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] + "cc" }}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-lg font-medium truncate leading-none">{m.name}</p>
                          <p className="text-gray-600 text-lg capitalize mt-0.5">{m.role}</p>
                        </div>
                        {isAdmin && m.id !== user?.id && <MemberMenu onRemove={() => handleRemoveMember(m.id)} />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick project stats */}
                <div className="rounded-xl border border-white/[0.06]" style={{ background: "#0d1020" }}>
                  <div className="px-4 py-3 border-b border-white/[0.05]">
                    <p className="text-base text-gray-600 uppercase tracking-widest font-semibold">Project Stats</p>
                  </div>
                  <div className="p-4 space-y-3">
                    {[
                      { label: "Total Hours",    value: `${totalHours.toFixed(1)}h` },
                      { label: "Avg Score",      value: scores.length ? Math.round(scores.reduce((a,s)=>a+s.score,0)/scores.length) : "—" },
                      { label: "Top Contributor",value: scores[0]?.name?.split(" ")[0] || "—" },
                      { label: "Commits Synced", value: commits.length },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-gray-600 text-base">{s.label}</span>
                        <span className="text-white text-lg font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity feed */}
                <ActivityFeed tasks={tasks} commits={commits} members={members} />
              </div>

              {/* ── MAIN AREA ── */}
              <div className="space-y-5">

                {/* Imbalance warning */}
                {imbalance?.imbalanced && (
                  <div className="flex gap-3 items-start rounded-xl p-4 border"
                    style={{ background: "#1c150a", borderColor: "#78350f40" }}>
                    <span className="text-amber-500 text-lg mt-0.5 shrink-0">⚠</span>
                    <div>
                      <p className="text-amber-400 text-lg font-semibold">Workload imbalance detected</p>
                      <p className="text-amber-500/50 text-base mt-0.5">One member is contributing significantly more. Consider redistributing tasks.</p>
                    </div>
                  </div>
                )}

                {/* Score cards with type breakdown */}
                {scores.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {scores.map((member, i) => (
                        <EnhancedScoreCard key={member.user_id} member={member} rank={i} tasks={tasks} members={members} />
                      ))}
                    </div>

                    {/* Colored bar chart */}
                    <div className="rounded-xl border border-white/[0.06] p-5" style={{ background: "#0d1020" }}>
                      <p className="text-base text-gray-600 uppercase tracking-widest font-semibold mb-4">Score Comparison</p>
                      <ColoredScoreChart scores={scores} members={members} />
                    </div>
                  </>
                )}

                {scores.length === 0 && (
                  <div className="rounded-xl border border-white/[0.06] p-12 text-center" style={{ background: "#0d1020" }}>
                    <p className="text-gray-500 text-lg">No scores yet — log some work to see contributions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ CONTRIBUTIONS ══ */}
        {activeTab === "contributions" && (
          <div className="fade-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white font-semibold">Logged Work</p>
                <p className="text-gray-600 text-base mt-0.5">{tasks.length} entries · {totalHours.toFixed(1)}h total</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="text-lg font-semibold px-4 py-2 rounded-lg transition-colors"
                style={showForm ? { background: "rgba(255,255,255,0.05)", color: "#9ca3af" } : { background: "#3b82f6", color: "#fff" }}>
                {showForm ? "✕ Cancel" : "+ Log Work"}
              </button>
            </div>

            {showForm && (
              <div className="rounded-xl border border-white/[0.07] p-5 mb-5" style={{ background: "#0d1020" }}>
                {error && (
                  <div className="rounded-lg p-3 mb-4 text-lg border" style={{ background: "#1f0a0a", borderColor: "#7f1d1d50", color: "#f87171" }}>
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 text-base font-medium uppercase tracking-widest block mb-1.5">What did you work on?</label>
                      <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Built login page"
                        className="w-full rounded-lg px-3.5 py-2.5 text-lg text-white border transition-all"
                        style={{ background: "#090b18", borderColor: "rgba(255,255,255,0.08)" }} />
                    </div>
                    <div>
                      <label className="text-gray-500 text-base font-medium uppercase tracking-widest block mb-1.5">Hours spent</label>
                      <input name="hours" type="number" min="0.5" step="0.5" value={form.hours} onChange={handleChange} required placeholder="e.g. 2.5"
                        className="w-full rounded-lg px-3.5 py-2.5 text-lg text-white border transition-all"
                        style={{ background: "#090b18", borderColor: "rgba(255,255,255,0.08)" }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-base font-medium uppercase tracking-widest block mb-2">Type of work</label>
                    <div className="flex gap-2 flex-wrap">
                      {TASK_TYPES.map(t => {
                        const m = TYPE_META[t]; const sel = form.task_type === t
                        return (
                          <button key={t} type="button" onClick={() => setForm({ ...form, task_type: t })}
                            className="px-3.5 py-1.5 rounded-lg text-base font-semibold border transition-all"
                            style={sel ? { background: m.bg, color: m.text, borderColor: m.border }
                              : { background: "transparent", color: "#4b5563", borderColor: "rgba(255,255,255,0.07)" }}>
                            {m.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-base font-medium uppercase tracking-widest block mb-1.5">Description (optional)</label>
                    <input name="description" value={form.description} onChange={handleChange} placeholder="Any extra details"
                      className="w-full rounded-lg px-3.5 py-2.5 text-lg text-white border transition-all"
                      style={{ background: "#090b18", borderColor: "rgba(255,255,255,0.08)" }} />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-lg font-semibold px-5 py-2.5 rounded-lg transition-colors">
                      {submitting ? "Logging..." : "Log Contribution"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {tasks.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] p-14 text-center" style={{ background: "#0d1020" }}>
                <p className="text-gray-500 text-lg">No contributions logged yet</p>
                <p className="text-gray-700 text-base mt-1">Click "+ Log Work" to add your first entry</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: "#0d1020" }}>
                <div className="grid px-5 py-3 border-b border-white/[0.05]"
                  style={{ gridTemplateColumns: "2fr 3fr 1fr 0.8fr" }}>
                  {["Member","Task","Type","Hours"].map(h => (
                    <p key={h} className="text-lg font-semibold text-gray-700 uppercase tracking-widest">{h}</p>
                  ))}
                </div>
                {tasks.map(task => {
                  const mi = members.findIndex(m => m.name === task.member_name)
                  const ac = AVATAR_COLORS[mi % AVATAR_COLORS.length]
                  const tm = TYPE_META[task.task_type] || TYPE_META.code
                  return (
                    <div key={task.id}
                      className="grid px-5 py-3.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors items-center"
                      style={{ gridTemplateColumns: "2fr 3fr 1fr 0.8fr" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-md flex items-center justify-center text-base font-bold shrink-0 text-white"
                          style={{ background: ac + "cc" }}>
                          {task.member_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-white text-lg truncate">{task.member_name}</span>
                      </div>
                      <div className="min-w-0 pr-4">
                        <p className="text-white text-lg truncate">{task.title}</p>
                        {task.description && <p className="text-gray-600 text-base mt-0.5 truncate">{task.description}</p>}
                      </div>
                      <span className="text-base px-2.5 py-1 rounded-md font-medium border w-fit"
                        style={{ background: tm.bg, color: tm.text, borderColor: tm.border }}>
                        {tm.label}
                      </span>
                      <p className="text-gray-300 text-lg font-mono">{task.hours}h</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ GITHUB ══ */}
        {activeTab === "github" && (
          <div className="fade-up space-y-5">
            <CommitHeatmap commits={commits} members={members} />
            <GitHubSync
              projectId={projectId} isAdmin={isAdmin} commits={commits}
              onSynced={() => {
                api.get(`/projects/${projectId}/github/commits`).then(r => setCommits(r.data))
                api.get(`/projects/${projectId}/scores`).then(r => { setScores(r.data.scores); setImbalance(r.data.imbalance) })
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
