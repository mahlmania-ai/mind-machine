import { useState } from 'react';
import { screens, screenHref } from './directory';

const featured = ['machine', 'markets', 'floor'];
export default function Explore() {
  const [group,setGroup] = useState('All');
  const [text,setText] = useState(() => new URLSearchParams(location.search).get('q') || '');
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const rows = screens.filter(s => (group === 'All' || s.group === group) && words.every(w => (s.name+' '+s.summary+' '+s.keywords).toLowerCase().includes(w)));
  return <div className="mm-page mm-explore">
    <header className="mm-intro"><p className="mm-overline">Mahlmania.ai</p><h1>Explore the <i>screens.</i></h1><p>Step inside a world, open your workspace, or see how a project came together.</p></header>
    <div className="mm-features">{featured.map(slug => { const s = screens.find(s => s.slug === slug)!; return <a href={screenHref(slug)} className={'mm-feature feature-'+slug} key={slug}>
      <div className="feature-art" aria-hidden="true">{Array.from({length: 14},(_,i)=><b key={i} style={{'--i':i} as React.CSSProperties}/>)}</div><div><span>{s.name}</span><span aria-hidden="true">↗</span></div></a>})}</div>
    <section className="mm-library" aria-label="Screen directory"><div className="mm-tools"><div className="mm-tabs">{['All','Worlds','Workspace','Studio'].map(x=><button key={x} type="button" aria-pressed={group===x} onClick={()=>setGroup(x)}>{x}</button>)}</div><label className="mm-search"><span className="mm-sr">Find a screen</span><input type="search" placeholder="Find a screen" value={text} onChange={e=>setText(e.target.value)}/></label></div>
    <div className="mm-directory" aria-live="polite">{rows.map(s=><a href={screenHref(s.slug)} key={s.slug}><small>{s.group}</small><h2>{s.name}<span aria-hidden="true">↗</span></h2><p>{s.summary}</p></a>)}{!rows.length && <p>No screens match. <button className="mm-inline" onClick={()=>{setText('');setGroup('All')}}>Show all screens</button></p>}</div></section>
  </div>;
}
