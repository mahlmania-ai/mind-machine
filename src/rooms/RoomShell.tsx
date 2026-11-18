import {lazy,Suspense,useEffect,useRef} from 'react';
import {screens,screenHref} from './directory';
import './rooms.css';

const Explore=lazy(()=>import('./Explore')), Machine=lazy(()=>import('./Machine')), Markets=lazy(()=>import('./TradingFloor')), Floor=lazy(()=>import('./Floor')), Work=lazy(()=>import('./WorkRoom')), Services=lazy(()=>import('./ServicesRoom')), Dashboard=lazy(()=>import('./Dashboard')), Guide=lazy(()=>import('./Guide'));
const About=lazy(()=>import('./Studio').then(m=>({default:m.About})));
const Software=lazy(()=>import('./Studio').then(m=>({default:m.Software})));
const Story=lazy(()=>import('./Studio').then(m=>({default:m.StoryRoom})));
function RestoreAnchor(){
 useEffect(()=>{
  const id=window.location.hash.slice(1);
  if(id)document.getElementById(id)?.scrollIntoView({block:'start'});
 },[]);
 return null;
}
const Eden=lazy(()=>import('./CreatorDesk'));
const Conducting=lazy(()=>import('./Integration').then(m=>({default:m.Conducting})));
const TradingReference=lazy(()=>import('./Integration').then(m=>({default:m.TradingReference})));
const Terminal=lazy(()=>import('./Terminal'));
const FloorLobby=lazy(()=>import('./FloorLobby'));
function Room({slug}:{slug:string}){
 switch(slug){
  case 'eden':return <Eden/>;
  case 'conducting':return <Conducting/>;
  case 'trading-reference':return <TradingReference/>;
  case 'explore':return <Explore/>;
  case 'machine':return <Machine/>;
  case 'markets':return new URLSearchParams(location.search).get('view')==='research'?<Markets/>:<Terminal/>;
  case 'floor':return new URLSearchParams(location.search).get('view')==='overview'?<Floor/>:<FloorLobby/>;
  case 'dashboard':return <Dashboard/>;
  case 'work':return <Work/>;
  case 'services':return <Services/>;
  case 'about':return <About/>;
  case 'software':return <Software/>;
  case 'guide':return <Guide/>;
  case 'history':case 'media':return <Story kind={slug}/>;
  default:return <section className="mm-page"><h1>Screen unavailable</h1><a href="/explore/">Explore all screens →</a></section>;
 }
}
export default function RoomShell({slug}:{slug:string}){
 const switcher=useRef<HTMLDetailsElement>(null);
 const name=slug==='explore'?'Explore':screens.find(s=>s.slug===slug)?.name||'Site guide';
 useEffect(()=>{
  document.title=name+' | Mahlmania.ai';
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&switcher.current?.open){switcher.current.open=false;switcher.current.querySelector('summary')?.focus()}};
  const outside=(e:PointerEvent)=>{if(switcher.current&&!switcher.current.contains(e.target as Node))switcher.current.open=false};
  document.addEventListener('keydown',onKey);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',outside)};
 },[name]);
 return <div className="mm-shell"><a className="skip-link" href="#screen">Skip to screen</a><header className="mm-top"><a className="mm-brand" href="/" aria-label="Mahlmania homepage">mahlmania<i>.ai</i></a><nav className="mm-topnav" aria-label="Site navigation"><a href="/explore/" aria-current={slug==='explore'?'page':undefined}>Explore</a><a href="/machine/" aria-current={slug==='machine'?'page':undefined}>Machine</a><a href="/work/" aria-current={slug==='work'?'page':undefined}>Work</a><details ref={switcher} className="mm-switch"><summary>All screens ▾</summary><div className="mm-switch-panel"><a href="/explore/">Screen directory</a>{screens.map(s=><a key={s.slug} href={screenHref(s.slug)} aria-current={s.slug===slug?'page':undefined}>{s.name}</a>)}</div></details></nav></header>
 <div id="screen" tabIndex={-1}><Suspense fallback={<p className="mm-page" role="status">Opening {name}…</p>}><Room slug={slug}/><RestoreAnchor/></Suspense></div><footer className="mm-foot"><a href="/explore/">← All screens</a>{slug==='machine'&&<a href='/conducting/'>Machine teams ↗</a>}{slug==='markets'&&<a href='/trading-reference/'>tastytrade screen library ↗</a>}<a href='/compare/'>Compare styles</a><a href='/guide/'>Site guide</a><a href="/about/">About & contact ↗</a></footer></div>
}
