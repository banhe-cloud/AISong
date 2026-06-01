'use client'

import { useEffect, useState } from 'react'
import Footer from './Footer'
import Player from './Player'
import { apiUrl, parseApiError } from '@/lib/api'
import { consumeDailyQuota, getDailyRemaining } from '@/lib/quota'
import { LOGO_ALT, LOGO_SRC } from '@/lib/site'

const PAGE_SIZE = 5

const LOADING_STEPS = [
  'Submitting your music request...',
  'AI is composing your track...',
  'Still generating, usually 1–3 minutes...',
  'Almost there, hang tight...',
]

const STYLES = ['Pop', 'Hip-Hop', 'Electronic', 'Lo-fi', 'Rock', 'Cinematic']
const MOODS = ['Upbeat', 'Chill', 'Melancholic', 'Energetic', 'Romantic']
const RANDOM = 'Random'

const THEMES = ['Summer', 'Heartbreak', 'Motivation', 'Love', 'Party', 'Night']

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildPrompt(style: string, mood: string, theme: string) {
  return `${style}, ${mood.toLowerCase()} mood, theme: ${theme}, with vocals`
}

function formatQuotaRemaining(n: number) {
  if (n <= 0) return 'No free generations left today'
  if (n === 1) return 'You have 1 free generation left today'
  return `You have ${n} free generations left today`
}

function formatCreatedAt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function resolveChoices(style: string, moodLabel: string, theme: string, themeCustom: string) {
  const s = style
  const m = moodLabel === RANDOM ? pick(MOODS) : moodLabel
  const t = themeCustom.trim() || (theme === RANDOM ? pick(THEMES) : theme)
  return { style: s, mood: m, theme: t, prompt: buildPrompt(s, m, t) }
}

export default function Home() {
  const [style, setStyle] = useState('Pop')
  const [mood, setMood] = useState(RANDOM)
  const [theme, setTheme] = useState(RANDOM)
  const [themeCustom, setThemeCustom] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [pending, setPending] = useState<{ prompt: string; startedAt: number } | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [history, setHistory] = useState<
    { id: number; name: string; prompt: string; audioUrl: string; createdAt: string }[]
  >([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [currentTrack, setCurrentTrack] = useState<{ name: string; url: string } | null>(null)
  const [playKey, setPlayKey] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)

  async function fetchHistory(page: number) {
    try {
      const res = await fetch(apiUrl(`/songs?page=${page}&limit=${PAGE_SIZE}`))
      if (!res.ok) return
      const data = await res.json()
      setHistory(data.items || [])
      setHistoryPage(data.page || 1)
      setHistoryTotalPages(data.totalPages || 1)
      setHistoryTotal(data.total || 0)
    } catch {}
  }

  async function fetchQuota() {
    setRemaining(getDailyRemaining())
  }

  useEffect(() => {
    fetchQuota()
    fetchHistory(1)
  }, [])

  useEffect(() => {
    if (!pending) {
      setElapsedSec(0)
      setLoadingStep(0)
      return
    }
    const tick = () => setElapsedSec(Math.floor((Date.now() - pending.startedAt) / 1000))
    tick()
    const secTimer = setInterval(tick, 1000)
    const stepTimer = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s))
    }, 15000)
    return () => {
      clearInterval(secTimer)
      clearInterval(stepTimer)
    }
  }, [pending])

  function loadTrack(name: string, url: string, play: boolean) {
    if (!url) return
    setCurrentTrack({ name, url })
    if (play) setPlayKey((k) => k + 1)
    document.body.classList.add('has-player')
  }

  async function handleGenerate() {
    if (isGenerating) return
    if (getDailyRemaining() <= 0) {
      alert('No free generations left today')
      return
    }
    const { prompt } = resolveChoices(style, mood, theme, themeCustom)
    setIsGenerating(true)
    setLoadingStep(0)
    setPending({ prompt, startedAt: Date.now() })
    try {
      const res = await fetch(apiUrl('/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
      const data = await res.json()
      consumeDailyQuota()
      if (data.audioUrl) loadTrack(data.name, data.audioUrl, false)
      await fetchHistory(1)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Generate failed')
    }
    setPending(null)
    fetchQuota()
    setIsGenerating(false)
  }

  function downloadAudio(url: string, name: string) {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'music'}.mp3`
    a.target = '_blank'
    a.click()
  }

  return (
    <div className="page">
      <Player track={currentTrack} playKey={playKey} />
      <header className="page-header">
        <div className="logo">
          <img
            src={LOGO_SRC}
            alt={LOGO_ALT}
            className="logo-img"
            width={36}
            height={36}
            fetchPriority="high"
          />
          <span className="logo-name">SongAI</span>
        </div>
        <div className="header-tag">No Copyright · For TikTok/Reels</div>
      </header>
      <section className="hero page-hero">
        <h1>SongAI — AI Music Generator for TikTok &amp; Reels</h1>
        <p className="hero-lead">
          Free AI song generator — create original AI music for TikTok, Instagram Reels, and short-form
          video in about 1–3 minutes.
        </p>
        <p className="seo-intro">
          SongAI is an AI music generator built for creators who need royalty-friendly tracks fast. Use our
          AI song generator to match style, mood, and theme — perfect for TikTok, Reels, and UGC ads.
        </p>
      </section>
      <div className="page-main">
      <div className="grid page-grid">
        <div className="card card-create">
          <h3>Create Your Track</h3>
          <div className="card-scroll">
          <div className="field">
            <label className="field-label">Style</label>
            <div className="opt-row">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`opt-chip${style === s ? ' active' : ''}`}
                  disabled={isGenerating}
                  onClick={() => setStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Mood</label>
            <div className="opt-row">
              <button
                type="button"
                className={`opt-chip${mood === RANDOM ? ' active' : ''}`}
                disabled={isGenerating}
                onClick={() => setMood(RANDOM)}
              >
                {RANDOM}
              </button>
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`opt-chip${mood === m ? ' active' : ''}`}
                  disabled={isGenerating}
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">Theme</label>
            <div className="opt-row">
              <button
                type="button"
                className={`opt-chip${theme === RANDOM && !themeCustom ? ' active' : ''}`}
                disabled={isGenerating}
                onClick={() => {
                  setTheme(RANDOM)
                  setThemeCustom('')
                }}
              >
                {RANDOM}
              </button>
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`opt-chip${theme === t && !themeCustom ? ' active' : ''}`}
                  disabled={isGenerating}
                  onClick={() => {
                    setTheme(t)
                    setThemeCustom('')
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              className="theme-input"
              value={themeCustom}
              onChange={(e) => setThemeCustom(e.target.value)}
              disabled={isGenerating}
              placeholder="Custom theme (e.g., summer road trip)"
              maxLength={40}
            />
          </div>
          </div>
          <div className="card-footer">
            {remaining !== null && <p className="quota-tip">{formatQuotaRemaining(remaining)}</p>}
            <button className="btn" disabled={isGenerating || remaining === 0} onClick={handleGenerate}>
              {isGenerating ? 'Generating...' : 'Generate Music Now'}
            </button>
            <p className="royalty-note">
              All tracks are royalty-free &amp; cleared for commercial use on TikTok, Reels, YouTube, and
              more.
            </p>
          </div>
        </div>
        <div className="card card-songs">
          <h3>Your Songs {historyTotal > 0 && <span className="hist-count">({historyTotal})</span>}</h3>
          <div className="hist-list">
          {pending && (
            <div className="hist-item hist-loading">
              <div className="hist-info">
                <span className="hist-name">
                  <span className="spinner" /> Generating… {elapsedSec}s
                </span>
                <span className="hist-prompt">{pending.prompt}</span>
                <span className="hist-loading-msg">{LOADING_STEPS[loadingStep]}</span>
              </div>
            </div>
          )}
          {!pending && history.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No songs yet</p>
          )}
          {history.map((item) => (
            <div key={item.id} className="hist-item">
              <div className="hist-info">
                <span className="hist-name">{item.name}</span>
                {item.createdAt && (
                  <span className="hist-time">{formatCreatedAt(item.createdAt)}</span>
                )}
                <span className="hist-prompt">{item.prompt}</span>
              </div>
              <div>
                <button
                  className="hist-btn"
                  onClick={() => loadTrack(item.name, item.audioUrl, true)}
                  disabled={!item.audioUrl}
                >
                  Play
                </button>
                <button
                  className="hist-btn"
                  onClick={() => downloadAudio(item.audioUrl, item.name)}
                  disabled={!item.audioUrl}
                >
                  Download
                </button>
              </div>
            </div>
          ))}
          </div>
          {historyTotalPages > 1 && (
            <div className="pager">
              <button
                type="button"
                className="pager-btn"
                disabled={historyPage <= 1 || isGenerating}
                onClick={() => fetchHistory(historyPage - 1)}
              >
                Previous
              </button>
              <span className="pager-info">
                {historyPage} / {historyTotalPages}
              </span>
              <button
                type="button"
                className="pager-btn"
                disabled={historyPage >= historyTotalPages || isGenerating}
                onClick={() => fetchHistory(historyPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}
