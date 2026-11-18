import { useId, useMemo, useState, type CSSProperties, type DragEvent } from 'react';
import './machine-trading.css';

type Market = { id: string; name: string; category: string; color: string; seed: number; questions: string[] };
const markets: Market[] = [
  { id: 'ES', name: 'S&P 500', category: 'EQUITY INDEX', color: '#9fceb6', seed: 2, questions: ['Breadth across sectors', 'Earnings and forward expectations', 'Rates and the economic calendar'] },
  { id: 'NQ', name: 'Nasdaq 100', category: 'EQUITY INDEX', color: '#9bbde7', seed: 5, questions: ['Index concentration', 'Technology earnings', 'Growth expectations and yields'] },
  { id: 'ZN', name: '10-Year Treasury', category: 'RATES', color: '#9bbde7', seed: 7, questions: ['Treasury auction calendar', 'Inflation and employment releases', 'Shape of the yield curve'] },
  { id: 'CL', name: 'Crude oil', category: 'ENERGY', color: '#d4b78b', seed: 9, questions: ['Inventory reports', 'Supply and demand estimates', 'Term structure and seasonal context'] },
  { id: 'GC', name: 'Gold', category: 'METALS', color: '#ddc079', seed: 3, questions: ['Real yields and the dollar', 'Physical and investment demand', 'Positioning across reporting periods'] },
  { id: 'ZC', name: 'Corn', category: 'AGRICULTURE', color: '#c9ce8b', seed: 6, questions: ['Crop and weather conditions', 'USDA supply and demand reports', 'Exports and seasonal context'] },
  { id: 'ZW', name: 'Wheat', category: 'AGRICULTURE', color: '#d8b880', seed: 4, questions: ['Crop conditions by region', 'Global supply and export reports', 'Cash markets and seasonal context'] },
  { id: 'ZS', name: 'Soybeans', category: 'AGRICULTURE', color: '#a9c8a1', seed: 8, questions: ['Crop progress and weather', 'Crush demand and exports', 'Global supply and demand reports'] },
];
type Range = '1D' | '1W' | '1M';
type View = 'chart' | 'research' | 'notes';
type Pane = { id: string; market: string; range: Range; view: View; notes: Record<string, string> };
const defaults: Pane[] = [
  { id: 'a', market: 'ES', range: '1M', view: 'chart', notes: {} },
  { id: 'b', market: 'ZC', range: '1W', view: 'chart', notes: {} },
  { id: 'c', market: 'GC', range: '1M', view: 'chart', notes: {} },
];
const STORAGE = 'mahlmania.floor.workspace.v1';
const EDITION = '18 NOV 2026';

function readWorkspace(): { panes: Pane[]; lead: string } {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
    if (saved && ['a', 'b', 'c'].includes(saved.lead) && Array.isArray(saved.panes) && saved.panes.length === 3 && new Set(saved.panes.map((p: Pane) => p.id)).size === 3 && saved.panes.every((p: Pane) => ['a', 'b', 'c'].includes(p.id) && markets.some(m => m.id === p.market) && ['1D', '1W', '1M'].includes(p.range) && ['chart', 'research', 'notes'].includes(p.view) && p.notes && typeof p.notes === 'object' && !Array.isArray(p.notes) && Object.entries(p.notes).every(([k, v]) => markets.some(m => m.id === k) && typeof v === 'string' && v.length <= 2500))) return saved;
  } catch { /* The desk works when local storage is unavailable. */ }
  return { panes: defaults, lead: 'a' };
}

// Deterministic illustrations, indexed instead of fabricated market quotes.
function referenceSeries(seed: number, range: Range) {
  const length = range === '1D' ? 28 : range === '1W' ? 40 : 58;
  return Array.from({ length }, (_, i) => 100 + i * (.055 + seed * .003) + Math.sin(i * .59 + seed) * .65 + Math.sin(i * 1.65 + seed) * .24 - Math.cos(i * .16) * .7);
}

function ReferenceChart({ market, range, large }: { market: Market; range: Range; large: boolean }) {
  const id = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);
  const series = useMemo(() => referenceSeries(market.seed, range), [market.seed, range]);
  const height = large ? 280 : 185;
  const min = Math.min(...series) - .7; const max = Math.max(...series) + .7;
  const x = (i: number) => 15 + i / (series.length - 1) * 570;
  const y = (n: number) => 20 + (max - n) / (max - min) * (height - 53);
  const line = series.map((n, i) => (i ? 'L' : 'M') + x(i).toFixed(2) + ',' + y(n).toFixed(2)).join(' ');
  const point = hover == null ? series.length - 1 : Math.max(0, Math.min(series.length - 1, hover));
  const labels = range === '1D' ? ['09:00', '11:00', '13:00', '15:00'] : range === '1W' ? ['MON', 'TUE', 'THU', 'FRI'] : ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4'];
  return <div className="mt-reference-chart">
    <div className="mt-chart-readout"><span><strong>{series[point].toFixed(2)}</strong> <small>DEMO INDEX</small></span><span>Illustrative units</span></div>
    <svg viewBox={'0 0 640 ' + height} role="img" aria-label={market.name + ', ' + range + ': synthetic index illustration, not market prices.'} onPointerLeave={() => setHover(null)} onPointerMove={e => { const bounds = e.currentTarget.getBoundingClientRect(); setHover(Math.round(((e.clientX - bounds.left) / bounds.width * 640 - 15) / 570 * (series.length - 1))); }}>
      <defs><linearGradient id={id + '-area'} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={market.color} stopOpacity=".16"/><stop offset="100%" stopColor={market.color} stopOpacity="0"/></linearGradient></defs>
      {[0, 1, 2, 3].map(i => { const value = min + (max - min) * i / 3; return <g key={i}><line x1="15" x2="588" y1={y(value)} y2={y(value)} stroke="#ffffff10"/><text x="601" y={y(value) + 4} fill="#8b999a" fontSize="11" fontFamily="monospace">{value.toFixed(1)}</text></g>; })}
      {labels.map((label, i) => <g key={label}><line x1={15 + i * 190} x2={15 + i * 190} y1="15" y2={height - 30} stroke="#ffffff08"/><text x={15 + i * 190} y={height - 8} textAnchor={i === 3 ? 'end' : 'start'} fill="#8b999a" fontSize="10" fontFamily="monospace">{label}</text></g>)}
      <path d={line + ' L585,' + (height - 30) + ' L15,' + (height - 30) + ' Z'} fill={'url(#' + id + '-area)'}/>
      <path d={line} fill="none" stroke={market.color} strokeWidth="2.3" vectorEffect="non-scaling-stroke"/>
      {hover != null && <line x1={x(point)} x2={x(point)} y1="15" y2={height - 30} stroke={market.color} opacity=".35" strokeDasharray="4 4"/>}
      <circle cx={x(point)} cy={y(series[point])} r="4" fill={market.color}/>
    </svg>
  </div>;
}

function MarketPane({ pane, lead, update, promote, drop, dragState }: { pane: Pane; lead: boolean; update: (patch: Partial<Pane>) => void; promote: () => void; drop: (source: string) => void; dragState: (id: string | null) => void }) {
  const market = markets.find(m => m.id === pane.market)!;
  const [over, setOver] = useState(false);
  const onDrop = (event: DragEvent) => { event.preventDefault(); setOver(false); dragState(null); drop(event.dataTransfer.getData('text/plain')); };
  return <article className={'mt-market-pane ' + (lead ? 'mt-pane-lead' : 'mt-pane-small') + (over ? ' mt-pane-over' : '')} style={{ '--market-color': market.color } as CSSProperties} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true); }} onDragLeave={() => setOver(false)} onDrop={onDrop} aria-label={market.name + (lead ? ' lead' : ' secondary') + ' pane'}>
    <header className="mt-pane-header"><div className="mt-pane-drag" draggable onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', pane.id); dragState(pane.id); }} onDragEnd={() => dragState(null)} title="Drag to swap panes"><span aria-hidden="true">⠿</span><span className="mt-pane-symbol">{market.id}</span></div><label className="mt-market-select"><span className="mt-visually-hidden">Market for pane {pane.id.toUpperCase()}</span><select value={pane.market} onChange={e => update({ market: e.target.value })}>{markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select><small>{market.category}</small></label>{lead ? <span className="mt-lead-label">LEAD</span> : <button className="mt-promote" onClick={promote} aria-label={'Make ' + market.name + ' the lead pane'} title="Make lead">↗<span>Make lead</span></button>}</header>
    <div className="mt-pane-tools"><div className="mt-pane-tabs" role="tablist" aria-label={market.name + ' views'}>{(['chart', 'research', 'notes'] as View[]).map(view => <button key={view} role="tab" id={pane.id + '-' + view + '-tab'} aria-selected={pane.view === view} aria-controls={pane.id + '-content'} tabIndex={pane.view === view ? 0 : -1} onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); const views: View[] = ['chart', 'research', 'notes']; const next = views[(views.indexOf(view) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]; update({ view: next }); document.getElementById(pane.id + '-' + next + '-tab')?.focus(); } }} onClick={() => update({ view })}>{view}</button>)}</div>{pane.view === 'chart' && <div className="mt-ranges" aria-label="Reference chart range">{(['1D', '1W', '1M'] as Range[]).map(range => <button key={range} onClick={() => update({ range })} aria-pressed={pane.range === range}>{range}</button>)}</div>}</div>
    <div id={pane.id + '-content'} role="tabpanel" aria-labelledby={pane.id + '-' + pane.view + '-tab'} className="mt-pane-content">
      {pane.view === 'chart' && <><ReferenceChart key={pane.market + '-' + pane.range} market={market} range={pane.range} large={lead}/>{lead && <div className="mt-chart-context"><div><span className="mt-micro-label">THE RESEARCH LENS</span><h3>Price needs perspective.</h3><p>Select Research to build context, or keep a thought in your desk notes.</p></div><div className="mt-chart-context-list">{market.questions.map((question, i) => <span key={question}><i>{String(i + 1).padStart(2, '0')}</i>{question}</span>)}</div></div>}</>}
      {pane.view === 'research' && <div className="mt-research-view"><span className="mt-micro-label">A STARTING POINT FOR {market.id}</span><h3>Questions before conclusions.</h3>{market.questions.map((question, i) => <div key={question}><span>{String(i + 1).padStart(2, '0')}</span><p>{question}</p><span aria-hidden="true">↗</span></div>)}<p className="mt-research-note">Research prompts only. News, COT positions and current market data are not connected in this reference edition.</p><button className="mt-text-button" onClick={() => update({ view: 'notes' })}>Start a desk note →</button></div>}
      {pane.view === 'notes' && <div className="mt-notes-view"><label htmlFor={pane.id + '-note'}>Your {market.name} desk note</label><textarea id={pane.id + '-note'} value={pane.notes[pane.market] || ''} maxLength={2500} placeholder="What do you see? What needs checking? What would change your view?" onChange={e => update({ notes: { ...pane.notes, [pane.market]: e.target.value } })}/><span>{(pane.notes[pane.market] || '').length}/2500 · Use “Save workspace” to keep notes on this device.</span></div>}
    </div>
    <footer className="mt-pane-footer"><span><i/> SYNTHETIC REFERENCE</span><span>{EDITION}</span></footer>
  </article>;
}

export default function TradingFloor() {
  const [initial] = useState(readWorkspace);
  const [panes, setPanes] = useState(initial.panes);
  const [lead, setLead] = useState(initial.lead);
  const [dragging, setDragging] = useState<string | null>(null);
  const [sources, setSources] = useState(false);
  const [message, setMessage] = useState('Drag panes to rearrange. Your markets, chart ranges and notes stay with each pane.');
  const ordered = [panes.find(p => p.id === lead)!, ...panes.filter(p => p.id !== lead)];
  const update = (id: string, patch: Partial<Pane>) => setPanes(items => items.map(item => item.id === id ? { ...item, ...patch } : item));
  const promote = (id: string) => { setLead(id); setMessage((markets.find(m => m.id === panes.find(p => p.id === id)?.market)?.name || 'Selected market') + ' is now the lead pane. Other pane settings are preserved.'); };
  const swap = (source: string, target: string) => {
    if (source === target || !panes.some(p => p.id === source)) return;
    if (target === lead) promote(source); else if (source === lead) promote(target); else setPanes(items => { const next = [...items]; const a = next.findIndex(p => p.id === source); const b = next.findIndex(p => p.id === target); [next[a], next[b]] = [next[b], next[a]]; return next; });
  };
  const save = () => { try { localStorage.setItem(STORAGE, JSON.stringify({ panes, lead })); setMessage('Workspace saved on this device. Notes are not sent to a server or synced to an account.'); } catch { setMessage('This browser could not save the workspace. Your notes remain available for this visit.'); } };
  return <main className="mt-room mt-trading">
    <section className="mt-trading-hero" aria-labelledby="mt-trading-title"><img src="/rooms/machine-trading/chicago-board-of-trade-1886.jpg" alt="An 1886 engraving of the Chicago Board of Trade interior, with traders gathered around octagonal pits."/><div className="mt-trading-photo-shade"/><div className="mt-room-coordinate"><span>03 / MARKETS & INTELLIGENCE</span><span>CHICAGO · THEN, NOW, NEXT</span></div><div className="mt-trading-copy"><p className="mt-kicker">A PLACE TO READ THE WORLD.</p><h1 id="mt-trading-title">The Trading<br/><em>Floor.</em></h1><p>Markets in focus. Context within reach.</p></div><a className="mt-archive-caption" href="https://commons.wikimedia.org/wiki/File:Old_Chicago_Board_of_Trade_Building,_Harper%27s_Monthly_V._73.jpg" target="_blank" rel="noreferrer"><span>FROM THE ARCHIVE</span>Chicago Board of Trade · Harper’s, July 1886 ↗</a></section>
    <section className="mt-desk" aria-labelledby="mt-desk-title"><div className="mt-desk-heading"><div><p className="mt-kicker">THE RESEARCH DESK</p><h2 id="mt-desk-title">Your view of the market.</h2></div><div className="mt-desk-actions"><button className="mt-outline-button" onClick={() => setSources(!sources)} aria-expanded={sources} aria-controls="mt-sources">Research sources {sources ? '−' : '+'}</button><button className="mt-solid-button" onClick={save}>Save workspace <span aria-hidden="true">↗</span></button></div></div>
      <div className="mt-reference-banner"><span className="mt-outline-badge">REFERENCE EDITION</span><p>Illustrative charts only · {EDITION} · No live prices or trading execution.</p><button className="mt-text-button" onClick={() => { setLead('a'); setMessage('Lead position reset. Your markets and notes are unchanged.'); }}>Reset layout ↺</button></div>
      {sources && <div id="mt-sources" className="mt-source-drawer"><a href="https://www.cmegroup.com/market-data.html" target="_blank" rel="noreferrer"><span>01 / EXCHANGE</span><strong>CME Group ↗</strong><p>Open market data and exchange resources.</p></a><a href="https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm" target="_blank" rel="noreferrer"><span>02 / POSITIONING</span><strong>CFTC reports ↗</strong><p>Open the official Commitments of Traders reports.</p></a><a href="https://www.hightowerreport.com/" target="_blank" rel="noreferrer"><span>03 / RESEARCH</span><strong>The Hightower Report ↗</strong><p>Open the independent research publisher.</p></a></div>}
      <div className="mt-market-ribbon" aria-label="Set the market in the lead pane">{markets.map(m => <button key={m.id} aria-pressed={panes.find(p => p.id === lead)?.market === m.id} onClick={() => { update(lead, { market: m.id }); setMessage(m.name + ' selected in the lead pane.'); }}><strong>{m.id}</strong><span>{m.name}</span><svg viewBox="0 0 70 26" aria-hidden="true"><polyline points={referenceSeries(m.seed, '1D').filter((_, i) => i % 2 === 0).map((n, i) => i * 5 + ',' + (25 - (n - 98) * 6)).join(' ')} fill="none" stroke={m.color} strokeWidth="1.4"/></svg></button>)}</div>
      <div className={'mt-workbench' + (dragging ? ' mt-is-dragging' : '')}>{ordered.map(pane => <MarketPane key={pane.id} pane={pane} lead={pane.id === lead} update={patch => update(pane.id, patch)} promote={() => promote(pane.id)} drop={source => swap(source, pane.id)} dragState={setDragging}/>)}</div>
      <p className="mt-desk-status" role="status">{message}</p>
      <div className="mt-floor-crosslink"><div><span className="mt-micro-label">BEYOND THE SCREEN</span><h3>A floor full of possibility.</h3><p>Explore the physical vision for markets, founders and technology.</p></div><a className="mt-outline-button" href="/floor/">Explore The Floor <span aria-hidden="true">↗</span></a></div>
    </section>
  </main>;
}
