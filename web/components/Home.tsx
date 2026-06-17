'use client'

import { useEffect, useRef, useState } from 'react'
import Footer from './Footer'
import Player from './Player'
import { apiUrl, parseApiError } from '@/lib/api'
import { addSong, listSongs } from '@/lib/history'
import { consumeDailyQuota, getDailyRemaining } from '@/lib/quota'
import { LOGO_ALT, LOGO_SRC } from '@/lib/site'

const PAGE_SIZE = 5

const LOADING_STEPS = [
  'Submitting your music request...',
  'AI is composing your track...',
  'Still generating, usually within 1 minute...',
  'Almost there, hang tight...',
]

const STYLES = ['Pop', 'Hip-Hop', 'Electronic', 'Lo-fi', 'Rock', 'Cinematic']
const MOODS = ['Upbeat', 'Chill', 'Melancholic', 'Energetic', 'Romantic']

const THEMES = ['Summer', 'Heartbreak', 'Motivation', 'Love', 'Party', 'Night']

const VOCALS = [{ id: 'instrumental', label: 'Instrumental' }] as const

type VocalType = (typeof VOCALS)[number]['id'] | ''

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

function buildFinalPrompt(
  desc: string,
  advancedOpen: boolean,
  style: string,
  mood: string,
  theme: string,
  themeCustom: string,
) {
  const d = desc.trim()
  const parts: string[] = []
  if (advancedOpen && style) parts.push(style)
  if (advancedOpen && mood) parts.push(`${mood.toLowerCase()} mood`)
  if (advancedOpen) {
    const t = themeCustom.trim() || theme
    if (t) parts.push(`theme: ${t}`)
  }
  const chip = parts.join(', ')
  if (d && chip) return `${d}, ${chip}`
  if (d) return d
  return chip
}

export default function Home() {
  const [promptInput, setPromptInput] = useState('')
  const [lyricsInput, setLyricsInput] = useState('')
  const [isLyricsLoading, setIsLyricsLoading] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [style, setStyle] = useState('')
  const [mood, setMood] = useState('')
  const [theme, setTheme] = useState('')
  const [themeCustom, setThemeCustom] = useState('')
  const [vocalType, setVocalType] = useState<VocalType>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [pending, setPending] = useState<{ prompt: string } | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const startedAtRef = useRef(0)
  const [history, setHistory] = useState<
    { id: number; name: string; prompt: string; audioUrl: string; createdAt: string }[]
  >([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [currentTrack, setCurrentTrack] = useState<{ name: string; url: string } | null>(null)
  const [playKey, setPlayKey] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)

  function loadHistory(page: number) {
    const data = listSongs(page, PAGE_SIZE)
    setHistory(data.items)
    setHistoryPage(data.page)
    setHistoryTotalPages(data.totalPages)
    setHistoryTotal(data.total)
  }

  async function fetchQuota() {
    setRemaining(getDailyRemaining())
  }

  useEffect(() => {
    fetchQuota()
    loadHistory(1)
  }, [])

  useEffect(() => {
    if (!isGenerating) {
      setElapsedSec(0)
      setLoadingStep(0)
      return
    }
    const tick = () => setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000))
    tick()
    const secTimer = setInterval(tick, 1000)
    const stepTimer = setInterval(() => {
      setLoadingStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s))
    }, 15000)
    return () => {
      clearInterval(secTimer)
      clearInterval(stepTimer)
    }
  }, [isGenerating])

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
    const prompt = buildFinalPrompt(promptInput, advancedOpen, style, mood, theme, themeCustom)
    startedAtRef.current = Date.now()
    setIsGenerating(true)
    setLoadingStep(0)
    setElapsedSec(0)
    setPending({ prompt: prompt || 'Generating...' })
    try {
      const res = await fetch(apiUrl('/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          lyrics: lyricsInput.trim() || undefined,
          vocalType: vocalType || undefined,
        }),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
      const data = await res.json()
      consumeDailyQuota()
      if (data.audioUrl) {
        loadTrack(data.name, data.audioUrl, false)
        addSong({
          id: data.id,
          name: data.name,
          prompt,
          audioUrl: data.audioUrl,
          createdAt: new Date().toISOString(),
        })
        loadHistory(1)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Generate failed')
    }
    setPending(null)
    fetchQuota()
    setIsGenerating(false)
  }

  async function handleRandomLyrics() {
    if (isLyricsLoading || isGenerating || vocalType === 'instrumental') return
    const prompt = buildFinalPrompt(promptInput, advancedOpen, style, mood, theme, themeCustom)
    if (!prompt.trim()) {
      alert('Describe your track or pick options in Advanced')
      return
    }
    setIsLyricsLoading(true)
    try {
      const res = await fetch(apiUrl('/lyrics'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!res.ok) throw new Error(await parseApiError(res))
      const data = await res.json()
      setLyricsInput(data.lyrics || '')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to generate lyrics')
    }
    setIsLyricsLoading(false)
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
          video in under 1 minute.
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
            <label className="field-label">Describe your track</label>
            <textarea
              className="prompt-input"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              disabled={isGenerating}
              placeholder="e.g. 118 bpm upbeat pop, bright synth hook, punchy kick, summer TikTok vlog energy"
              maxLength={200}
              rows={3}
            />
          </div>
          <div className="field">
            <label className="field-label">Voice</label>
            <div className="opt-row">
              {VOCALS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`opt-chip${vocalType === v.id ? ' active' : ''}`}
                  disabled={isGenerating}
                  onClick={() => {
                    const next = vocalType === v.id ? '' : v.id
                    setVocalType(next)
                    if (next === 'instrumental') setLyricsInput('')
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="field-head">
              <label className="field-label">Lyrics</label>
              <button
                type="button"
                className="lyrics-random-btn"
                disabled={isGenerating || isLyricsLoading || vocalType === 'instrumental'}
                onClick={handleRandomLyrics}
              >
                {isLyricsLoading ? 'Generating...' : 'Random Lyrics'}
              </button>
            </div>
            <textarea
              className="prompt-input lyrics-input"
              value={lyricsInput}
              onChange={(e) => setLyricsInput(e.target.value)}
              disabled={isGenerating || vocalType === 'instrumental'}
              placeholder={
                vocalType === 'instrumental'
                  ? 'Not needed for instrumental'
                  : 'Optional — click Random Lyrics or paste your own'
              }
              rows={5}
            />
          </div>
          <button
            type="button"
            className="advanced-toggle"
            disabled={isGenerating}
            onClick={() => setAdvancedOpen((o) => !o)}
          >
            Advanced options <span className="advanced-chevron">{advancedOpen ? '▲' : '▼'}</span>
          </button>
          {advancedOpen && (
            <div className="advanced-panel">
              <div className="field">
                <label className="field-label">Style</label>
                <div className="opt-row">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`opt-chip${style === s ? ' active' : ''}`}
                      disabled={isGenerating}
                      onClick={() => setStyle(style === s ? '' : s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Mood</label>
                <div className="opt-row">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`opt-chip${mood === m ? ' active' : ''}`}
                      disabled={isGenerating}
                      onClick={() => setMood(mood === m ? '' : m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Theme</label>
                <div className="opt-row">
                  {THEMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`opt-chip${theme === t && !themeCustom ? ' active' : ''}`}
                      disabled={isGenerating}
                      onClick={() => {
                        if (theme === t && !themeCustom) {
                          setTheme('')
                        } else {
                          setTheme(t)
                          setThemeCustom('')
                        }
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
          )}
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
                  onClick={() => window.open(item.audioUrl, '_blank', 'noopener,noreferrer')}
                  disabled={!item.audioUrl}
                >
                  Open
                </button>
                <button
                  className="hist-btn"
                  onClick={() => loadTrack(item.name, item.audioUrl, true)}
                  disabled={!item.audioUrl}
                >
                  Play
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
                onClick={() => loadHistory(historyPage - 1)}
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
                onClick={() => loadHistory(historyPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      {/* <section className="card showcase">
        <h3>Discover AI-Crafted Music</h3>
        <div className="showcase-row">
          {(
            [
              { key: 'vocal', label: 'Vocal', items: SHOWCASE_ITEMS.filter((i) => i.type === 'vocal') },
              {
                key: 'instrumental',
                label: 'Instrumental',
                items: SHOWCASE_ITEMS.filter((i) => i.type === 'instrumental'),
              },
            ] as const
          ).map((group) => (
            <div key={group.key} className={`showcase-group showcase-panel showcase-panel-${group.key}`}>
              <span className={`showcase-subtitle showcase-subtitle-${group.key}`}>{group.label}</span>
              <div className="showcase-grid">
                {group.items.map((item) => (
                  <div key={item.id} className={`showcase-card showcase-card-${group.key}`}>
                    <button
                      type="button"
                      className="showcase-cover-btn"
                      aria-label={`Play ${item.name}`}
                      onClick={() => loadTrack(item.name, item.audio, true)}
                    >
                      <img className="showcase-cover" src={item.cover} alt={item.name} loading="lazy" />
                      <span className="showcase-cover-overlay">
                        <svg className="showcase-play-icon" viewBox="0 0 48 48" aria-hidden="true">
                          <path
                            d="M17 13v22l18-11-18-11z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                    <div className="showcase-body">
                      <h4 className="showcase-name">{item.name}</h4>
                      <div className="showcase-tags">
                        {item.tags.map((tag) => (
                          <span key={tag} className="showcase-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section> */}
      </div>
      <Footer />
    </div>
  )
}
