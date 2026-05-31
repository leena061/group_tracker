import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", github_username: "", github_email: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/register", form)
      login(res.data.access_token, { id: res.data.user_id, name: res.data.name })
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#060912", display: "flex", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .syne { font-family: 'Syne', sans-serif; }
        .input-field { width: 100%; border-radius: 10px; padding: 13px 16px; font-size: 15px; color: white; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s ease; font-family: inherit; color-scheme: dark; }
        .input-field:focus { outline: none; border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.08); }
        .input-field::placeholder { color: #4b5563; }
        .btn-primary { width: 100%; background: linear-gradient(135deg,#3b82f6,#2563eb); color: white; border: none; border-radius: 10px; padding: 14px; font-size: 15px; font-weight: 600; cursor: pointer; box-shadow: 0 0 20px rgba(59,130,246,0.25); transition: all 0.2s ease; font-family: inherit; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 35px rgba(59,130,246,0.4); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .grid-bg { background-image: linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px), linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px); background-size: 50px 50px; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 4px 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* Left panel */}
      <div className="grid-bg" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", borderRight: "1px solid rgba(255,255,255,0.05)", background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(59,130,246,0.07), transparent)" }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, boxShadow: "0 0 16px rgba(59,130,246,0.4)", cursor: "pointer" }} onClick={() => navigate("/")}>G</div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>GroupTracker</span>
          </div>

          <h2 className="syne" style={{ fontSize: 48, fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: 24 }}>
            One person doing<br />all the work?
          </h2>
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.8, marginBottom: 52, maxWidth: 460 }}>
            GroupTracker makes every contribution visible. Create a project, invite your team, and get fair scores automatically.
          </p>

          {/* Score mockup — bigger */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "24px 28px" }}>
            <p style={{ color: "#6b7280", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>Live contribution scores</p>
            {[
              { name: "Leena M.", score: 100, color: "#3b82f6" },
              { name: "Arjun S.", score: 82, color: "#8b5cf6" },
              { name: "Priya K.", score: 45, color: "#eab308" },
            ].map(m => (
              <div key={m.name} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#d1d5db", fontSize: 14 }}>{m.name}</span>
                  <span style={{ color: m.color, fontSize: 14, fontWeight: 700 }}>{m.score}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 999, height: 5 }}>
                  <div style={{ width: `${m.score}%`, height: 5, borderRadius: 999, background: m.color, boxShadow: `0 0 8px ${m.color}60` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width: 520, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 52px", overflowY: "auto" }}>
        <div className="fade-up">
          <h1 className="syne" style={{ fontSize: 30, fontWeight: 800, color: "white", marginBottom: 8 }}>Create account</h1>
          <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 28 }}>Start tracking your group projects fairly</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 9, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 7 }}>Full name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required className="input-field" placeholder="Arjun Sharma" />
            </div>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 7 }}>Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="arjun@college.com" />
            </div>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 7 }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="input-field" placeholder="••••••••" />
            </div>

            <hr className="divider" />
            <p style={{ color: "#4b5563", fontSize: 12, margin: "0 0 2px" }}>GitHub details — optional but recommended for commit tracking</p>

            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 7 }}>GitHub username</label>
              <input name="github_username" type="text" value={form.github_username} onChange={handleChange} className="input-field" placeholder="e.g. leena061" />
            </div>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 7 }}>
                GitHub email <span style={{ color: "#374151" }}>(fallback)</span>
              </label>
              <input name="github_email" type="email" value={form.github_email} onChange={handleChange} className="input-field" placeholder="email used for Git commits" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6 }}>
              {loading ? "Creating account..." : "Create account →"}
            </button>
          </form>

          <p style={{ color: "#4b5563", fontSize: 14, textAlign: "center", marginTop: 20 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}