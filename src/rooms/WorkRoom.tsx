import {briefHref} from '../registry';
import { useEffect, useState } from 'react';
import { workCases, type WorkCase } from './workCases';
import './work-services.css';

const Arrow = () => <span aria-hidden="true">↗</span>;
const caseFromLocation = () => workCases.find(item => item.id === new URLSearchParams(window.location.search).get('project')) ?? workCases[0];

function ScopeMap({ project }: { project: WorkCase }) {
  return <div className={`folio-scope scope-${project.id}`} aria-label={`Work scope for ${project.name}`}>
    <span className="folio-map-label">THE PIECES OF THE WORK</span>
    <div className="folio-scope-core"><span aria-hidden="true">✳</span><strong>{project.name}</strong></div>
    <div className="folio-scope-items">{project.scope.map((item, index) => <span key={item}><small>{String(index + 1).padStart(2, '0')}</small>{item}</span>)}</div>
    <span className="folio-map-note">Scope illustration</span>
  </div>;
}

export function WorkRoom() {
  const [selected, setSelected] = useState(caseFromLocation);
  const [filter, setFilter] = useState('All work');
  useEffect(() => {
    const update = () => { setSelected(caseFromLocation()); setFilter('All work'); };
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  const visible = workCases.filter(item => filter === 'All work' || item.category === filter);

  return <div className="folio-room work-room">
    <section className="folio-intro" aria-labelledby="work-room-title">
      <div><p className="folio-kicker">CHRIS MAHLMANN / SELECTED WORK</p><h1 id="work-room-title">Ideas, <em>out in<br/>the world.</em></h1></div>
      <div className="folio-intro-aside"><p>Strategy, creative direction, technology and live experiences. The work is in bringing the pieces together.</p><a href="/services/" className="folio-link">What we can make next <Arrow /></a></div>
    </section>
    <section className="folio-index" aria-labelledby="case-index-title">
      <div className="folio-index-heading"><h2 id="case-index-title">Explore the work</h2><div className="folio-filters" role="group" aria-label="Filter selected work">{['All work', 'Brand & digital', 'Media & experiences'].map(item => <button key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="folio-case-links">{visible.map(project => <a key={project.id} href={`/work/?project=${project.id}#case-study`} className={selected.id === project.id ? 'is-active' : ''} aria-current={selected.id === project.id ? 'true' : undefined} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault(); window.history.pushState({}, '', `/work/?project=${project.id}#case-study`); setSelected(project);
        document.getElementById('case-study')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        document.getElementById('case-study')?.focus({ preventScroll: true });
      }}><span className="folio-case-number">{String(workCases.indexOf(project) + 1).padStart(2, '0')}</span><span><strong>{project.name}</strong><small>{project.eyebrow}</small></span><Arrow /></a>)}</div>
      <p className="folio-filter-status" role="status">{visible.length} {visible.length === 1 ? 'story' : 'stories'} · {filter}</p>
    </section>
    <article className="folio-case-study" id="case-study" tabIndex={-1} aria-labelledby="case-study-title">
      <div className="folio-case-top"><div className="folio-case-lead"><p className="folio-kicker">{selected.eyebrow}</p><h2 id="case-study-title">{selected.name}</h2><h3>{selected.title}</h3><p>{selected.summary}</p><span className="folio-status"><span aria-hidden="true"/> Selected professional work</span></div><ScopeMap project={selected} /></div>
      <div className="folio-case-body"><section><span className="folio-detail-number">01 / CONTEXT</span><h3>Where it began.</h3><p>{selected.context}</p></section><section><span className="folio-detail-number">02 / APPROACH</span><h3>How the pieces connected.</h3><p>{selected.approach}</p></section><section><span className="folio-detail-number">03 / WORK DELIVERED</span><h3>What took shape.</h3><p>{selected.delivery}</p></section></div>
      <div className="folio-role"><div><p className="folio-kicker">MY ROLE</p><p>{selected.role}</p></div><a className="folio-button" href={briefHref(selected.id)}>Discuss a similar project <Arrow /></a></div>
      <div className="folio-takeaway"><span aria-hidden="true">↳</span><p>{selected.takeaway}</p></div>
    </article>
    <section className="folio-next" aria-labelledby="work-next-title"><div><p className="folio-kicker">THE THREAD CONTINUES</p><h2 id="work-next-title">New tools.<br/><em>The same curiosity.</em></h2></div><div><p>Current explorations connect research, software, storytelling and physical spaces. Each has its own stage of development.</p><div className="folio-next-links"><a href="/history/">Historical engine <Arrow /></a><a href="/media/">Media & storytelling <Arrow /></a><a href="/floor/">The Floor · a developing vision <Arrow /></a></div></div></section>
    <section className="folio-journal" id="journal" aria-labelledby="journal-title"><div className="folio-index-heading"><div><p className="folio-kicker">BUILD JOURNAL</p><h2 id="journal-title">From the workbench.</h2></div><span className="folio-journal-note">Released work, with a trail.</span></div>
      <article className="folio-release"><time dateTime="2026-11-18">18 NOV 2026</time><div><span className="folio-release-tag">PROTECTED REVIEW EDITION</span><h3>Mind + Atlas, under one roof.</h3><p>The creative garden and Atlas now share one site. The garden connects the portfolio and its ideas; Atlas adapts the existing God’s Eye View application with its source attribution intact.</p><div className="folio-release-links"><a href="/">Visit Mind <Arrow /></a><a href="/atlas/?welcome=0">Open Atlas <Arrow /></a><a href="https://github.com/mahlmania-ai/mind-machine/commit/34cd818f7aedb1952bddf9928a6aee65a8387833" target="_blank" rel="noreferrer">Release source <Arrow /></a></div></div><span className="folio-release-mark" aria-hidden="true">M<span>+</span>M</span></article>
    </section>
    <div className="folio-footnote"><p>Past-work descriptions draw on Chris Mahlmann’s 2024 executive profile. Scope maps illustrate the work; they are not client screenshots.</p><a href="/about/">More about Chris <Arrow /></a></div>
  </div>;
}

export default WorkRoom;
