import { useCallback, useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react';
import Garden from './Garden';
import SplitText from './components/SplitText';
import { projects, type Project } from './projects';
import './hero-v3.css';

const Arrow = () => <span aria-hidden="true">↗</span>;
const AnimatedText = SplitText as ComponentType<any>;
const ChatIcon = () => <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 5h15a7 7 0 0 1 7 7v5a7 7 0 0 1-7 7H13l-8 5 2-7a7 7 0 0 1-5-7v-3a7 7 0 0 1 6-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>;
type IdeaId = 'markets' | 'media' | 'floor' | 'history';
const ideas: { id: IdeaId; label: string; title: string; subtitle: string; project: string }[] = [
  { id: 'markets', label: 'Markets', title: 'Markets & intelligence', subtitle: 'Research → Insight → Possibility', project: 'markets' },
  { id: 'media', label: 'Media', title: 'Media & experiences', subtitle: 'Stories → People → Places', project: 'scene' },
  { id: 'floor', label: 'The Floor', title: 'The Floor', subtitle: 'Markets → Founders → Technology', project: 'floor' },
  { id: 'history', label: 'History', title: 'Historical engine', subtitle: 'Research → Stories → Products', project: 'history' },
];

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!project) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.current?.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog.current?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [project]);
  return <dialog ref={dialog} className="project-dialog" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) onClose(); }} aria-labelledby="project-title">
    {project && <div className="project-detail">
      <button className="close-dialog" onClick={onClose} aria-label="Close project">×</button>
      <span className="eyebrow">{project.category}</span>
      <div className={`detail-visual visual-${project.id}`} aria-hidden="true"><span className="visual-orbit orbit-one"/><span className="visual-orbit orbit-two"/><span className="visual-core"/><span className="detail-number">{project.number}</span></div>
      <p className="detail-state">{project.state}</p>
      <h2 id="project-title">{project.name}</h2>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="role-block"><span className="eyebrow">MY ROLE / THE CONTEXT</span><p>{project.role}</p></div>
      <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
      <a className="button primary" href={`mailto:chris@mahlmania.ai?subject=${encodeURIComponent(`Let's talk about ${project.name}`)}`}>Start a conversation <Arrow /></a>
    </div>}
  </dialog>;
}

function BriefDialog({ open, draft, onDraftChange, onClose }: { open: boolean; draft: string; onDraftChange: (text: string) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [service, setService] = useState('Let’s figure it out together');
  const [timing, setTiming] = useState('');
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.current?.showModal(); document.body.style.overflow = 'hidden';
    return () => { dialog.current?.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, [open]);
  const body = `Hi Chris,\n\nHere’s what I’m imagining:\n${draft.trim()}\n\nI’d like help with: ${service}\nTiming: ${timing.trim() || 'Let’s discuss'}\n`;
  return <dialog ref={dialog} className="project-dialog brief-dialog" aria-labelledby="brief-title" aria-describedby="brief-intro" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) onClose(); }}>
    <div className="project-detail">
      <button className="close-dialog" onClick={onClose} aria-label="Close project brief">×</button>
      <p className="eyebrow">LET’S MAKE SOMETHING</p>
      <h2 id="brief-title">What are you imagining?</h2>
      <p id="brief-intro">A new business, a better experience, an idea you can’t stop thinking about. Start here.</p>
      <label className="brief-field" htmlFor="project-idea">Your idea<textarea id="project-idea" value={draft} onChange={e => onDraftChange(e.target.value)} placeholder="Tell me a little about it…" rows={5} autoFocus /></label>
      <label className="brief-field" htmlFor="project-service">What would help most?<select id="project-service" value={service} onChange={e => setService(e.target.value)}><option>Let’s figure it out together</option><option>Strategy & direction</option><option>Brand & creative</option><option>Technology & digital experiences</option><option>Media, events & community</option></select></label>
      <label className="brief-field" htmlFor="project-timing">Any timing in mind? <span>Optional</span><input id="project-timing" value={timing} onChange={e => setTiming(e.target.value)} placeholder="A launch date, or just exploring" /></label>
      <a className="button brief-send" href={`mailto:chris@mahlmania.ai?subject=${encodeURIComponent('An idea to explore together')}&body=${encodeURIComponent(body)}`}>Open email draft <Arrow /></a>
      <p className="brief-note">Review your message in your email app before sending.</p>
    </div>
  </dialog>;
}

export default function App() {
  const [moving, setMoving] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [selectedIdea, setSelectedIdea] = useState<IdeaId>('history');
  const [active, setActive] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const selectProject = useCallback((id: string) => { setActive(id); setMenu(false); }, []);
  const openBrief = () => { setBriefOpen(true); setMenu(false); };
  const selected = ideas.find(idea => idea.id === selectedIdea)!;
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setMoving(!query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('motion-paused', !moving); }, [moving]);
  useEffect(() => {
    if (!menu) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menu]);
  const submitIdea = (event: FormEvent) => { event.preventDefault(); openBrief(); };

  return <div className="site-shell v3-shell">
    <a className="skip-link" href="#work">Skip to selected work</a>
    <header className="v3-header">
      <a className="v3-wordmark" href="#home" aria-label="Mahlmania home">mahlmania.ai</a>
      <nav id="main-navigation" className={`v3-nav ${menu ? 'is-open' : ''}`} aria-label="Main navigation">
        <a href="/explore/" onClick={() => setMenu(false)}>All screens</a>
        <a href="/atlas/?welcome=0" onClick={() => setMenu(false)}>Atlas</a>
        <a href="/machine/">Machine</a>
        <a href="/work/">Work</a>
        <a href="/services/">Services</a>
        <a href="/floor/">The Floor</a>
      </nav>
      <button className="v3-start" onClick={openBrief}>Start a project</button>
      <a className="v3-chat" href="/guide/" aria-label="Open the site guide"><ChatIcon /></a>
      <button className="v3-menu" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="main-navigation">{menu ? 'Close' : 'Menu'} <span aria-hidden="true">{menu ? '−' : '+'}</span></button>
    </header>

    <main>
      <section id="home" className="v3-hero" aria-labelledby="hero-title">
        <Garden moving={moving} active={selectedIdea} />
        <div className="v3-copy">
          <h1 id="hero-title"><AnimatedText text="Mind +" tag="span" textAlign="left" trigger="load" effect="fade" delay={20} duration={.55} disabled={!moving} /><br/>Machine.</h1>
          <p>A universe of ideas. Built into reality.</p>
          <div className="v3-actions"><a className="v3-primary" href="/explore/">Explore the screens <span aria-hidden="true">→</span></a><button className="v3-secondary" onClick={openBrief}>Work with me</button></div>
        </div>
        <div className="idea-nodes" role="group" aria-label="Explore ideas">
          {ideas.map(idea => <button key={idea.id} className={`idea-node idea-${idea.id} ${selectedIdea === idea.id ? 'is-selected' : ''}`} onClick={() => setSelectedIdea(idea.id)} aria-pressed={selectedIdea === idea.id} aria-controls="idea-preview"><span className="idea-orb" aria-hidden="true"/>{idea.label}</button>)}
        </div>
        {selectedIdea === 'history' && <svg className="idea-trace" width="100%" height="100%" aria-hidden="true"><line x1="100%" y1="0" x2="0" y2="100%"/><circle cx="0" cy="100%" r="5"/></svg>}
        <article id="idea-preview" className={`idea-preview preview-${selectedIdea}`} aria-live="polite" aria-atomic="true">
          <img className="idea-thumbnail" src={selectedIdea === 'history' ? '/history-preview.jpg' : '/eden.jpg'} alt={selectedIdea === 'history' ? 'Illustrative interior from the creative concept' : 'Illustrated cosmic garden concept'} />
          <div className="idea-preview-copy"><h2>{selected.title}</h2><p>{selected.subtitle}</p><a className="v3-primary" href={'/'+selected.id+'/'}>Explore project <Arrow /></a></div>
        </article>
        <form className="idea-brief" onSubmit={submitIdea}>
          <ChatIcon /><label className="sr-only" htmlFor="idea-draft">What are you imagining?</label><input id="idea-draft" value={draft} onChange={e => setDraft(e.target.value)} placeholder="What are you imagining?" autoComplete="off" /><button type="submit" aria-label="Shape your project brief"><span aria-hidden="true">→</span></button>
        </form>
        <button className="v3-motion" onClick={() => setMoving(!moving)} aria-pressed={!moving} aria-label={moving ? 'Pause scene motion' : 'Resume scene motion'}><span aria-hidden="true">{moving ? 'Ⅱ' : '▷'}</span><span>{moving ? 'Pause motion' : 'Resume motion'}</span></button>
      </section>

      <section className="work-section section-wrap" id="work" aria-labelledby="work-title">
        <div className="section-heading"><div><p className="eyebrow">SELECTED WORK / 01—03</p><h2 id="work-title">Ideas, <em>out in the world.</em></h2></div><p>Different disciplines.<br/>One instinct to bring the pieces together.</p></div>
        <div className="work-grid">{projects.slice(0, 3).map(project => <button className="work-card" key={project.id} onClick={() => selectProject(project.id)}>
          <div className={`card-art visual-${project.id}`} aria-hidden="true"><span className="visual-orbit orbit-one"/><span className="visual-orbit orbit-two"/><span className="visual-core"/><span className="card-number">{project.number}</span><span className="art-caption">{project.id === 'kannaway' ? 'CONNECTED BY DESIGN' : project.id === 'kumbuya' ? 'RETHINK. THEN BUILD.' : 'PEOPLE MAKE THE PLACE.'}</span></div>
          <div className="card-copy"><span className="eyebrow">{project.category}</span><div className="card-name"><h3>{project.name}</h3><Arrow /></div><p>{project.title}</p></div>
        </button>)}</div>
      </section>

      <section className="approach-section section-wrap" id="approach" aria-labelledby="approach-title">
        <div className="approach-intro"><p className="eyebrow">MIND + MACHINE, AT WORK</p><h2 id="approach-title">Bring the idea.<br/><em>Let’s make it happen.</em></h2><p>I bring strategy, creative direction, technology, and live experiences together. My work spans brand and product launches, digital platforms, publishing, events, and hospitality operations.</p><a className="text-link" href="mailto:chris@mahlmania.ai">Tell me what you’re imagining <Arrow /></a></div>
        <div className="service-list">{[
          ['01', 'Find the right direction.', 'Research, business strategy, brand positioning, and a clear plan for what to build.'],
          ['02', 'Build the experience.', 'Bring creative direction, digital products, content, and useful systems into one connected experience.'],
          ['03', 'Bring people together.', 'Launches, media, communities, and live events that give the work a place in the world.']
        ].map(([n, title, description]) => <article key={n}><span className="service-number">{n}</span><div><h3>{title}</h3><p>{description}</p></div><span className="service-plus" aria-hidden="true">+</span></article>)}</div>
      </section>

      <section className="floor-section section-wrap" aria-labelledby="floor-title"><div><p className="eyebrow">ON THE HORIZON / CHICAGO</p><h2 id="floor-title">A floor full<br/>of <em>possibility.</em></h2></div><div className="floor-copy"><p>A vision for the Chicago Board of Trade. Markets, founders, technology, media, and a community of people making things happen.</p><a className="button outline" href="/floor/">Explore The Floor <Arrow /></a><span className="concept-label">A vision in development</span></div><div className="floor-lines" aria-hidden="true"/></section>
    </main>
    <footer className="site-footer section-wrap"><a className="wordmark" href="#home">mahlmania<span className="wordmark-ai">.ai</span></a><p>Mind, meet possibility.</p><a href="mailto:chris@mahlmania.ai">chris@mahlmania.ai <Arrow /></a><div className="footer-bottom"><span>© {new Date().getFullYear()} Chris Mahlmann</span><a href="/explore/">All screens</a><a href="/about/">About & contact</a><a href="/THIRD-PARTY-NOTICES.txt">Credits</a><a href="#home">Back to the garden ↑</a></div></footer>
    <ProjectDialog project={projects.find(p => p.id === active) || null} onClose={() => setActive(null)} />
    <BriefDialog open={briefOpen} draft={draft} onDraftChange={setDraft} onClose={() => setBriefOpen(false)} />
  </div>;
}
