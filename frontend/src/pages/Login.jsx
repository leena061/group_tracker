import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../api/axios"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
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
      const res = await api.post("/auth/login", form)
      login(res.data.access_token, { id: res.data.user_id, name: res.data.name })
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed")
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
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .feature-card { display: flex; align-items: center; gap: 18px; padding: 18px 20px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; transition: border-color 0.2s; }
        .feature-card:hover { border-color: rgba(59,130,246,0.2); }
      `}</style>

      {/* Left panel */}
      <div className="grid-bg" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", borderRight: "1px solid rgba(255,255,255,0.05)", background: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(59,130,246,0.07), transparent)" }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, boxShadow: "0 0 16px rgba(59,130,246,0.4)", cursor: "pointer" }} onClick={() => navigate("/")}>C</div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>ContribIQ</span>
          </div>

          <h2 className="syne" style={{ fontSize: 48, fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: 24 }}>
            Track contributions.<br />Get fair grades.
          </h2>
          <p style={{ color: "#6b7280", fontSize: 16, lineHeight: 1.8, marginBottom: 52, maxWidth: 460 }}>
            Log tasks, sync GitHub commits, and generate a PDF report that shows exactly who did what — automatically.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "⚡", text: "ML-powered contribution scoring", sub: "Fair, automatic scores based on real work" },
              { icon: "🔗", text: "GitHub commit auto-matching", sub: "Commits linked to members instantly" },
              { icon: "📄", text: "One-click PDF report export", sub: "Share proof of work with professors" },
            ].map(f => (
              <div key={f.text} className="feature-card">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ color: "#e5e7eb", fontSize: 14, fontWeight: 600 }}>{f.text}</div>
                  <div style={{ color: "#4b5563", fontSize: 13, marginTop: 2 }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ width: 500, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 52px" }}>
        <div className="fade-up">
          <h1 className="syne" style={{ fontSize: 30, fontWeight: 800, color: "white", marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 36 }}>Sign in to your account</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 9, padding: "10px 14px", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>Email address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" placeholder="arjun@college.com" />
            </div>
            <div>
              <label style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 8 }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <p style={{ color: "#4b5563", fontSize: 14, textAlign: "center", marginTop: 28 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}