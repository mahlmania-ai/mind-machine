import React,{useState} from 'react';
import {Eden as Canvas} from './Integration';
import './creatorDesk.css';

const host='https://eden.so';
const people=[
 ['ali','Ali Abdaal','YouTube','Productivity','/features/study/cards/ali-avatar.jpg'],
 ['charlotte','Charlotte Fraza','YouTube','Research','/features/discover/cards/fraza-avatar.jpg'],
 ['greg','Greg Isenberg','Instagram','Business','/creators/gregisenberg-ig-avatar.jpg'],
 ['ronin','Ronin','X','Business','/features/discover/cards/ronin-avatar.jpg'],
 ['diogo','Diogo','X','Writing','/features/discover/cards/diogo-avatar.jpg']
];
const posts=[
 ['ali','Passive income ideas',13900000,471,'/features/study/cards/ali-passive.jpg'],
 ['ali','Typing at 156 words per minute',11000000,372,'/features/study/cards/ali-typing.jpg'],
 ['ali','Investing for beginners',9400000,319,'/features/study/cards/ali-invest.jpg'],
 ['charlotte','Researching a topic like a PhD student',683000,28,'/features/discover/cards/fraza-thumb.jpg'],
 ['greg','The future of startups',572000,349,'/creators/gregisenberg-startups.jpg'],
 ['ronin','A system for publishing across ten accounts',1100000,15,''],
 ['diogo','Approaching creative work with curiosity',81000,1407,'']
];
const pageURL=(view,id)=>'/eden/?view='+encodeURIComponent(view)+(id?'&id='+encodeURIComponent(id):'');
const display=n=>Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(n);
function useLocal(key,fallback){
 const [state,set]=useState(()=>{try{const x=JSON.parse(localStorage.getItem(key));return x??fallback}catch{return fallback}});
 const [failed,F]=useState(false);
 function update(next){set(next);try{localStorage.setItem(key,JSON.stringify(next));F(false)}catch{F(true)}}
 return [state,update,failed];
}
export default function CreatorDesk(){
 const par=new URLSearchParams(location.search),panel=par.get('view')||'creators',id=par.get('id'),person=people.find(x=>x[0]===id);
 const [theme,T,themeError]=useLocal('mm.eden.mode','light'),[saved,S,saveError]=useLocal('mm.eden.library',[]),[lists,L,listError]=useLocal('mm.eden.lists',[{id:'daily',name:'Daily reading',people:[]}]);
 const [query,Q]=useState(''),[platform,P]=useState('All platforms'),[order,O]=useState('Top viewed'),[name,N]=useState(''),[chosen,C]=useState('daily');
 const list=lists.find(x=>x.id===id), grouping=lists.find(x=>x.id===chosen);
 const creatorFilter=x=>(platform==='All platforms'||x[2]===platform)&&(x.slice(1,4).join(' ').toLowerCase().includes(query.toLowerCase()));
 const title=panel==='profile'&&person?person[1]:panel==='list'&&list?list.name:({discover:'Discover',creators:'Creators',lists:'Creator lists',library:'Library',board:'Idea canvas'}[panel]||'Creators');
 const shown=posts.filter(([creator,t])=>{const p=people.find(a=>a[0]===creator);return (platform==='All platforms'||p[2]===platform)&&(t+' '+p[1]).toLowerCase().includes(query.toLowerCase())&&(panel!=='profile'||creator===id)&&(panel!=='library'||saved.includes(t))&&(panel!=='list'||list?.people.includes(creator))}).sort((a,b)=>order==='Title'?a[1].localeCompare(b[1]):order==='Top outlier'?b[3]-a[3]:b[2]-a[2]);
 const nav=(v,label)=><a key={v} aria-current={panel===v?'page':undefined} href={pageURL(v)}>{label}</a>;
 function postCard(row){const [k,t,views,m,img]=row,p=people.find(x=>x[0]===k);return <article className="ed-card" key={t}>{img&&<img className="ed-thumb" src={host+img} alt=""/>}<div className="ed-pad"><a className="ed-by" href={pageURL('profile',k)}><img src={host+p[4]} alt=""/>{p[1]} <small>{p[2]}</small></a><h3>{t}</h3><footer><span>{display(views)} views · {m}×</span><button aria-pressed={saved.includes(t)} onClick={()=>S(saved.includes(t)?saved.filter(x=>x!==t):[...saved,t])}>{saved.includes(t)?'Saved':'Save'}</button></footer></div></article>}
 return <main className={'creator-desk '+(theme==='dark'?'night':'')}><aside className="ed-side"><a className="ed-brand" href={pageURL('creators')}>Creator workspace</a><small>Workspace</small>{nav('discover','Discover')}{nav('creators','Creators')}{nav('lists','Lists')}{nav('library','Library')}{nav('board','Idea canvas')}<small>Design review</small><a href="/compare/?screen=Eden%20creators">Compare Founder OS styles ↗</a><a href="/founder-os/" target="_blank" rel="noreferrer">Open Founder OS ↗</a></aside><section className="ed-main"><header><span>Workspace　/　{title}</span><button onClick={()=>T(theme==='dark'?'light':'dark')}>{theme==='dark'?'Light mode':'Dark mode'}</button></header><div className="ed-page"><div className="ed-title">{person&&panel==='profile'&&<img className="ed-avatar" src={host+person[4]} alt=""/>}<div><h1>{title}</h1><p>{panel==='creators'?'Study a creator’s work and add their feed to a reading list.':panel==='profile'&&person?person[2]+' · '+person[3]:panel==='library'?'Posts you’ve saved in this browser.':panel==='list'?'A combined feed from the creators on this list.':panel==='lists'?'Organize creators into feeds you can revisit.':panel==='discover'?'Browse posts from the creator research collection.':''}</p></div></div>
 {(themeError||saveError||listError)&&<p role="status">Browser storage is unavailable. Changes last for this visit.</p>}
 {panel==='board'?<Canvas/>:panel==='lists'?<><form className="ed-tools" onSubmit={e=>{e.preventDefault();if(!name.trim())return;const uid=crypto.randomUUID();L([...lists,{id:uid,name:name.trim(),people:[]}]);N('')}}><input aria-label="New list name" value={name} maxLength={80} onChange={e=>N(e.target.value)} placeholder="New list name" required/><button>Create list</button></form><div className="ed-grid">{lists.map(x=><a className="ed-card ed-pad" key={x.id} href={pageURL('list',x.id)}><h3>{x.name}</h3><small>{x.people.length} creators　→</small></a>)}</div></>:<>
 {panel==='profile'&&person&&<div className="ed-tools"><select aria-label="Creator list" value={chosen} onChange={e=>C(e.target.value)}>{lists.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><button disabled={!grouping} onClick={()=>L(lists.map(x=>x.id===chosen?{...x,people:x.people.includes(id)?x.people.filter(p=>p!==id):[...x.people,id]}:x))}>{grouping?.people.includes(id)?'Remove from list':'Add to list'}</button><a href={pageURL('list',chosen)}>View list ↗</a></div>}
 <div className="ed-tools"><input aria-label="Search" placeholder={panel==='creators'?'Search creators or topics':'Search posts'} value={query} onChange={e=>Q(e.target.value)}/>{panel!=='profile'&&<select aria-label="Filter by platform" value={platform} onChange={e=>P(e.target.value)}>{['All platforms','YouTube','Instagram','X'].map(x=><option key={x}>{x}</option>)}</select>}{panel!=='creators'&&<select aria-label="Sort posts" value={order} onChange={e=>O(e.target.value)}>{['Top viewed','Top outlier','Title'].map(x=><option key={x}>{x}</option>)}</select>}</div>
 {panel==='creators'?<div className="ed-grid">{people.filter(creatorFilter).map(([k,n,pl,t,img])=><a className="ed-card ed-person" key={k} href={pageURL('profile',k)}><img className="ed-avatar" src={host+img} alt=""/><small>{pl}</small><h3>{n}</h3><p>{t}</p><footer><span>{posts.filter(r=>r[0]===k).length} reference posts</span><b>View creator →</b></footer></a>)}{!people.some(creatorFilter)&&<p>No creators match this search.</p>}</div>:<div className="ed-grid">{shown.map(postCard)}{shown.length===0&&<p>{panel==='library'?'Save a post in Discover to see it here.':panel==='list'?'Add a creator from their profile to populate this feed.':'No matching posts.'} <a href={pageURL(panel==='list'?'creators':'discover')}>Browse ↗</a></p>}</div>}</>}
 {panel!=='board'&&<p className="ed-source">Reference collection from <a href="https://eden.so/" target="_blank" rel="noreferrer">Eden’s public demo</a>. Metrics reflect its published examples.</p>}</div></section></main>
}
