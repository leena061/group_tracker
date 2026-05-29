import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function ScoreChart({ scores }) {
  const labels = scores.map(s => s.name)
  const data = scores.map(s => s.score)

  const backgroundColors = scores.map(s => {
    if (s.score >= 70) return "rgba(59, 130, 246, 0.8)"   // blue - high
    if (s.score >= 40) return "rgba(234, 179, 8, 0.8)"    // yellow - medium
    return "rgba(239, 68, 68, 0.8)"                        // red - low
  })

  const chartData = {
    labels,
    datasets: [{
      label: "Contribution Score",
      data,
      backgroundColor: backgroundColors,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Score: ${ctx.raw}/100`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#9ca3af" }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af" }
      }
    }
  }

  return <Bar data={chartData} options={options} />
}