import { useState } from 'react'
import './App.css'

const sectionConfig = {
  matched: {
    eyebrow: '01 / Strengths',
    title: 'Matched',
    empty: 'No direct matches were identified.',
  },
  gaps: {
    eyebrow: '02 / Watch list',
    title: 'Gaps',
    empty: 'No meaningful gaps were identified.',
  },
  opener: {
    eyebrow: '03 / Outreach',
    title: 'Suggested Opener',
  },
}

function AnalysisSection({ type, items, children }) {
  const config = sectionConfig[type]

  return (
    <section className={`analysis-section analysis-section--${type}`}>
      <div className="section-heading">
        <p className="section-eyebrow">{config.eyebrow}</p>
        <h2>{config.title}</h2>
      </div>
      {children || (
        <ul className="finding-list">
          {items.length ? items.map((item) => (
            <li key={item.requirement || item} className="finding-item">
              <span className="finding-mark" aria-hidden="true">+</span>
              <div>
                <strong>{item.requirement || item}</strong>
                {item.reason && <p>{item.reason}</p>}
              </div>
            </li>
          )) : <li className="empty-list">{config.empty}</li>}
        </ul>
      )}
    </section>
  )
}

function LoadingState() {
  return (
    <div className="status-panel" role="status">
      <span className="loader" aria-hidden="true" />
      <div>
        <strong>Reading the role...</strong>
        <p>Scraping the posting and comparing it with your profile. This can take a few seconds.</p>
      </div>
    </div>
  )
}

function App() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setCopied(false)

    try {
      new URL(url)
    } catch {
      setStatus('error')
      setError('Enter a complete job posting URL, including https://.')
      return
    }

    setStatus('loading')
    setAnalysis(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'The analysis could not be completed.')
      }

      setAnalysis(payload)
      setStatus('success')
    } catch (requestError) {
      setStatus('error')
      setError(requestError.message)
    }
  }

  async function copyOpener() {
    if (!analysis?.suggestedOpener) return
    await navigator.clipboard.writeText(analysis.suggestedOpener)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="JD Fit Checker home">
          <img src="/assets/images/JD-logo.jpg" alt="JD Fit Checker" className="wordmark-logo" />
          <span>JD Fit Checker</span>
        </a>
        <span className="topbar-note">Honest signal for your next move</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="kicker">Job description intelligence</p>
        <h1 id="page-title">Does this role<br /><em>actually fit?</em></h1>
        <p className="intro-copy">Drop in a job posting. Get a clear-eyed read on where your experience connects, where it does not, and how to start the conversation.</p>
      </section>

      <form className="analyzer-form" onSubmit={handleSubmit}>
        <label htmlFor="job-url">Job posting URL</label>
        <div className="input-row">
          <input
            id="job-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://company.com/careers/role"
            disabled={status === 'loading'}
            required
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Analyzing...' : 'Analyze fit'}
            <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </form>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <div className="status-panel status-panel--error" role="alert"><strong>Could not analyze this posting.</strong><p>{error}</p></div>}

      {status === 'idle' && (
        <div className="empty-state">
          <span className="empty-index">00</span>
          <p>Your analysis will appear here.<br />The profile is compared against the posting as written.</p>
        </div>
      )}

      {status === 'success' && analysis && (
        <div className="results" aria-live="polite">
          <div className="results-meta">
            <span>Analysis complete</span>
            {analysis.jobTitle && <strong>{analysis.jobTitle}</strong>}
          </div>
          <AnalysisSection type="matched" items={analysis.matched || []} />
          <AnalysisSection type="gaps" items={analysis.gaps || []} />
          <AnalysisSection type="opener" items={[]}>
            <div className="opener-box">
              <p>{analysis.suggestedOpener}</p>
              <button type="button" className="copy-button" onClick={copyOpener}>
                {copied ? 'Copied' : 'Copy opener'}
              </button>
            </div>
          </AnalysisSection>
        </div>
      )}

      <footer><span>JD Fit Checker</span><span>Built for honest applications</span></footer>
    </main>
  )
}

export default App