import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler)

interface Props {
  history: number[]
}

export function RealtimeChart({ history }: Props) {
  const data = {
    labels: history.map((_, i) => i),
    datasets: [
      {
        data: history,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0,
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        min: 0,
        max: 120,
        ticks: {
          color: '#9ca3af',
          stepSize: 30,
        },
        grid: {
          color: '#374151',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  }

  return (
    <div className="px-4 py-4">
      <div className="h-40 bg-gray-800 rounded-lg p-2">
        <Line data={data} options={options} />
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        直近30秒の推移
      </div>
    </div>
  )
}
