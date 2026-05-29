const TYPE_COLORS = {
  code: "bg-blue-500/20 text-blue-400",
  design: "bg-purple-500/20 text-purple-400",
  docs: "bg-yellow-500/20 text-yellow-400",
  research: "bg-green-500/20 text-green-400",
}

export default function ScoreCard({ member, rank }) {
  const scoreColor =
    member.score >= 70 ? "text-blue-400" :
    member.score >= 40 ? "text-yellow-400" :
    "text-red-400"

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{medals[rank] || "👤"}</span>
          <div>
            <p className="text-white font-semibold text-sm">{member.name}</p>
            <p className="text-gray-500 text-xs">{member.total_hours}h logged</p>
          </div>
        </div>
        <span className={`text-2xl font-bold ${scoreColor}`}>
          {member.score}
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${
            member.score >= 70 ? "bg-blue-500" :
            member.score >= 40 ? "bg-yellow-500" :
            "bg-red-500"
          }`}
          style={{ width: `${member.score}%` }}
        />
      </div>

      {/* Breakdown badges */}
      {Object.keys(member.breakdown).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {Object.entries(member.breakdown).map(([type, score]) => (
            <span key={type} className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[type]}`}>
              {type}: {score}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}