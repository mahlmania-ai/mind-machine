import {useState} from 'react';
import {archiveArt} from './archiveArt';

const programs = [
  {label:'Trading hall', title:'A shared market floor', text:'A proposed home for futures research, commentary and desk-based teams. The market desk shows how a daily research session might work.', link:'/markets/', action:'Open the market desk'},
  {label:'Founder studios', title:'Workspaces for builders', text:'Founders and technical teams could develop ideas alongside people who understand markets. Shared worktables and access to compute are part of the proposal.', link:'/machine/', action:'Step into Machine'},
  {label:'Broadcast & events', title:'A floor with an audience', text:'Recording, publishing and live programs could give the community a public voice and give audiences a reason to return to LaSalle Street.', link:'/media/', action:'Explore publishing'},
  {label:'Data center', title:'Compute beneath the work', text:'The vision pairs the incubator with data-center support. Capacity, partners and physical delivery would belong to a later development phase.', link:'/services/', action:'Discuss the concept'}
];
export default function Floor(){
  const [active,setActive]=useState(0);
  const zone=programs[active];
  return <article className="mm-floor"><div className="floor-cover"><figure><img src={archiveArt.image} alt="Historical engraving of the trading floor in Chicago"/><figcaption>{archiveArt.caption}</figcaption></figure><div className="floor-cover-text"><p className="mm-overline">Chicago Board of Trade · Venue proposal</p><h1>The <i>Floor.</i></h1><p>A trading hall, a technology incubator and a place to gather on LaSalle Street.</p><a href="#program" className="mm-paper-btn">Explore the proposed floor ↓</a></div></div>
    <section id="program" className="floor-program"><div><p className="mm-overline">Proposed program</p><h2>Inside the hall</h2><p>Select a space to see how it could be used.</p><div className="floor-zone-list">{programs.map((z,i)=><button key={z.label} aria-pressed={active===i} onClick={()=>setActive(i)}>{z.label}<span aria-hidden="true">{active===i?'●':'○'}</span></button>)}</div></div>
    <div className="floor-board"><div className="floor-diagram" aria-label="Interactive conceptual arrangement">{programs.map((z,i)=><button key={z.label} className={'floor-zone zone-'+i} aria-pressed={active===i} onClick={()=>setActive(i)}><span>{z.label}</span></button>)}</div><small>Program diagram · illustrative arrangement</small><div aria-live="polite"><h3>{zone.title}</h3><p>{zone.text}</p><a className="mm-inline" href={zone.link}>{zone.action} ↗</a></div></div></section>
    <footer className="floor-source">Historical illustration from <a href={archiveArt.source}>{archiveArt.credit}</a>. The venue and programs shown here are proposals.</footer></article>
}
