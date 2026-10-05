import Link from 'next/link';

const features = [
  ['01','Real WebSocket','Test terhadap URL OCPP yang benar-benar digunakan CSMS.'],
  ['02','Protocol Frames','Visualisasi CALL, CALLRESULT, dan CALLERROR.'],
  ['03','Lifecycle','Boot, Available, Heartbeat, dan status connector.'],
  ['04','Observability','Connection state, latency, counter, dan event log.'],
  ['05','Configurable','Charge Point ID dan OCPP URL dapat diubah dari browser.'],
  ['06','CI Ready','Automated Node E2E tetap menjadi quality gate.']
];

export default function HomePage() {
  return <main className="shell">
    <header className="topbar">
      <div><p className="eyebrow">CSMS VOKSEL</p><h1>Charging Station Management System</h1>
      <p className="muted">Web-based OCPP 1.6J simulator untuk pengujian charger DC.</p></div>
      <div className="status-pill"><span className="dot"/> Development</div>
    </header>
    <section className="hero-grid">
      <div className="hero-card"><span className="label">OCPP TEST LAB</span>
        <h2>Simulasikan charger DC langsung dari browser.</h2>
        <p>Hubungkan browser ke OCPP WebSocket CSMS, jalankan BootNotification, StatusNotification, dan Heartbeat, lalu lihat frame secara live.</p>
        <Link className="primary-button" href="/charger-simulator">Open Charger Simulator →</Link>
      </div>
      <div className="architecture-card">
        <div className="mini-node">Browser Charger</div><div className="connector-line">OCPP 1.6J / WebSocket</div>
        <div className="mini-node">NestJS CSMS</div><div className="connector-line">Persistence</div>
        <div className="mini-node">PostgreSQL</div>
      </div>
    </section>
    <section className="feature-grid">{features.map(([n,t,d]) =>
      <article className="feature-card" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>
    )}</section>
  </main>;
}
