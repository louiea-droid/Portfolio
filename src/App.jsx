import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { profile, projects, process, about } from './content.js'

const SECTIONS = ['work', 'process', 'about', 'contact']
const FILTERS = ['All', ...new Set(projects.flatMap((p) => p.tags))]
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// Animate a state change with the View Transitions API when the browser has it.
function transition(update) {
  if (!document.startViewTransition || reducedMotion()) return update()
  document.startViewTransition(() => flushSync(update))
}

function introSeen() {
  try { return sessionStorage.getItem('intro') === '1' } catch { return false }
}

// Deep links: #work/<project id> opens that case study.
const projectFromHash = () => projects.find((p) => location.hash === `#work/${p.id}`) ?? null

export default function App() {
  // index.html sets data-theme before first paint, so read it from there.
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light')
  const [active, setActive] = useState('')
  const [intro, setIntro] = useState(() => !introSeen() && !projectFromHash())

  // Hero choreography waits (paused in CSS) until the intro has left.
  useEffect(() => {
    if (intro) return
    document.documentElement.classList.add('play')
    try { sessionStorage.setItem('intro', '1') } catch { /* storage blocked */ }
  }, [intro])

  // Fade sections in as they scroll into view.
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { rootMargin: '0px 0px -10% 0px' })
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch { /* storage blocked */ }
  }, [theme])

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id === 'top' ? '' : e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ;['top', ...SECTIONS].forEach((id) => io.observe(document.getElementById(id)))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {intro && <Intro onDone={() => setIntro(false)} />}
      <Backdrop />
      <header className="masthead">
        <a href="#top" className="wordmark">
          <span className="monogram" aria-hidden="true">LA</span>
          {profile.name}
        </a>
        <div className="masthead-end">
          <a className="masthead-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
          <span className="availability"><i aria-hidden="true" />{profile.availability}</span>
        </div>
      </header>
      <Toolbar active={active} theme={theme} onTheme={() => transition(() => setTheme(theme === 'dark' ? 'light' : 'dark'))} />
      <main>
        <Hero />
        <Work />
        <Process />
        <About />
        <Contact />
      </main>
      <footer className="footer">© {new Date().getFullYear()} {profile.name}</footer>
    </>
  )
}

// Short loading screen: a frame is drawn around the monogram while fonts load.
function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let alive = true
    const min = reducedMotion() ? 0 : 800
    Promise.all([document.fonts.ready, new Promise((r) => setTimeout(r, min))]).then(() => alive && setLeaving(true))
    return () => { alive = false }
  }, [])

  return (
    <div
      className={`intro${leaving ? ' leaving' : ''}`}
      aria-hidden="true"
      onTransitionEnd={(e) => e.target === e.currentTarget && leaving && onDone()}
    >
      <div className="intro-frame">
        <span className="intro-mark">LA</span>
        <span className="selection-box"><b /><b /><b /><b /></span>
      </div>
      <p className="intro-name">{profile.name}</p>
      <div className="intro-bar"><i /></div>
    </div>
  )
}

// Living canvas: a soft glow drifts, and the dots light up under the pointer.
function Backdrop() {
  const spot = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const el = spot.current
    let x = 0, y = 0, frame = 0
    // At most one style write per animation frame; CSS transitions do the easing.
    const move = (e) => {
      x = e.clientX
      y = e.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        el.style.setProperty('--x', `${x}px`)
        el.style.setProperty('--y', `${y}px`)
        el.classList.add('on')
      })
    }
    const leave = () => el.classList.remove('on')
    addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <>
      <div className="progress" aria-hidden="true" />
      <div className="backdrop" aria-hidden="true"><i /></div>
      <div className="spotlight" ref={spot} aria-hidden="true" />
    </>
  )
}

const clamp = (v, max) => Math.max(-max, Math.min(max, v))

function Hero() {
  const ref = useRef(null)
  const drag = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  // Keep the headline roughly on screen.
  const place = (x, y) => setPos({ x: Math.round(clamp(x, innerWidth / 2)), y: Math.round(clamp(y, 320)) })

  // Mouse-only, so touch users can still scroll the page from the headline.
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }
  const onPointerMove = (e) => drag.current && place(e.clientX - drag.current.x, e.clientY - drag.current.y)
  const onPointerUp = () => { drag.current = null }

  const onKeyDown = (e) => {
    const step = e.shiftKey ? 10 : 1
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (moves[e.key]) {
      e.preventDefault()
      place(pos.x + moves[e.key][0], pos.y + moves[e.key][1])
    } else if (e.key === 'Escape') {
      setPos({ x: 0, y: 0 })
    }
  }

  const moved = pos.x !== 0 || pos.y !== 0

  return (
    <section id="top" className="hero">
      <div className="hero-main">
        <p className="hero-role">{profile.role}</p>
        <div
          className={`selection${moved ? ' moved' : ''}`}
          ref={ref}
          tabIndex={0}
          aria-roledescription="movable headline"
          aria-describedby="drag-hint"
          style={{ translate: `${pos.x}px ${pos.y}px` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onDoubleClick={() => setPos({ x: 0, y: 0 })}
          onKeyDown={onKeyDown}
        >
          <h1>{profile.headline}</h1>
          <span className="selection-box" aria-hidden="true"><b /><b /><b /><b /></span>
          <span className="selection-size" aria-hidden="true">{size.w} × {size.h}</span>
          <span className="cursor" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="18" height="18"><path d="M1 1l5.5 14 2-6 6-2z" /></svg>
            <em>Louie</em>
          </span>
        </div>
        <p className="hero-intro">{profile.intro}</p>
        <div className="hero-actions">
          <a href="#work" className="btn btn-primary">See selected work</a>
          <a href="#contact" className="btn">Start a project</a>
        </div>
      </div>

      <aside className="inspector" aria-label="Quick links">
        <p className="inspector-title">Headline</p>
        <div className="inspector-grid" aria-hidden="true">
          <span><em>X</em>{pos.x}</span>
          <span><em>Y</em>{pos.y}</span>
          <span><em>W</em>{size.w}</span>
          <span><em>H</em>{size.h}</span>
        </div>
        <p className="inspector-hint" id="drag-hint">
          {moved ? 'Double-click or press Escape to put it back.' : 'Drag the headline, or focus it and use the arrow keys.'}
        </p>
        <dl className="inspector-props">
          <div><dt>Background</dt><dd>{profile.background}</dd></div>
          <div><dt>Focus</dt><dd>{profile.focus}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
          {profile.links.map((l) => (
            <div key={l.label}><dt>{l.label}</dt><dd><a href={l.url} target="_blank" rel="noreferrer">{l.text}</a></dd></div>
          ))}
        </dl>
      </aside>
    </section>
  )
}

function Work() {
  const [filter, setFilter] = useState('All')
  const [open, setOpen] = useState(projectFromHash)
  const dialog = useRef(null)
  const shown = filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter))

  // Keep the URL in sync so a single case study can be shared.
  useEffect(() => {
    if (open) {
      if (!dialog.current.open) dialog.current.showModal()
      history.replaceState(null, '', `#work/${open.id}`)
    } else if (location.hash.startsWith('#work/')) {
      history.replaceState(null, '', '#work')
    }
  }, [open])

  useEffect(() => {
    const onHash = () => setOpen(projectFromHash())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  // Previous / next within the current filter.
  const list = open && shown.includes(open) ? shown : projects
  const idx = open ? list.indexOf(open) : -1
  const go = (d) => setOpen(list[(idx + d + list.length) % list.length])

  return (
    <section id="work" className="section">
      <div className="section-head reveal">
        <h2>Selected work</h2>
        <div className="chips" role="group" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button key={f} className="chip" aria-pressed={f === filter} onClick={() => transition(() => setFilter(f))}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="frames reveal">
        {shown.map((p, i) => (
          <article key={p.id} className="frame" style={{ '--hue': p.hue, '--i': i, viewTransitionName: `frame-${p.id}` }}>
            <span className="frame-name">{p.name}<span>{p.year}</span></span>
            <button className="frame-body" onClick={() => setOpen(p)} aria-haspopup="dialog">
              <Sketch kind={p.kind} />
              <span className="frame-text">
                <strong>{p.title}</strong>
                <span>{p.summary}</span>
                <span className="outcome">{p.outcome}</span>
              </span>
              <span className="handles" aria-hidden="true"><b /><b /><b /><b /></span>
            </button>
          </article>
        ))}
      </div>

      {open && (
        <dialog
          ref={dialog}
          className="case"
          aria-labelledby="case-title"
          style={{ '--hue': open.hue }}
          onClose={() => setOpen(null)}
          onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(-1)
            if (e.key === 'ArrowRight') go(1)
          }}
        >
          <div className="case-bar">
            <span className="case-count">{idx + 1} / {list.length}</span>
            <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous project">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button className="icon-btn" onClick={() => go(1)} aria-label="Next project">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
            <form method="dialog">
              <button className="icon-btn" aria-label="Close" autoFocus>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </form>
          </div>
          <div className="case-inner" key={open.id}>
            <Sketch kind={open.kind} />
            <div className="case-text">
              <p className="frame-name">{open.name}</p>
              <h2 id="case-title">{open.title}</h2>
              <p>{open.details}</p>
              <dl>
                <div><dt>Role</dt><dd>{open.role}</dd></div>
                <div><dt>Year</dt><dd>{open.year}</dd></div>
                <div><dt>Result</dt><dd>{open.outcome}</dd></div>
              </dl>
            </div>
          </div>
        </dialog>
      )}
    </section>
  )
}

// Abstract wireframe thumbnails, drawn in CSS.
function Sketch({ kind }) {
  const bars = [40, 65, 50, 85, 60, 95]
  return (
    <span className={`sketch sketch-${kind}`} aria-hidden="true">
      <span className="sk-side" />
      <span className="sk-main">
        <span className="sk-bar" />
        <span className="sk-chart">{bars.map((h, i) => <i key={i} style={{ '--h': `${h}%`, '--i': i }} />)}</span>
        <span className="sk-rows"><i /><i /><i /></span>
      </span>
    </span>
  )
}

function Process() {
  return (
    <section id="process" className="section">
      <div className="section-head reveal"><h2>How a project runs</h2></div>
      <ol className="flow reveal">
        {process.map((s, i) => (
          <li key={s.title} className="flow-step" style={{ '--i': i }}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section about">
      <div className="section-head reveal"><h2>About</h2></div>
      <div className="about-text reveal">{about.text.map((t) => <p key={t}>{t}</p>)}</div>
      <dl className="facts reveal">
        {about.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </section>
  )
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState({ state: 'idle', note: '' })

  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      location.href = `mailto:${profile.email}`
    }
  }

  async function send(e) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus({ state: 'sending', note: '' })
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data.error || 'The message could not be sent.')
      form.reset()
      setStatus({ state: 'sent', note: "Message sent. I'll reply to the email you gave." })
    } catch (err) {
      setStatus({ state: 'error', note: `${err.message} Email me directly at ${profile.email}.` })
    }
  }

  return (
    <section id="contact" className="section contact reveal">
      <h2>Have a product to design or build?</h2>
      <p>Tell me what you're building and where it's stuck. I reply within two working days.</p>

      <form className="contact-form" onSubmit={send}>
        <label>Name<input name="name" autoComplete="name" required maxLength={100} /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} /></label>
        <label className="wide">What are you working on?<textarea name="message" rows={5} required minLength={10} maxLength={5000} /></label>
        {/* Honeypot for bots; hidden from people and screen readers */}
        <input name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
        <div className="wide form-end">
          <button className="btn btn-primary" disabled={status.state === 'sending'}>
            {status.state === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <p className={`form-note ${status.state}`} role="status">{status.note}</p>
        </div>
      </form>

      <div className="contact-alt">
        <span>Or email me directly:</span>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button className="btn" onClick={copy}>{copied ? 'Email copied' : 'Copy email'}</button>
      </div>
      {profile.links.length > 0 && (
        <ul className="links">
          {profile.links.map((l) => <li key={l.label}><a href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>)}
        </ul>
      )}
      <span className="sr-only" aria-live="polite">{copied ? 'Email copied to clipboard' : ''}</span>
    </section>
  )
}

function Toolbar({ active, theme, onTheme }) {
  const nav = useRef(null)
  const pill = useRef(null)

  // Slide the highlight under the current section's link; re-measure when the bar resizes.
  useEffect(() => {
    const measure = () => {
      const el = active && nav.current.querySelector(`[href="#${active}"]`)
      const s = pill.current.style
      s.opacity = el ? 1 : 0
      if (el) {
        s.transform = `translateX(${el.offsetLeft}px)`
        s.width = `${el.offsetWidth}px`
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(nav.current)
    return () => ro.disconnect()
  }, [active])

  return (
    <nav className="toolbar" aria-label="Sections" ref={nav}>
      <span className="toolbar-pill" ref={pill} />
      {SECTIONS.map((id) => (
        <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined}>
          {id[0].toUpperCase() + id.slice(1)}
        </a>
      ))}
      <span className="toolbar-sep" />
      <button className="icon-btn" onClick={onTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="fill">
          {theme === 'dark'
            ? <circle cx="12" cy="12" r="5" />
            : <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />}
        </svg>
      </button>
    </nav>
  )
}
