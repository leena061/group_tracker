import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import CreateProjectModal from "../components/CreateProjectModal"
import JoinProjectModal from "../components/JoinProjectModal"

function Logo({ size = 42, fontSize = 19 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: size, height: size, borderRadius: Math.round(size * 0.3),
        background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 22px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.4)",
        flexShrink: 0,
      }}>
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="9" r="5.5" stroke="white" strokeWidth="2" />
          <line x1="13" y1="13" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="4" x2="15" y2="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.5" y1="6" x2="16.5" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize,
        letterSpacing: "-0.03em",
        background: "linear-gradient(135deg, #fff 40%, #a5b4fc)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
      }}>
        ContribIQ
      </span>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    api.get("/projects/")
      .then(res => setProjects(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => { logout(); navigate("/login") }
  const handleProjectCreated = (p) => setProjects(prev => [...prev, p])

  const copyToClipboard = (text, id, type) => {
    navigator.clipboard.writeText(text)
    setCopied(`${id}-${type}`)
    setTimeout(() => setCopied(null), 2000)
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const deadlineColor = (d) => {
    if (d === null) return "#9ca3af"
    if (d < 0)  return "#fca5a5"
    if (d <= 3) return "#fdba74"
    if (d <= 7) return "#fde68a"
    return "#86efac"
  }
  const deadlineBg = (d) => {
    if (d === null) return "rgba(107,114,128,0.15)"
    if (d < 0)  return "rgba(239,68,68,0.15)"
    if (d <= 3) return "rgba(249,115,22,0.15)"
    if (d <= 7) return "rgba(234,179,8,0.15)"
    return "rgba(34,197,94,0.15)"
  }
  const deadlineBorder = (d) => {
    if (d === null) return "rgba(107,114,128,0.25)"
    if (d < 0)  return "rgba(239,68,68,0.3)"
    if (d <= 3) return "rgba(249,115,22,0.3)"
    if (d <= 7) return "rgba(234,179,8,0.3)"
    return "rgba(34,197,94,0.3)"
  }
  const deadlineLabel = (deadline, d) => {
    if (d === null) return deadline
    if (d < 0)  return `Overdue by ${Math.abs(d)}d`
    if (d === 0) return "Due today!"
    if (d <= 7) return `${d} days left`
    return `Due ${deadline}`
  }

  // Each card gets a unique color theme: [gradient, bg tint, border tint, glow]
  const cardThemes = [
    { g: ["#6366f1","#8b5cf6"], bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.25)", glow: "rgba(99,102,241,0.12)" },
    { g: ["#06b6d4","#3b82f6"], bg: "rgba(6,182,212,0.07)",  border: "rgba(6,182,212,0.25)",  glow: "rgba(6,182,212,0.12)" },
    { g: ["#ec4899","#8b5cf6"], bg: "rgba(236,72,153,0.07)", border: "rgba(236,72,153,0.25)", glow: "rgba(236,72,153,0.12)" },
    { g: ["#f97316","#ef4444"], bg: "rgba(249,115,22,0.07)", border: "rgba(249,115,22,0.25)", glow: "rgba(249,115,22,0.12)" },
    { g: ["#10b981","#06b6d4"], bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.25)", glow: "rgba(16,185,129,0.12)" },
    { g: ["#eab308","#f97316"], bg: "rgba(234,179,8,0.07)",  border: "rgba(234,179,8,0.25)",  glow: "rgba(234,179,8,0.12)" },
  ]

  const overdueCount  = projects.filter(p => { const d = getDaysLeft(p.deadline); return d !== null && d < 0 }).length
  const dueWeekCount  = projects.filter(p => { const d = getDaysLeft(p.deadline); return d !== null && d >= 0 && d <= 7 }).length
  const onTrackCount  = projects.filter(p => { const d = getDaysLeft(p.deadline); return d === null || d > 7 }).length

  return (
    <div style={{ minHeight: "100vh", background: "#060912", color: "white", fontFamily: "'DM Sans', sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bg-canvas {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 15% 10%, rgba(99,102,241,0.11) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 80%, rgba(139,92,246,0.09) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 55% 35%, rgba(6,182,212,0.05) 0%, transparent 55%),
            #060912;
        }
        .grid-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 95% 95% at 50% 50%, black 20%, transparent 100%);
        }
        .blob {
          position: fixed; border-radius: 50%; filter: blur(130px);
          pointer-events: none; z-index: 0;
          animation: blobDrift 20s ease-in-out infinite alternate;
        }
        @keyframes blobDrift {
          0%   { transform: translate(0,0) scale(1); }
          50%  { transform: translate(30px,-20px) scale(1.06); }
          100% { transform: translate(-20px,30px) scale(0.96); }
        }
        .page-content { position: relative; z-index: 1; }

        /* Navbar */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 56px; height: 80px;
          background: rgba(6,9,18,0.88); backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .user-chip {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          padding: 8px 20px 8px 8px; border-radius: 999px;
          transition: border-color 0.2s;
        }
        .user-chip:hover { border-color: rgba(255,255,255,0.16); }
        .user-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 700;
        }
        .btn-logout {
          padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 500;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-logout:hover { background: rgba(255,255,255,0.09); color: white; border-color: rgba(255,255,255,0.18); }

        /* Hero */
        .hero { padding: 60px 56px 52px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .hero-inner { max-width: 1440px; margin: 0 auto; }
        .hero-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 32px; flex-wrap: wrap; margin-bottom: 40px;
        }
        .hero-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #818cf8; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .hero-label::before {
          content: ''; display: block; width: 22px; height: 2px;
          background: #818cf8; border-radius: 2px;
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.4rem);
          font-weight: 800; line-height: 1.0; letter-spacing: -0.035em;
          background: linear-gradient(135deg, #ffffff 30%, rgba(165,180,252,0.7));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 14px;
        }
        .hero-sub { font-size: 16px; color: #6b7280; line-height: 1.55; }
        .btn-group { display: flex; gap: 12px; align-items: center; padding-top: 8px; }
        .btn-primary {
          padding: 14px 30px; border-radius: 12px; font-size: 15px; font-weight: 600;
          background: linear-gradient(135deg,#6366f1,#4f46e5);
          box-shadow: 0 0 28px rgba(99,102,241,0.4), 0 4px 16px rgba(0,0,0,0.3);
          color: white; border: none; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(99,102,241,0.6), 0 8px 24px rgba(0,0,0,0.4); }
        .btn-secondary {
          padding: 14px 30px; border-radius: 12px; font-size: 15px; font-weight: 500;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          color: #e5e7eb; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.10); border-color: rgba(255,255,255,0.22); color: white; }

        /* Stats */
        .stats-row { display: flex; gap: 16px; flex-wrap: wrap; }
        .stat-card {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 18px 26px; min-width: 165px;
          transition: all 0.2s;
        }
        .stat-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
        .stat-icon { font-size: 28px; line-height: 1; }
        .stat-num { font-size: 30px; font-weight: 800; line-height: 1; font-family: 'Syne', sans-serif; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 3px; }

        /* Section header */
        .section-hdr {
          max-width: 1440px; margin: 0 auto 24px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .section-title { font-size: 12px; font-weight: 700; color: #4b5563; letter-spacing: 0.1em; text-transform: uppercase; }

        /* Project grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px; max-width: 1440px; margin: 0 auto;
        }

        /* Project card */
        .pcard {
          border-radius: 20px; padding: 28px;
          cursor: pointer; position: relative; overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
        }
        .pcard:hover { transform: translateY(-5px); }
        .pcard-shine {
          position: absolute; inset: 0; opacity: 0; transition: opacity 0.4s;
          background: radial-gradient(500px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.04), transparent 65%);
          pointer-events: none;
        }
        .pcard:hover .pcard-shine { opacity: 1; }
        .pcard-stripe { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 20px 20px 0 0; }
        .pcard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .pcard-avatar-wrap { display: flex; align-items: center; gap: 14px; }
        .pcard-avatar {
          width: 50px; height: 50px; border-radius: 15px;
          display: flex; align-items: center; justify-content: center;
          font-size: 21px; font-weight: 800; flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }
        .pcard-name { font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.02em; line-height: 1.2; }
        .pcard-meta { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 4px; }
        .active-badge {
          font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 999px;
          background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25);
          flex-shrink: 0;
        }
        .pcard-desc { font-size: 14px; line-height: 1.7; margin-bottom: 20px; min-height: 48px; }
        .deadline-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 7px 14px; border-radius: 10px; margin-bottom: 20px;
          font-size: 13px; font-weight: 600;
        }
        .pcard-footer {
          border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;
          display: flex; justify-content: space-between; align-items: center; gap: 8px;
        }
        .invite-code {
          font-family: monospace; font-size: 12px;
          background: rgba(0,0,0,0.25); padding: 5px 11px;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          letter-spacing: 0.04em;
        }
        .footer-btns { display: flex; gap: 8px; }
        .copy-btn {
          padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
          background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .copy-btn:hover { background: rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.22); }

        /* Skeleton */
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .skeleton {
          background: linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%; animation: shimmer 1.8s infinite; border-radius: 8px;
        }

        /* Empty */
        .empty-state {
          background: rgba(255,255,255,0.015); border: 2px dashed rgba(255,255,255,0.08);
          border-radius: 24px; padding: 100px 40px; text-align: center;
          max-width: 1440px; margin: 0 auto;
        }

        @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* Background */}
      <div className="bg-canvas" />
      <div className="grid-overlay" />
      <div className="blob" style={{ width: 650, height: 650, background: "rgba(99,102,241,0.07)", top: "3%", left: "-12%", animationDuration: "22s" }} />
      <div className="blob" style={{ width: 520, height: 520, background: "rgba(139,92,246,0.07)", bottom: "8%", right: "-10%", animationDuration: "28s", animationDelay: "-10s" }} />
      <div className="blob" style={{ width: 380, height: 380, background: "rgba(6,182,212,0.04)", top: "50%", left: "42%", animationDuration: "34s", animationDelay: "-16s" }} />

      <div className="page-content">
        {/* Navbar */}
        <nav className="navbar">
          <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <Logo size={44} fontSize={20} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="user-chip">
              <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.2, color: "white" }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.2 }}>{user?.email || "member"}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-top">
              <div>
                <div className="hero-label">Dashboard</div>
                <h1 className="hero-title">Your Projects</h1>
                <p className="hero-sub">
                  {loading
                    ? "Loading your workspace…"
                    : `${projects.length} project${projects.length !== 1 ? "s" : ""} · Welcome back, ${user?.name?.split(" ")[0]}`}
                </p>
              </div>
              <div className="btn-group">
                <button onClick={() => setShowJoinModal(true)} className="btn-secondary">Join Project</button>
                <button onClick={() => setShowModal(true)} className="btn-primary">+ New Project</button>
              </div>
            </div>

            {/* Stats */}
            {!loading && (
              <div className="stats-row">
                {[
                  { icon: "📁", num: projects.length, label: "Total projects", color: "white" },
                  { icon: "⏰", num: dueWeekCount,   label: "Due this week",  color: "#fde68a" },
                  { icon: "🚨", num: overdueCount,   label: "Overdue",        color: "#fca5a5" },
                  { icon: "✅", num: onTrackCount,   label: "On track",       color: "#86efac" },
                ].map((s, i) => (
                  <div key={s.label} className="stat-card fu" style={{ animationDelay: `${i * 0.07}s` }}>
                    <span className="stat-icon">{s.icon}</span>
                    <div>
                      <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <main style={{ padding: "40px 56px 90px" }}>
          <div className="section-hdr">
            <span className="section-title">{loading ? "Loading…" : `All Projects (${projects.length})`}</span>
          </div>

          {loading ? (
            <div className="projects-grid">
              {[1,2,3,4].map(i => (
                <div key={i} style={{ borderRadius: 20, padding: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
                    <div className="skeleton" style={{ width: 50, height: 50, borderRadius: 15, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ height: 18, width: "50%", marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 12, width: "28%" }} />
                    </div>
                  </div>
                  <div className="skeleton" style={{ height: 14, width: "85%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "65%", marginBottom: 24 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <div className="skeleton" style={{ height: 34, width: 100, borderRadius: 8 }} />
                    <div className="skeleton" style={{ height: 34, width: 110, borderRadius: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state fu">
              <div style={{ fontSize: 64, marginBottom: 24 }}>📁</div>
              <h3 style={{ color: "white", fontWeight: 700, fontSize: 24, marginBottom: 12 }}>No projects yet</h3>
              <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.6 }}>
                Create your first project and invite your team — or join one with an invite code.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => setShowJoinModal(true)} className="btn-secondary">Join with code</button>
                <button onClick={() => setShowModal(true)} className="btn-primary">+ Create project</button>
              </div>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p, i) => {
                const dl = getDaysLeft(p.deadline)
                const theme = cardThemes[i % cardThemes.length]
                const [c1, c2] = theme.g
                return (
                  <div
                    key={p.id}
                    className="pcard fu"
                    style={{
                      animationDelay: `${i * 0.07}s`,
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      boxShadow: `0 4px 24px ${theme.glow}, 0 1px 0 rgba(255,255,255,0.04) inset`,
                    }}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    onMouseMove={e => {
                      const r = e.currentTarget.getBoundingClientRect()
                      e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`)
                      e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`)
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 16px 48px ${theme.glow.replace('0.12','0.28')}, 0 0 0 1px ${theme.border}`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = `0 4px 24px ${theme.glow}, 0 1px 0 rgba(255,255,255,0.04) inset`
                    }}
                  >
                    <div className="pcard-shine" />
                    <div className="pcard-stripe" style={{ background: `linear-gradient(90deg,${c1},${c2})` }} />

                    <div className="pcard-header">
                      <div className="pcard-avatar-wrap">
                        <div className="pcard-avatar" style={{ background: `linear-gradient(135deg,${c1},${c2})` }}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="pcard-name">{p.name}</div>
                          <div className="pcard-meta">
                            {p.member_count ? `${p.member_count} member${p.member_count !== 1 ? "s" : ""}` : "Project"}
                          </div>
                        </div>
                      </div>
                      <span className="active-badge">Active</span>
                    </div>

                    <p className="pcard-desc" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {p.description || "No description added."}
                    </p>

                    {p.deadline && (
                      <div className="deadline-pill" style={{ background: deadlineBg(dl), border: `1px solid ${deadlineBorder(dl)}`, color: deadlineColor(dl) }}>
                        <span style={{ fontSize: 14 }}>📅</span>
                        {deadlineLabel(p.deadline, dl)}
                      </div>
                    )}

                    <div className="pcard-footer" onClick={e => e.stopPropagation()}>
                      <span className="invite-code" style={{ color: "rgba(255,255,255,0.3)" }}>#{p.invite_code}</span>
                      <div className="footer-btns">
                        <button
                          className="copy-btn"
                          style={{ color: copied === `${p.id}-code` ? "#4ade80" : "rgba(255,255,255,0.5)" }}
                          onClick={() => copyToClipboard(p.invite_code, p.id, "code")}
                        >
                          {copied === `${p.id}-code` ? "✓ Copied" : "Copy code"}
                        </button>
                        <button
                          className="copy-btn"
                          style={{ color: copied === `${p.id}-link` ? "#4ade80" : c1 }}
                          onClick={() => copyToClipboard(`${window.location.origin}/join/${p.invite_code}`, p.id, "link")}
                        >
                          {copied === `${p.id}-link` ? "✓ Copied" : "📋 Invite link"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>

      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} onCreated={handleProjectCreated} />}
      {showJoinModal && <JoinProjectModal onClose={() => setShowJoinModal(false)} />}
    </div>
  )
}
