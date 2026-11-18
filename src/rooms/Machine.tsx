import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import './machine-trading.css';

type Team = 'all' | 'research' | 'build' | 'studio';
type WorkItem = { id: string; name: string; team: Exclude<Team, 'all'>; detail: string; stage: number };
const initialWork: WorkItem[] = [
  { id: 'brief', name: 'The morning brief', team: 'research', detail: 'Bring the important signals into one clear view.', stage: 0 },
  { id: 'atlas', name: 'A world worth exploring', team: 'build', detail: 'Turn a spatial idea into an experience people can use.', stage: 1 },
  { id: 'story', name: 'The story behind the work', team: 'studio', detail: 'Give the idea a voice, a shape and a place in the world.', stage: 2 },
];
const stages = ['Frame', 'Build', 'Review', 'Ready'];
const teams: { id: Team; name: string; discipline: string; mark: string }[] = [
  { id: 'all', name: 'The whole machine', discipline: 'Direction & orchestration', mark: '◎' },
  { id: 'research', name: 'Intelligence', discipline: 'Research & context', mark: '⌁' },
  { id: 'build', name: 'Systems', discipline: 'Products & technology', mark: '⌘' },
  { id: 'studio', name: 'Studio', discipline: 'Stories & experiences', mark: '✳' },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    change(); query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return reduced;
}

class SceneBoundary extends Component<{ children: ReactNode; open: boolean }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className={`mt-vault-fallback ${this.props.open ? 'is-open' : ''}`} aria-hidden="true"><i/><b/><span>✳</span></div> : this.props.children; }
}

function Vault({ open, reduced }: { open: boolean; reduced: boolean }) {
  const door = useRef<Group>(null);
  const wheel = useRef<Group>(null);
  const core = useRef<Group>(null);
  useFrame((state, delta) => {
    if (door.current) door.current.rotation.y = reduced ? (open ? -1.48 : 0) : MathUtils.damp(door.current.rotation.y, open ? -1.48 : 0, 2.6, delta);
    if (wheel.current) wheel.current.rotation.z = reduced ? (open ? 1.4 : 0) : MathUtils.damp(wheel.current.rotation.z, open ? 1.4 : 0, 4, delta);
    if (core.current && !reduced) core.current.rotation.y = state.clock.elapsedTime * .12;
  });
  return <group position={[.45, -.1, 0]}>
    <ambientLight intensity={1.2}/><hemisphereLight args={['#d6e1e8', '#11181b', 1.7]}/>
    <pointLight position={[-4, 4, 6]} intensity={85} color="#fff0ca"/><pointLight position={[4, -1, 4]} intensity={24} color="#72959e"/>
    <pointLight position={[0, 0, -1]} intensity={15} color="#79e7d0"/>
    <mesh position={[0, 0, -2.5]}><boxGeometry args={[7, 6, .2]}/><meshStandardMaterial color="#07151a"/></mesh>
    {[-3.5, -2.9, 2.9, 3.5].map((x, i) => <mesh key={x} position={[x, 0, -.45]}><boxGeometry args={[i % 2 ? .19 : .35, 7, .6]}/><meshStandardMaterial color="#56605e" metalness={.72} roughness={.32}/></mesh>)}
    {[2.37, 2.53, 2.69].map((radius, i) => <mesh key={radius} position={[0, 0, -.1 - i * .1]}><torusGeometry args={[radius, i === 1 ? .13 : .055, 12, 100]}/><meshStandardMaterial color={i === 1 ? '#796449' : '#a59575'} metalness={.85} roughness={.25}/></mesh>)}
    <mesh position={[0, 0, -.45]}><torusGeometry args={[2.24, .18, 16, 100]}/><meshStandardMaterial color="#1d2f30" metalness={.8} roughness={.3}/></mesh>
    {Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return <mesh key={i} position={[2.57 * Math.cos(a), 2.57 * Math.sin(a), .05]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.045, .045, .09, 6]}/><meshStandardMaterial color="#d2b780" metalness={.9} roughness={.2}/></mesh>; })}
    <group position={[-2.15, 0, .12]} ref={door}><group position={[2.15, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[2.2, 2.2, .42, 96]}/><meshStandardMaterial color="#65716d" metalness={.88} roughness={.28}/></mesh>
      <mesh position={[0, 0, .22]}><torusGeometry args={[2.02, .055, 12, 96]}/><meshStandardMaterial color="#c0b08c" metalness={.9} roughness={.25}/></mesh>
      <mesh position={[0, 0, .235]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.75, 1.75, .03, 96]}/><meshStandardMaterial color="#354442" metalness={.72} roughness={.31}/></mesh>
      {[-1, 1].map(n => <mesh key={n} position={[0, n * 1.12, .3]}><boxGeometry args={[2.8, .09, .08]}/><meshStandardMaterial color="#9d9e86" metalness={.9} roughness={.2}/></mesh>)}
      <group ref={wheel} position={[0, -.05, .5]}><mesh><torusGeometry args={[.74, .065, 16, 72]}/><meshStandardMaterial color="#c7b58b" metalness={.95} roughness={.2}/></mesh>{[0, 1, 2].map(i => <mesh key={i} rotation={[0, 0, i * Math.PI / 3]}><boxGeometry args={[1.5, .085, .085]}/><meshStandardMaterial color="#b0a17e" metalness={.9} roughness={.2}/></mesh>)}<mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.19, .19, .14, 24]}/><meshStandardMaterial color="#d7c599" metalness={.9} roughness={.2}/></mesh></group>
      <mesh position={[0, 1.5, .32]}><boxGeometry args={[.72, .28, .035]}/><meshStandardMaterial color="#b79d68" metalness={.8} roughness={.3}/></mesh>
      {[-1.45, 1.45].map(y => <mesh key={y} position={[-2.08, y, .1]}><boxGeometry args={[.25, .58, .58]}/><meshStandardMaterial color="#878b73" metalness={.8} roughness={.25}/></mesh>)}
    </group></group>
    <group position={[0, -.1, -1.3]} ref={core}><mesh><icosahedronGeometry args={[.72, 1]}/><meshStandardMaterial color="#a7f6de" emissive="#58ae95" emissiveIntensity={.5} wireframe/></mesh>{[0, 1, 2].map(i => <mesh key={i} rotation={[i * .8, i * .7, .3]}><torusGeometry args={[1.05 + i * .15, .012, 6, 72]}/><meshBasicMaterial color={i === 1 ? '#d9bc7a' : '#6bb9aa'}/></mesh>)}</group>
    {[-1, 1].flatMap(side => [0, 1, 2].map(i => <group key={`${side}-${i}`} position={[side * (1.4 + i * .22), -.8 + i * .65, -1.5]}><mesh><boxGeometry args={[.32, .64, .3]}/><meshStandardMaterial color="#233c3d" metalness={.6} roughness={.3}/></mesh><mesh position={[0, .1, .16]}><boxGeometry args={[.22, .025, .01]}/><meshBasicMaterial color="#7ee4c6"/></mesh></group>))}
    <mesh position={[0, -2.45, .1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12, 10]}/><meshStandardMaterial color="#1b292a" metalness={.6} roughness={.3}/></mesh>
    {Array.from({ length: 11 }, (_, i) => <mesh key={i} position={[(i - 5) * .5, -2.43, -.3]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[.008, 7]}/><meshBasicMaterial color="#456b63"/></mesh>)}
  </group>;
}

export default function Machine() {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<Team>('all');
  const [work, setWork] = useState(initialWork);
  const [notice, setNotice] = useState('Select a team or move an example through the workflow.');
  const reduced = useReducedMotion();
  const desk = useRef<HTMLDivElement>(null);
  const visible = work.filter(item => team === 'all' || item.team === team);
  const selected = teams.find(t => t.id === team)!;
  const advance = (id: string) => { const item = work.find(w => w.id === id)!; const next = (item.stage + 1) % stages.length; setWork(items => items.map(w => w.id === id ? { ...w, stage: next } : w)); setNotice(`${item.name} moved to ${stages[next]}. This example is saved only for this visit.`); };
  return <main className="mt-room mt-machine">
    <section className={`mt-machine-hero ${open ? 'mt-vault-open' : ''}`} aria-labelledby="mt-machine-title">
      <div className="mt-architectural-lines" aria-hidden="true"/>
      <div className="mt-room-coordinate"><span>02 / THE MACHINE</span><span>CHICAGO · A WORKING VISION</span></div>
      <div className="mt-machine-copy"><p className="mt-kicker"><span/> MIND, MEET MOMENTUM.</p><h1 id="mt-machine-title">The<br/><em>Machine.</em></h1><p className="mt-room-intro">One place where the ideas,<br/>people and systems come together.</p><button className="mt-solid-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mt-machine-interior">{open ? 'Close the vault' : 'Open the vault'} <span aria-hidden="true">{open ? '−' : '↗'}</span></button><p className="mt-quiet-caption">A Chicago-inspired digital workshop.<br/>An imagined space, built for what comes next.</p></div>
      <div className="mt-vault-stage" role="img" aria-label={open ? 'An open steel vault reveals an illuminated circuit core and system racks.' : 'A three-dimensional steel vault with a brass wheel, inspired by Chicago financial architecture.'}><SceneBoundary open={open}><Suspense fallback={<div className="mt-vault-fallback" aria-hidden="true"><i/><b/><span>✳</span></div>}><Canvas camera={{ position: [0, .15, 8.4], fov: 44 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}><Vault open={open} reduced={reduced}/></Canvas></Suspense></SceneBoundary></div>
      {open && <div className="mt-vault-invitation"><span className="mt-signal-dot"/> THE WORKSHOP IS OPEN<button onClick={() => desk.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })}>Meet the machine <span aria-hidden="true">↓</span></button></div>}
      <div className="mt-machine-legend"><span>HUMAN DIRECTION</span><i/><span>MACHINE CAPABILITY</span><i/><span>ONE CONNECTED SYSTEM</span></div><span className="mt-architectural-note">ORIGINAL SPATIAL CONCEPT · NOT A SURVEY OF THE CBOT VAULT</span>
    </section>
    <div id="mt-machine-interior" ref={desk} className="mt-machine-interior" hidden={!open}>
      <div className="mt-section-heading"><div><p className="mt-kicker">INSIDE THE MACHINE</p><h2>Many disciplines.<br/><em>One direction.</em></h2></div><p>Chris sets the direction. Teams bring the context,<br/>craft and systems to move an idea forward.</p><span className="mt-outline-badge">WORKSPACE CONCEPT</span></div>
      <div className="mt-operations"><aside className="mt-team-nav" aria-label="Choose a workspace"><span className="mt-micro-label">WORKSPACES</span>{teams.map(t => <button key={t.id} onClick={() => { setTeam(t.id); setNotice(`${t.name} workspace selected.`); }} aria-pressed={team === t.id}><span className="mt-team-mark" aria-hidden="true">{t.mark}</span><span><strong>{t.name}</strong><small>{t.discipline}</small></span><span aria-hidden="true">↗</span></button>)}<div className="mt-team-foot"><span className="mt-signal-dot"/> Human review stays at the center.</div></aside>
        <section className="mt-workspace" aria-labelledby="mt-workspace-title"><div className="mt-workspace-heading"><div><span className="mt-micro-label">{selected.discipline}</span><h3 id="mt-workspace-title">{selected.name}</h3></div><button className="mt-text-button" onClick={() => { setWork(initialWork); setNotice('Example workflow reset.'); }}>Reset example ↺</button></div><div className="mt-workflow-map" aria-label="Example workflow stages">{stages.map((stage, i) => <div key={stage}><span className={work.some(w => w.stage === i) ? 'is-active' : ''}>{String(i + 1).padStart(2, '0')}</span><strong>{stage}</strong><small>{work.filter(w => w.stage === i).length} example{work.filter(w => w.stage === i).length !== 1 ? 's' : ''}</small></div>)}</div><div className="mt-work-list">{visible.map(item => <article key={item.id}><div className={`mt-work-symbol symbol-${item.team}`} aria-hidden="true">{teams.find(t => t.id === item.team)?.mark}</div><div><span className="mt-micro-label">{item.team}</span><h4>{item.name}</h4><p>{item.detail}</p></div><button className="mt-stage-button" onClick={() => advance(item.id)} aria-label={`Move ${item.name} from ${stages[item.stage]} to ${stages[(item.stage + 1) % stages.length]}`}><span>{stages[item.stage]}</span> →</button></article>)}</div><p className="mt-workspace-notice" role="status">{notice}</p></section>
      </div>
      <div className="mt-machine-destinations"><a href="/founder-os/"><span className="mt-micro-label">OPERATING SYSTEM</span><strong>Founder OS <span>↗</span></strong><p>Open the dedicated founder workspace.</p></a><a href="/dashboard/"><span className="mt-micro-label">YOUR OVERVIEW</span><strong>Personal dashboard <span>↗</span></strong><p>Bring your working worlds into one view.</p></a></div>
      <div className="mt-machine-bottom"><span>IDEA → CONTEXT → BUILD → HUMAN REVIEW</span><p>This room demonstrates an operating model. Its example tasks are not connected to people, agents or company systems.</p></div>
    </div>
  </main>;
}
