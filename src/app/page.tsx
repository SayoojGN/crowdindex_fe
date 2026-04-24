import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const C = {
  surface:        '#fcf9f2',
  surfaceLow:     '#f6f3ec',
  surfaceHigh:    '#ebe8e1',
  surfaceHighest: '#e5e2db',
  onSurface:      '#1c1c18',
  onSurfaceVar:   '#424849',
  // primary:        '#466066',
  primary:        '#9e4225',
  secondary:      '#466066',
  outline:        '#c1c7c9',
  dark:           '#1c1c18',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div style={{ backgroundColor: C.surface, color: C.onSurface, fontFamily: 'var(--font-sans)' }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CtaBanner />
      <Footer />
    </div>
  )
}

/* ── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav
      className="fixed top-0 w-full z-50 backdrop-blur-md"
      style={{ backgroundColor: `${C.surface}cc`, boxShadow: '0 32px 64px rgba(28,28,24,0.04)' }}
    >
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-12">
          <span
            className="text-xl font-extrabold tracking-tighter"
            style={{ color: C.secondary, fontFamily: 'var(--font-heading)' }}
          >
            CrowdIndex
          </span>
          <div className="hidden md:flex items-center gap-8">
            {['Platform', 'Intelligence', 'Solutions', 'Resources'].map((l, i) => (
              <a
                key={l}
                href="#"
                className="text-sm font-medium tracking-tight transition-colors"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: i === 0 ? C.primary : `${C.primary}80`,
                  borderBottom: i === 0 ? `2px solid ${C.secondary}` : 'none',
                  paddingBottom: i === 0 ? '4px' : undefined,
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm font-medium"
            style={{ fontFamily: 'var(--font-heading)', color: `${C.secondary}` }}
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm transition-all active:scale-90"
            style={{ backgroundColor: C.primary, fontFamily: 'var(--font-heading)' }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <header
      className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden"
      style={{ backgroundColor: C.surface }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[80%] rounded-full pointer-events-none"
        style={{ background: '#cbe7ee4d', filter: 'blur(120px)' }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full pointer-events-none"
        style={{ background: '#ffdbd133', filter: 'blur(100px)' }} />

      <div className="w-full px-8 relative z-10 flex flex-col items-center text-center">
        <div className="max-w-7xl w-full">
          <h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.05]"
            style={{ fontFamily: 'var(--font-heading)', color: C.onSurface }}
          >
            Catch the latest crowd <br />
            <span style={{ color: C.primary, fontStyle: 'italic' }}>opinions</span>
            {' '}about various topics.
          </h1>

          {/* <p className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed" style={{ color: C.onSurfaceVar }}>
            CrowdIndex mines millions of crowd-sourced posts to uncover real-world sentiment,
            side effects, and patient evidence that clinical trials often miss.
          </p> */}

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-15">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 pl-7 pr-2 py-2 rounded-full font-bold text-large text-white transition-all hover:brightness-110"
              style={{
                backgroundColor: C.dark,
                fontFamily: 'var(--font-heading)',
                boxShadow: `0 0 0 1.5px ${C.primary}55, 0 8px 32px rgba(0,0,0,0.18)`,
              }}
            >
              Get Started free
              <span
                className="flex items-center justify-center w-9 h-9 rounded-full text-white text-base font-bold shrink-0"
                style={{ backgroundColor: C.primary }}
              >
                →
              </span>
            </Link>
            {/* <Link
              href="/auth/login"
              className="px-10 py-4 rounded-lg font-bold text-lg transition-colors"
              style={{ fontFamily: 'var(--font-heading)', color: C.primary, backgroundColor: C.surfaceHigh }}
            >
              View Sample Analysis
            </Link> */}
          </div>
        </div>
      </div>
    </header>
  )
}

/* ── Mini preview components (compact replicas of actual dashboard UI) ───── */

// Matches SentimentChart.tsx — SVG line chart, dimension pills, latest score badge
function MiniChartDark() {
  const dims = [
    { label: 'efficacy',     color: '#4664ff', scores: [0.2, 0.5, 0.3, 0.7, 0.6, 0.8, 0.65, 0.9, 0.75, 0.85] },
    { label: 'tolerability', color: '#9c27b0', scores: [0.1, 0.3, 0.2, 0.5, 0.4, 0.55, 0.45, 0.6, 0.5, 0.65] },
  ]
  const active = dims[0]
  const dates = ['Apr 1','Apr 6','Apr 11','Apr 16','Apr 21','Apr 26','May 1','May 6','May 11','May 16']
  const PAD = { top: 14, right: 18, bottom: 28, left: 28 }
  const VW = 340, VH = 130
  const CW = VW - PAD.left - PAD.right
  const CH = VH - PAD.top - PAD.bottom
  const xAt = (i: number) => PAD.left + (i / (active.scores.length - 1)) * CW
  const yAt = (s: number)  => PAD.top  + ((1 - s) / 2) * CH
  const ticks = [1, 0.5, 0, -0.5, -1]

  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      {/* Header + pills */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-2 flex-wrap">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60" style={{ fontFamily: 'var(--font-heading)' }}>
            Sentiment Trends
          </p>
          <p className="text-[8px] text-[#6b6b6b] mt-0.5">Avg daily sentiment per dimension</p>
        </div>
        <div className="flex gap-1">
          {dims.map((d) => (
            <span
              key={d.label}
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-medium capitalize"
              style={{
                backgroundColor: d.label === active.label ? d.color : '#f0f0f0',
                color: d.label === active.label ? '#fff' : '#6b6b6b',
                fontFamily: 'var(--font-heading)',
              }}
            >
              <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: d.label === active.label ? 'rgba(255,255,255,0.7)' : d.color }} />
              {d.label}
            </span>
          ))}
        </div>
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ display: 'block' }}>
        {ticks.map((t) => {
          const y = yAt(t)
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={PAD.left + CW} y2={y}
                stroke={t === 0 ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'}
                strokeWidth={t === 0 ? 1.5 : 1} strokeDasharray={t === 0 ? '3 2' : undefined} />
              <text x={PAD.left - 4} y={y} dy="0.35em" textAnchor="end" fontSize={7} fill="#6b6b6b" fontFamily="var(--font-heading)">{t.toFixed(1)}</text>
            </g>
          )
        })}

        {/* Inactive lines */}
        {dims.filter(d => d.label !== active.label).map(d => (
          <polyline key={d.label}
            points={d.scores.map((s, i) => `${xAt(i)},${yAt(s)}`).join(' ')}
            fill="none" stroke={d.color} strokeWidth={1} strokeOpacity={0.15} />
        ))}

        {/* Area fill */}
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={active.color} stopOpacity={0.12} />
            <stop offset="100%" stopColor={active.color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon
          points={[`${xAt(0)},${yAt(0)}`, ...active.scores.map((s,i) => `${xAt(i)},${yAt(s)}`), `${xAt(active.scores.length-1)},${yAt(0)}`].join(' ')}
          fill="url(#lg)" />

        {/* Active line */}
        <polyline
          points={active.scores.map((s,i) => `${xAt(i)},${yAt(s)}`).join(' ')}
          fill="none" stroke={active.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* Dots */}
        {active.scores.map((s, i) => i % 3 === 0 || i === active.scores.length - 1
          ? <circle key={i} cx={xAt(i)} cy={yAt(s)} r={2.5} fill={active.color} />
          : null)}

        {/* X labels */}
        {/* {[0, 4, 9].map(i => (
          <text key={i} x={xAt(i)} y={VH - 4} textAnchor="middle" fontSize={7} fill="#6b6b6b" fontFamily="var(--font-heading)">
            {dates[i]}
          </text>
        ))} */}

        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + CH} stroke="rgba(0,0,0,0.08)" strokeWidth={1} />
      </svg>

      {/* Latest badge */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <span className="text-[9px] text-[#6b6b6b]">Latest ({dates[dates.length - 1]})</span>
        <span className="text-[9px] font-semibold tabular-nums rounded-full px-2 py-0.5"
          style={{ backgroundColor: `${active.color}18`, color: active.color, fontFamily: 'var(--font-heading)' }}>
          +{active.scores[active.scores.length - 1].toFixed(2)}
        </span>
      </div>
    </div>
  )
}

// Matches EvidenceTable.tsx — fills parent card edge-to-edge, two tall columns
function SideEffectsList() {
  const left = [
    { id: '1',  evidence: 'persistent bloating',          severity: null },
    { id: '2',  evidence: 'gastrointestinal discomfort',  severity: 'mild' },
    { id: '3',  evidence: 'blood pressure drop',          severity: null },
    { id: '4',  evidence: 'nausea on empty stomach',      severity: null },
    { id: '5',  evidence: 'headaches in the morning',     severity: null },
    { id: '6',  evidence: 'unexpected weight gain',       severity: 'mild' },
    { id: '7',  evidence: 'blurred vision episodes',      severity: null },
    { id: '8',  evidence: 'metallic taste in mouth',      severity: null },
  ]
  const right = [
    { id: '9',  evidence: 'muscle cramps after exercise', severity: 'mild' },
    { id: '10', evidence: 'unusual fatigue or weakness',  severity: null },
    { id: '11', evidence: 'dry mouth throughout the day', severity: null },
    { id: '12', evidence: 'increased urination at night', severity: null },
    { id: '13', evidence: 'stomach pain after meals',     severity: 'mild' },
    { id: '14', evidence: 'dizziness when standing up',   severity: null },
    { id: '15', evidence: 'loss of appetite initially',   severity: null },
    { id: '16', evidence: 'skin rash on forearms',        severity: 'mild' },
  ]
  const Row = ({ item }: { item: typeof left[0] }) => (
    <div
      className="flex items-center justify-between gap-2 px-4 py-2.5 text-[9px]"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
    >
      <span className="leading-snug" style={{ color: '#0e0e0e' }}>{item.evidence}</span>
      {item.severity && (
        <span
          className="shrink-0 rounded-full px-1.5 py-0.5 font-semibold uppercase tracking-wide"
          style={{ backgroundColor: '#ff572218', color: '#ff5722', fontFamily: 'var(--font-heading)', fontSize: 7 }}
        >
          {item.severity}
        </span>
      )}
    </div>
  )
  return (
    <div className="flex flex-col h-full">
      {/* Header with search — flush to card edges */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
      >
        <span
          className="text-[9px] font-semibold uppercase tracking-widest text-[#6b6b6b]/60 shrink-0"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Side Effects
        </span>
        <div className="flex items-center gap-1.5 rounded-lg bg-[#f5f5f5] px-2 py-1">
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#6b6b6b" strokeWidth="1.5"/>
            <line x1="7.5" y1="7.5" x2="10" y2="10" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-[8px] text-[#6b6b6b]/50">Search side effects…</span>
        </div>
      </div>

      {/* Two columns — fill remaining height */}
      <div className="grid grid-cols-2 flex-1 overflow-hidden">
        <div className="overflow-hidden" style={{ borderRight: '1px solid rgba(0,0,0,0.06)' }}>
          {left.map(item => <Row key={item.id} item={item} />)}
        </div>
        <div className="overflow-hidden">
          {right.map(item => <Row key={item.id} item={item} />)}
        </div>
      </div>

      {/* Pagination footer */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <span className="text-[8px] text-[#6b6b6b]" style={{ fontFamily: 'var(--font-heading)' }}>1–16 of 53</span>
        <div className="flex gap-1">
          {['← Prev', 'Next →'].map(l => (
            <span
              key={l}
              className="rounded px-2 py-0.5 text-[8px] font-medium"
              style={{ backgroundColor: '#f0f0f0', color: '#6b6b6b', fontFamily: 'var(--font-heading)' }}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Matches RecentPosts.tsx — source badge, date, faded content, dimension pills
function PostCards() {
  const SENTIMENT = { positive: '#4caf50', neutral: '#6b6b6b', negative: '#ff5722' }
  const DIM_COLOR: Record<string, string> = { efficacy: '#4664ff', tolerability: '#9c27b0', quality_of_life: '#ff9800' }
  const posts = [
    {
      id: '1', source: 'reddit', date: 'May 12, 2025',
      content: 'Metformin really helped bring my A1C down after 3 months on the full dose. Feeling much more hopeful.',
      dims: [{ d: 'efficacy', s: 'positive' as const }, { d: 'quality_of_life', s: 'positive' as const }],
    },
    {
      id: '2', source: 'forum', date: 'May 10, 2025',
      content: 'I had to stop because the stomach issues were unbearable. I didn\'t lose any weight either.',
      dims: [{ d: 'tolerability', s: 'negative' as const }, { d: 'efficacy', s: 'negative' as const }],
    },
  ]
  return (
    <div className="rounded-2xl bg-white overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
      {/* Filter bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        {['All', 'positive', 'neutral', 'negative'].map((s, i) => (
          <span key={s} className="rounded-full px-2 py-0.5 text-[8px] font-medium capitalize"
            style={{
              backgroundColor: i === 0 ? '#0e0e0e' : '#f0f0f0',
              color: i === 0 ? '#fff' : '#6b6b6b',
              fontFamily: 'var(--font-heading)',
            }}>{s}</span>
        ))}
        <span className="ml-auto text-[8px] text-[#6b6b6b]">2 posts</span>
      </div>
      {/* Post grid */}
      <div className="grid grid-cols-2 gap-px bg-black/[0.04]">
        {posts.map(post => (
          <div key={post.id} className="bg-white px-4 py-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide bg-[#f0f0f0] text-[#6b6b6b]" style={{ fontFamily: 'var(--font-heading)' }}>
                {post.source}
              </span>
              <span className="ml-auto text-[7px] text-[#6b6b6b]/60">{post.date}</span>
            </div>
            <div className="relative max-h-10 overflow-hidden">
              <p className="text-[9px] text-[#0e0e0e] leading-relaxed">{post.content}</p>
              <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {post.dims.map(({ d, s }) => (
                <span key={d} className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[7px] font-semibold capitalize"
                  style={{ backgroundColor: `${DIM_COLOR[d]}12`, color: DIM_COLOR[d], fontFamily: 'var(--font-heading)' }}>
                  {d.replace(/_/g, ' ')}
                  <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: SENTIMENT[s] }} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Features Bento Grid ─────────────────────────────────────────────────── */
function Features() {
  return (
    <section className="py-24" style={{ backgroundColor: C.surface }}>
      <div className="w-full px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Sentiment Trends — 7 cols */}
          <div
            className="md:col-span-7 p-8 rounded-xl flex flex-col min-h-[400px]"
            style={{ backgroundColor: '#fff', border: `1px solid ${C.outline}1a`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >

            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)', color: C.onSurface }}>
              Sentiment Trends
            </h3>
            <p className="text-sm mb-8 max-w-md" style={{ color: C.onSurfaceVar }}>
              Track real-time shifts in patient perception across therapeutics and brands.
            </p>
            <div className="mt-auto rounded-lg">
              <MiniChartDark />
            </div>
          </div>

          {/* Side Effects — 5 cols */}
          <div
            className="md:col-span-5 rounded-xl p-4 overflow-hidden flex flex-col min-h-[400px]"
            style={{ backgroundColor: '#fff', border: `1px solid ${C.outline}1a`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* Label bar — compact, flush top */}
            <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <h3 className="text-2xl font-bold leading-tight" style={{ fontFamily: 'var(--font-heading)', color: C.onSurface }}>Side Effects</h3>
                <p className="text-sm mt-3" style={{ color: C.onSurfaceVar }}>Emergent adverse events from patient forums</p>
              </div>
            </div>
            {/* Panel fills the rest */}
            <div className="flex-1 flex flex-col">
              <SideEffectsList />
            </div>
          </div>

          {/* Post Evidence — full width */}
          <div
            className="md:col-span-12 p-10 md:p-12 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-10 relative overflow-hidden"
            style={{ backgroundColor: C.surface }}
          >
            <div
              className="absolute top-0 right-0 w-1/2 h-full pointer-events-none opacity-10"
              style={{ background: 'radial-gradient(circle at 80% 50%, #fff 0%, transparent 65%)' }}
            />
            <div className="flex-1 z-10 shrink-0 max-w-sm">
              <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                Post Evidence
              </h3>
              <p className="text-base leading-relaxed" style={{ color: C.secondary }}>
                Deep-dive into specific patient testimonials. Our NLP identifies intent, dosage
                mentions, and lifestyle correlations within raw text.
              </p>
            </div>
            <div className="flex-1 w-full z-10">
              <PostCards />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ── How It Works ────────────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Add an entity',    body: 'Input any drug name, therapeutic class, or specific medical condition you want to monitor.' },
  { n: '02', title: 'Data is processed', body: 'Our AI engine aggregates raw posts from Reddit, health forums, and social media for sentiment analysis.' },
  { n: '03', title: 'Explore insights', body: 'Access structured reports, sentiment dashboards, and side-effect correlations in one clean interface.' },
]

function HowItWorks() {
  return (
    <section className="p-24" style={{ backgroundColor: C.surfaceLow }}>
      <div className="w-full px-30">
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-extrabold"
            style={{ fontFamily: 'var(--font-heading)', color: C.onSurface }}
          >
            Three steps to real-time insights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 px-20">
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-sm"
                style={{ backgroundColor: '#fff' }}
              >
                <span
                  className="text-3xl font-black"
                  style={{ fontFamily: 'var(--font-heading)', color: `${C.primary}33` }}
                >
                  {s.n}
                </span>
              </div>
              <h4 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: C.onSurface }}>
                {s.title}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: C.onSurfaceVar }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Stats ───────────────────────────────────────────────────────────────── */
const STATS = [
  { value: '6+',    label: 'Dimensions Tracked' },
  { value: '100%',  label: 'Crowd-Sourced Evidence' },
  { value: 'Daily', label: 'Score Updates' },
]

function Stats() {
  return (
    <section className="py-16" style={{ backgroundColor: C.surfaceHighest }}>
      <div className="w-full px-100">
        <div className="flex flex-col md:flex-row justify-around items-center gap-12">
          {STATS.map((s, i) => (
            <div key={s.label} className="contents">
              <div className="text-center">
                <div
                  className="text-4xl font-black mb-2"
                  style={{ fontFamily: 'var(--font-heading)', color: C.primary }}
                >
                  {s.value}
                </div>
                <div
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: C.onSurfaceVar }}
                >
                  {s.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden md:block w-px h-12" style={{ backgroundColor: `${C.outline}4d` }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Banner ──────────────────────────────────────────────────────────── */
function CtaBanner() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: C.dark }}>
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)' }}
      />
      <div className="w-full px-8 text-center relative z-10">
        <h2
          className="text-4xl md:text-6xl font-extrabold mb-8"
          style={{ fontFamily: 'var(--font-heading)', color: C.surface }}
        >
          Start understanding drug sentiment today.
        </h2>
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12"
          style={{ color: `${C.surface}b3` }}
        >
          Join hundreds of researchers and pharmaceutical analysts using CrowdIndex to get the
          full picture of patient health.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block px-12 py-5 rounded-lg font-bold text-xl shadow-2xl transition-colors hover:bg-[#f6f3ec]"
          style={{ fontFamily: 'var(--font-heading)', backgroundColor: C.surface, color: C.onSurface }}
        >
          Get Started Now
        </Link>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Security', 'Methodology', 'Contact']

function Footer() {
  return (
    <footer style={{ backgroundColor: '#1c1c18', borderTop: '1px solid rgba(252,249,242,0.08)' }}>
      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-12 gap-8">
        <div className="flex flex-col gap-3">
          <span
            className="text-lg font-black"
            style={{ color: '#fcf9f2', fontFamily: 'var(--font-heading)' }}
          >
            CrowdIndex
          </span>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(252,249,242,0.4)' }}>
            © 2025 CrowdIndex Intelligence. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {FOOTER_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              className="text-[10px] uppercase tracking-widest transition-opacity hover:opacity-100"
              style={{ color: 'rgba(252,249,242,0.4)', fontFamily: 'var(--font-heading)' }}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
