import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let start = 0
        const step = target / 60
        const timer = setInterval(() => {
          start += step
          if (start >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

function Logo({ size = 40, fontSize = 17 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{
        width: size, height: size, borderRadius: Math.round(size * 0.3),
        background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 22px rgba(99,102,241,0.55), 0 2px 8px rgba(0,0,0,0.4)",
        flexShrink: 0, position: "relative", overflow: "hidden"
      }}>
        {/* IQ mark inside logo */}
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="9" r="5.5" stroke="white" strokeWidth="2" />
          <line x1="13" y1="13" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="15" y1="4" x2="15" y2="8" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13.5" y1="6" x2="16.5" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize,
        letterSpacing: "-0.03em", color: "white",
        background: "linear-gradient(135deg, #fff 40%, #a5b4fc)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
      }}>
        Contrib<span style={{ background: "linear-gradient(135deg,#60a5fa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IQ</span>
      </span>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", h)
    return () => window.removeEventListener("mousemove", h)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#050810", minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Syne:wght@700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .syne { font-family: 'Syne', sans-serif; }

        .glow-cursor {
          position: fixed; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%);
          pointer-events: none; transform: translate(-50%,-50%);
          transition: left 0.6s ease, top 0.6s ease; z-index: 0;
        }

        /* Navbar */
        .lnav {
          position: sticky; top: 0; z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 56px; height: 80px;
          background: rgba(5,8,16,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .lnav-btns { display: flex; gap: 12px; align-items: center; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .hero-glow {
          background: radial-gradient(ellipse 90% 60% at 50% -5%, rgba(99,102,241,0.14), transparent);
        }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #93c5fd 45%, #a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          box-shadow: 0 0 28px rgba(99,102,241,0.4), 0 4px 16px rgba(0,0,0,0.3);
          transition: all 0.25s ease; border: none; cursor: pointer; color: white;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 48px rgba(99,102,241,0.6), 0 8px 24px rgba(0,0,0,0.3); }
        .btn-ghost {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.25s ease; cursor: pointer; color: #d1d5db;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }
        .badge {
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc;
        }
        .card {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .card:hover { transform: translateY(-5px); border-color: rgba(99,102,241,0.35); box-shadow: 0 12px 40px rgba(99,102,241,0.1); }
        .mockup {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .step-num {
          font-family: 'Syne', sans-serif;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .stat-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); }
        .cta-card {
          background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.14) 0%, rgba(5,8,16,0.8) 70%);
          border: 1px solid rgba(99,102,241,0.2);
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 5s ease-in-out infinite; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .fu1{animation:fadeUp 0.7s 0.05s ease both}
        .fu2{animation:fadeUp 0.7s 0.15s ease both}
        .fu3{animation:fadeUp 0.7s 0.25s ease both}
        .fu4{animation:fadeUp 0.7s 0.35s ease both}
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.05); margin: 0; }
      `}</style>

      <div className="glow-cursor" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* ── NAVBAR ── */}
      <nav className="lnav">
        <Logo size={44} fontSize={20} />
        <div className="lnav-btns">
          <button onClick={() => navigate("/login")} className="btn-ghost" style={{ padding: "11px 26px", borderRadius: 11, fontSize: 15, fontWeight: 500 }}>
            Sign in
          </button>
          <button onClick={() => navigate("/register")} className="btn-primary" style={{ padding: "11px 28px", borderRadius: 11, fontSize: 15, fontWeight: 700 }}>
            Get started free →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="grid-bg hero-glow" style={{ position: "relative", zIndex: 10, padding: "90px 5% 70px", textAlign: "center" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div className="badge fu1" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 999, fontSize: 12, fontWeight: 500, marginBottom: 30, letterSpacing: 0.3 }}>
            <span className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
            Built for students · Completely free
          </div>
          <h1 className="syne fu2" style={{ fontSize: "clamp(2.8rem,7vw,5.2rem)", fontWeight: 900, lineHeight: 1.03, marginBottom: 24, letterSpacing: -2 }}>
            <span className="gradient-text">Stop letting one person</span>
            <br />
            <span style={{ color: "white" }}>carry the whole team.</span>
          </h1>
          <p className="fu3" style={{ color: "#9ca3af", fontSize: "clamp(1rem,2vw,1.2rem)", maxWidth: 580, margin: "0 auto 38px", lineHeight: 1.75 }}>
            Track GitHub commits, log hours, score contributions fairly —
            then export a PDF your professor will actually respect.
          </p>
          <div className="fu4" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
            <button onClick={() => navigate("/register")} className="btn-primary" style={{ padding: "15px 40px", borderRadius: 13, fontSize: 16, fontWeight: 700 }}>
              Start tracking free →
            </button>
            <button onClick={() => navigate("/login")} className="btn-ghost" style={{ padding: "15px 40px", borderRadius: 13, fontSize: 16, fontWeight: 500 }}>
              Sign in
            </button>
          </div>
          <p style={{ color: "#374151", fontSize: 12 }}>No credit card · No setup · Forever free</p>
        </div>

        {/* Dashboard mockup */}
        <div className="float mockup" style={{ maxWidth: 700, margin: "56px auto 0", borderRadius: 22, padding: 22, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#ef4444","#eab308","#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.5 }} />)}
            </div>
            <span style={{ color: "#4b5563", fontSize: 18, fontFamily: "monospace", marginLeft: 4 }}>Final Year Project · Contribution Scores</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24, marginBottom: 12 }}>
            {[
              { name: "Leena M.", score: 100, color: "#6366f1", commits: 9, badge: "🥇" },
              { name: "Arjun S.", score: 82, color: "#8b5cf6", commits: 7, badge: "🥈" },
              { name: "Rahul D.", score: 58, color: "#eab308", commits: 4, badge: "🥉" },
              { name: "Priya K.", score: 20, color: "#ef4444", commits: 1, badge: "👤" },
            ].map(m => (
              <div key={m.name} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{m.badge}</span>
                    <span style={{ color: "#e5e7eb", fontSize: 17, fontWeight: 500 }}>{m.name}</span>
                  </div>
                  <span style={{ color: m.color, fontWeight: 800, fontSize: 16 }}>{m.score}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 999, height: 4 }}>
                  <div style={{ width: `${m.score}%`, height: 4, borderRadius: 999, background: m.color }} />
                </div>
                <div style={{ color: "#4b5563", fontSize: 12, marginTop: 6 }}>{m.commits} commits matched</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚠️</span>
            <span style={{ color: "rgba(253,224,71,0.7)", fontSize: 12 }}>Workload imbalance detected — Priya K. contributed only 20% of total work</span>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <hr className="divider" />
      <section style={{ position: "relative", zIndex: 10, padding: "56px 5%" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
          {[
            { value: 100, suffix: "%", label: "Free forever" },
            { value: 3, suffix: " ML", label: "Components" },
            { value: 60, suffix: "s", label: "Setup time" },
            { value: 1, suffix: " click", label: "PDF export" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderRadius: 16, padding: "26px 20px", textAlign: "center" }}>
              <div className="syne" style={{ fontSize: 34, fontWeight: 800, color: "white", marginBottom: 6 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <hr className="divider" />
      <section style={{ position: "relative", zIndex: 10, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#818cf8", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Everything you need</p>
            <h2 className="syne" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "white", lineHeight: 1.15 }}>
              Built for how students<br />actually work
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 16 }}>
            {[
              { icon: "⚡", title: "Real-time ML scoring", desc: "Weighted model scores code, design, docs, research differently. Normalized 0–100 per project. Every decision is explainable." },
              { icon: "🔗", title: "GitHub auto-sync", desc: "Paste a repo URL. Commits match to members by GitHub username — no email digging. Works on any public repo." },
              { icon: "⚠️", title: "Imbalance detection", desc: "Standard deviation analysis flags when workload is unfair. Warns the team before the deadline hits." },
              { icon: "📄", title: "PDF report export", desc: "One click. Professional report with scores, task log, and commit history. Show it to your professor with confidence." },
              { icon: "🎯", title: "Invite links", desc: "Share on WhatsApp. Teammates join with one tap — no email chains, no manual setup, roles assigned automatically." },
              { icon: "🔒", title: "JWT authentication", desc: "Secure login with hashed passwords, JWT tokens, and role-based access. Admin controls the team." },
            ].map(f => (
              <div key={f.title} className="card" style={{ borderRadius: 18, padding: "26px" }}>
                <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <hr className="divider" />
      <section style={{ position: "relative", zIndex: 10, padding: "80px 5%" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ color: "#818cf8", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Simple by design</p>
            <h2 className="syne" style={{ fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "white", lineHeight: 1.15 }}>
              Up and running in 4 steps
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
            {[
              { num: "01", title: "Create a project", desc: "Set name, deadline, and get a shareable invite link in seconds." },
              { num: "02", title: "Invite your team", desc: "Share the link. Teammates join with one click — roles assigned automatically." },
              { num: "03", title: "Sync GitHub repo", desc: "Paste the repo URL. Commits match to members by username instantly." },
              { num: "04", title: "Get fair scores", desc: "Scores update in real time. Download a PDF report when you're done." },
            ].map(s => (
              <div key={s.num} className="card" style={{ borderRadius: 18, padding: "30px 24px" }}>
                <div className="step-num syne" style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
                <h3 style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px 5%" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div className="cta-card" style={{ borderRadius: 30, padding: "72px 56px", textAlign: "center" }}>
            <h2 className="syne" style={{ fontSize: "clamp(1.8rem,4vw,2.9rem)", fontWeight: 900, color: "white", lineHeight: 1.15, marginBottom: 16 }}>
              Fair grades start<br />with fair tracking.
            </h2>
            <p style={{ color: "#6b7280", fontSize: 16, marginBottom: 36 }}>
              Create your first project in 60 seconds. Free forever.
            </p>
            <button onClick={() => navigate("/register")} className="btn-primary" style={{ padding: "16px 48px", borderRadius: 13, fontSize: 16, fontWeight: 700 }}>
              Get started — it's free →
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <hr className="divider" />
      <footer style={{ position: "relative", zIndex: 10, padding: "32px 56px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo size={28} fontSize={15} />
        <div style={{ display: "flex", gap: 24 }}>
          <button onClick={() => navigate("/register")} style={{ color: "#374151", fontSize: 13, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Register</button>
          <button onClick={() => navigate("/login")} style={{ color: "#374151", fontSize: 13, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Sign in</button>
        </div>
      </footer>
    </div>
  )
}
