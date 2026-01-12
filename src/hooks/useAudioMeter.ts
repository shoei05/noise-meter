import { useState, useEffect, useRef, useCallback } from 'react'

interface AudioMeterState {
  decibel: number
  isActive: boolean
  error: string | null
  history: number[]
  stats: {
    max: number
    min: number
    avg: number
    duration: number
  }
  recentStats: {
    max: number
    min: number
    avg: number
  }
}

const HISTORY_LENGTH = 60 // 30秒分（500msごと）
const RECENT_WINDOW_MS = 10000 // 直近10秒

export function useAudioMeter() {
  const [state, setState] = useState<AudioMeterState>({
    decibel: 0,
    isActive: false,
    error: null,
    history: [],
    stats: { max: 0, min: 0, avg: 0, duration: 0 },
    recentStats: { max: 0, min: 0, avg: 0 },
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const measurementsRef = useRef<{ time: number; db: number }[]>([])
  const historyRef = useRef<number[]>([])
  const lastHistoryUpdateRef = useRef<number>(0)

  const calculateDecibels = useCallback((analyser: AnalyserNode): number => {
    const dataArray = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(dataArray)

    // RMS計算
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i]
    }
    const rms = Math.sqrt(sum / dataArray.length)

    // dB変換（キャリブレーション係数94を追加）
    const db = 20 * Math.log10(rms + 1e-10) + 94

    // 0-120の範囲に制限
    return Math.max(0, Math.min(120, db))
  }, [])

  const updateMeter = useCallback(() => {
    if (!analyserRef.current || !state.isActive) return

    const db = calculateDecibels(analyserRef.current)
    const now = Date.now()
    const duration = Math.floor((now - startTimeRef.current) / 1000)

    // タイムスタンプ付きで保存
    measurementsRef.current.push({ time: now, db })

    // 古いデータを削除（直近10秒より前のデータ）
    const cutoff = now - RECENT_WINDOW_MS
    measurementsRef.current = measurementsRef.current.filter(m => m.time >= cutoff)

    // 500msごとに履歴更新
    if (now - lastHistoryUpdateRef.current >= 500) {
      historyRef.current = [...historyRef.current, db].slice(-HISTORY_LENGTH)
      lastHistoryUpdateRef.current = now
    }

    // 直近10秒の統計計算
    const recentData = measurementsRef.current.map(m => m.db)
    const recentMax = recentData.length > 0 ? Math.max(...recentData) : 0
    const recentMin = recentData.length > 0 ? Math.min(...recentData) : 0
    const recentAvg = recentData.length > 0
      ? recentData.reduce((a, b) => a + b, 0) / recentData.length
      : 0

    setState(prev => ({
      ...prev,
      decibel: db,
      history: historyRef.current,
      stats: {
        max: Math.round(recentMax * 10) / 10,
        min: Math.round(recentMin * 10) / 10,
        avg: Math.round(recentAvg * 10) / 10,
        duration,
      },
      recentStats: {
        max: Math.round(recentMax * 10) / 10,
        min: Math.round(recentMin * 10) / 10,
        avg: Math.round(recentAvg * 10) / 10,
      },
    }))

    animationRef.current = requestAnimationFrame(updateMeter)
  }, [calculateDecibels, state.isActive])

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      startTimeRef.current = Date.now()
      lastHistoryUpdateRef.current = Date.now()
      measurementsRef.current = []
      historyRef.current = []

      setState(prev => ({
        ...prev,
        isActive: true,
        error: null,
        history: [],
        stats: { max: 0, min: 0, avg: 0, duration: 0 },
        recentStats: { max: 0, min: 0, avg: 0 },
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'マイクへのアクセスが許可されていません',
      }))
    }
  }, [])

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setState(prev => ({ ...prev, isActive: false }))
  }, [])

  const reset = useCallback(() => {
    startTimeRef.current = Date.now()
    lastHistoryUpdateRef.current = Date.now()
    measurementsRef.current = []
    historyRef.current = []

    setState(prev => ({
      ...prev,
      history: [],
      stats: { max: 0, min: 0, avg: 0, duration: 0 },
      recentStats: { max: 0, min: 0, avg: 0 },
    }))
  }, [])

  useEffect(() => {
    if (state.isActive) {
      animationRef.current = requestAnimationFrame(updateMeter)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state.isActive, updateMeter])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    ...state,
    start,
    stop,
    reset,
  }
}
