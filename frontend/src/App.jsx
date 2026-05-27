import { useState, useEffect } from "react"
import axios from "axios"

function App() {
  const [status, setStatus] = useState("Loading...")

  useEffect(() => {
    axios.get("http://localhost:8000/test")
      .then(res => setStatus(res.data.status))
      .catch(() => setStatus("Cannot reach backend"))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-10 text-center shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-4">
          Group Contribution Tracker
        </h1>
        <p className="text-gray-400 mb-6">Frontend → Backend connection test</p>
        <div className={`text-lg font-semibold ${status === "ok" ? "text-green-400" : "text-red-400"}`}>
          Backend status: {status}
        </div>
      </div>
    </div>
  )
}

export default App