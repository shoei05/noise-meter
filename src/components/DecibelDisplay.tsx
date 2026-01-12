interface Props {
  recentStats: {
    max: number
    min: number
    avg: number
  }
}

function getDecibelColor(db: number): string {
  if (db < 40) return 'text-green-500'
  if (db < 60) return 'text-yellow-500'
  if (db < 80) return 'text-orange-500'
  return 'text-red-500'
}

function getDecibelLabel(db: number): string {
  if (db < 40) return '静か'
  if (db < 60) return '普通'
  if (db < 80) return 'やや大きい'
  return 'うるさい'
}

export function DecibelDisplay({ recentStats }: Props) {
  const { avg, min, max } = recentStats
  const colorClass = getDecibelColor(avg)
  const label = getDecibelLabel(avg)

  return (
    <div className="text-center py-6">
      {/* 平均値を大きく表示 */}
      <div className={`text-7xl font-bold ${colorClass} transition-colors duration-500`}>
        {avg.toFixed(1)}
      </div>
      <div className="text-xl text-gray-400 mt-1">dB (10秒平均)</div>
      <div className={`text-base mt-2 ${colorClass}`}>{label}</div>

      {/* 最小・最大を小さく表示 */}
      <div className="flex justify-center gap-8 mt-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">最小</div>
          <div className="text-lg font-semibold text-green-400">{min.toFixed(1)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">最大</div>
          <div className="text-lg font-semibold text-red-400">{max.toFixed(1)}</div>
        </div>
      </div>
      <div className="text-xs text-gray-600 mt-2">直近10秒</div>
    </div>
  )
}
