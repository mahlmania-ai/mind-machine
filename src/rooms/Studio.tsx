import { useState } from 'react';
import { archiveArt } from './archiveArt';
import { screens, screenHref } from './directory';

const historySteps = [
  ['Source','Start with the object','An engraved view of the Chicago Board of Trade floor gives a researcher a specific image to cite. Its source record keeps the title, publication context and original link together.'],
  ['Evidence','Read the image closely','The engraving shows the arrangement of people inside an exchange hall. It can illustrate how a floor was represented. Identifying the people or the trades would require additional records.'],
  ['Story','Give the reader a way back','A caption can introduce the exchange floor, place the illustration in its historical setting and let the reader open the source. That traceable path is the idea behind the historical engine.'],
];
const mediaSteps = [
  ['Print','Chicago Scene','A publication can give a city’s venues, events and people a common place on the page. Chris’s role brought publishing, public relations and marketing together.'],
  ['Digital','From issue to invitation','Digital marketing connected the publication with its audience between issues and gave readers a route from a story to an event.'],
  ['Live','From readers to a room','New Year’s Eve at the Drake and the Chicago Scene Boat Party brought that audience together in person. Chris served as Director of Marketing & Events.'],
];
export function StoryRoom({kind}:{kind:'history'|'media'}){
 const history=kind==='history',steps=history?historySteps:mediaSteps;
 const [active,setActive]=useState(0);
 return <article className={'mm-page mm-story '+(history?'story-history':'story-media')}><header className="mm-intro"><p className="mm-overline">{history?'Software in development':'Publishing & live experiences'}</p><h1>{history?<>Historical <i>engine.</i></>:<>Media &amp; <i>publishing.</i></>}</h1><p>{history?'Explore a public source and follow what happens between an image and a publishable story.':'Explore how Chicago Scene connected a publication, its readers and the events they attended.'}</p></header>
  <div className="mm-story-layout"><figure className="mm-story-art">{history?<><img src={archiveArt.image} alt="Archival engraving of the Chicago Board of Trade floor"/><figcaption><a href={archiveArt.source}>{archiveArt.caption} ↗</a></figcaption></>:<><div className="mm-editorial-art" aria-hidden="true"><b>Chicago</b><em>Scene</em><div className="mm-sound-bars">{Array.from({length:36},(_,i)=><span style={{height:(18+Math.abs(Math.sin(i*3.87)*Math.cos(i*.17))*79)+'%'}} key={i}/>)}</div></div><figcaption>Editorial study for the Chicago Scene case story</figcaption></>}</figure>
  <div className="mm-story-card"><div className="mm-tabs">{steps.map((s,i)=><button key={s[0]} aria-pressed={i===active} onClick={()=>setActive(i)}>{s[0]}</button>)}</div><div aria-live="polite"><h2>{steps[active][1]}</h2><p>{steps[active][2]}</p></div><a className="mm-inline" href={history?archiveArt.source:'/work/?project=scene'}>{history?'Open the historical source':'Open the Chicago Scene case study'} ↗</a></div></div><a className="mm-text-action" href="/services/">{history?'Discuss a history commission':'Discuss a publishing project'} ↗</a></article>
}
export function Software(){
 return <article className="mm-page mm-software"><header className="mm-intro"><p className="mm-overline">Project library</p><h1>Software <i>studio.</i></h1><p>Open the applications, inspect the operating concepts and follow the builds.</p></header><div className="mm-software-list">{['atlas','founder-os','machine','history'].map((slug,i)=>{const s=screens.find(s=>s.slug===slug)!;return <a key={slug} href={screenHref(slug)}><div className={'mm-app-icon app-icon-'+slug} aria-hidden="true">{['◎','▦','⬡','¶'][i]}</div><div><small>{['Hosted application','Read-only sample workspace','Interactive concept','Product walkthrough'][i]}</small><h2>{s.name}</h2><p>{s.summary}</p></div><span aria-hidden="true">↗</span></a>})}</div><a className="mm-text-action" href="/work/#journal">Read the build journal ↗</a></article>
}
export function About(){
 return <article className="mm-page mm-about"><header className="mm-intro"><p className="mm-overline">About & contact</p><h1>Chris <i>Mahlmann.</i></h1><p>I bring strategy, creative direction, technology and live experiences together.</p></header><div className="mm-about-grid"><section><h2>Selected work</h2><p>At Chicago Scene, I connected publishing and marketing with live events. At Kumbuya, I worked on product direction and the business model. At Kannaway, my work spanned marketing, digital platforms and live production.</p><a className="mm-inline" href="/work/">See the projects ↗</a></section><section><h2>Work with me</h2><p>For a brand, a digital product, a publishing project or an event, send me a little about what you want to make.</p><a className="mm-inline" href="mailto:chris@mahlmania.ai">chris@mahlmania.ai ↗</a><a className="mm-text-action" href="/services/">Build a project brief →</a></section></div></article>
}
