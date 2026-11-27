import { RecordScreen } from './screens/RecordScreen'
import { Preview } from './screens/Preview'

export default function App() {
  const params = new URLSearchParams(location.search)
  if (import.meta.env.DEV && params.has('preview')) return <Preview state={params.get('preview') ?? 'ready'} />
  if (location.pathname.startsWith('/timeline')) return <TimelineSoon />
  return <RecordScreen />
}

function TimelineSoon() {
  return (
    <main className="screen" style={{ gridTemplateRows: 'auto 1fr' }}>
      <header className="topbar">
        <h1 className="date">Timeline</h1>
        <a className="pill" href="/">
          Record
        </a>
      </header>
      <section className="lead">
        <h2 className="lead-text">Your timeline isn’t built yet.</h2>
        <p className="sub">Entries you save are kept on your server and will appear here once this view exists.</p>
      </section>
    </main>
  )
}
