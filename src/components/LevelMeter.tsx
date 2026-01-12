interface Props {
  decibel: number
}

function getGradientColor(db: number): string {
  if (db < 40) return 'bg-green-500'
  if (db < 60) return 'bg-yellow-500'
  if (db < 80) return 'bg-orange-500'
  return 'bg-red-500'
}

export function LevelMeter({ decibel }: Props) {
  const percentage = Math.min(100, (decibel / 120) * 100)
  const colorClass = getGradientColor(decibel)

  return (
    <div className="px-6 py-4">
      <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-100 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>40</span>
        <span>60</span>
        <span>80</span>
        <span>120</span>
      </div>
    </div>
  )
}
