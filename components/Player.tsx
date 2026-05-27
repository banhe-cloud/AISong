'use client'

import { useEffect, useRef, useState } from 'react'

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Player({
  track,
  playKey,
}: {
  track: { name: string; url: string } | null
  playKey: number
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!track?.url) return
    const audio = audioRef.current!
    audio.src = track.url
    setCurrent(0)
    setTotal(0)
    setPlaying(false)
  }, [track?.url])

  useEffect(() => {
    if (!playKey || !track?.url) return
    audioRef.current!.play().then(() => setPlaying(true)).catch(() => {})
  }, [playKey, track?.url])

  if (!track?.url) return null

  const pct = total ? (current / total) * 100 : 0

  function togglePlay() {
    const audio = audioRef.current!
    if (playing) audio.pause()
    else audio.play().catch(() => {})
  }

  function onSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current!
    const t = (Number(e.target.value) / 100) * total
    audio.currentTime = t
    setCurrent(t)
  }

  return (
    <div className="player-bar">
      <div className="player-progress-bg">
        <div className="player-progress-fill" style={{ width: `${pct}%` }} />
        <input className="player-progress" type="range" min="0" max="100" value={pct} onChange={onSeek} />
      </div>
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrent(audioRef.current!.currentTime)}
        onLoadedMetadata={() => setTotal(audioRef.current!.duration)}
        onEnded={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="player-cover" />
      <div className="player-info">
        <div className="player-title">{track.name}</div>
        <div className="player-time">
          {formatTime(current)} / {formatTime(total)}
        </div>
      </div>
      <div className="player-controls">
        <button type="button" className="player-play-btn" onClick={togglePlay}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
