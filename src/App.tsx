import { useAudioMeter } from './hooks/useAudioMeter'
import { DecibelDisplay } from './components/DecibelDisplay'
import { LevelMeter } from './components/LevelMeter'
import { RealtimeChart } from './components/RealtimeChart'

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function App() {
  const { decibel, isActive, error, history, stats, recentStats, start, stop, reset } = useAudioMeter()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* ヘッダー */}
      <header className="text-center py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">騒音計</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col">
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {!isActive ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="text-6xl mb-4">🎤</div>
            <p className="text-gray-400 text-center mb-8">
              マイクを使用して周囲の騒音レベルを測定します
            </p>
            <button
              onClick={start}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-xl font-semibold transition-colors"
            >
              測定開始
            </button>
          </div>
        ) : (
          <>
            <DecibelDisplay recentStats={recentStats} />
            <LevelMeter decibel={decibel} />
            <div className="text-center text-gray-400 text-sm py-2">
              測定時間: {formatDuration(stats.duration)}
            </div>
            <RealtimeChart history={history} />

            {/* ボタン */}
            <div className="flex gap-4 px-4 py-6 mt-auto">
              <button
                onClick={reset}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                リセット
              </button>
              <button
                onClick={stop}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
              >
                停止
              </button>
            </div>
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center py-2 text-xs text-gray-500 border-t border-gray-700">
        ※ 測定値は参考値です
      </footer>
    </div>
  )
}

export default App
