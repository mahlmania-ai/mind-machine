import { useState } from 'react';
import { screens, screenHref } from './directory';

type Priority = {id:string; text:string; done:boolean};
type Desk = {pins:string[]; priorities:Priority[]};
const key = 'mahlmania.personal-desk.v1';
const defaults: Desk = {pins:['machine','markets','founder-os','atlas'], priorities:[]};
function restore():Desk {
  try {
    const d=JSON.parse(localStorage.getItem(key)||'null');
    if (!d || !Array.isArray(d.pins) || !Array.isArray(d.priorities)) return defaults;
    return {pins:[...new Set<string>(d.pins.filter((s:unknown)=>screens.some(r=>r.slug===s && r.slug!=='dashboard')))], priorities:d.priorities.filter((x:Priority)=>x && typeof x.id==='string' && typeof x.text==='string' && typeof x.done==='boolean')};
  } catch {return defaults}
}
export default function Dashboard(){
  const [desk,setDesk]=useState<Desk>(restore), [editing,setEditing]=useState(false), [draft,setDraft]=useState(''), [storageOk,setStorageOk]=useState(true);
  function save(next:Desk){setDesk(next);try{localStorage.setItem(key,JSON.stringify(next));setStorageOk(true)}catch{setStorageOk(false)}}
  const changePin=(id:string)=>save({...desk,pins:desk.pins.includes(id)?desk.pins.filter(x=>x!==id):[...desk.pins,id]});
  const outstanding=desk.priorities.filter(p=>!p.done).length;
  return <div className="mm-page mm-desk"><header className="mm-intro"><p className="mm-overline">Personal workspace</p><h1>My <i>dashboard.</i></h1><p>{new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'America/Chicago'}).format(new Date())} · Chicago</p></header>
  <div className="mm-desk-layout"><section className="mm-desk-card"><div className="mm-section-title"><h2>Pinned screens</h2><button className="mm-smallbtn" onClick={()=>setEditing(!editing)} aria-expanded={editing}>{editing?'Done':'Edit pins'}</button></div>
  {editing ? <div className="mm-pinchoices">{screens.filter(s=>s.slug!=='dashboard').map(s=><label key={s.slug}><input type="checkbox" checked={desk.pins.includes(s.slug)} onChange={()=>changePin(s.slug)}/>{s.name}</label>)}</div> : <div className="mm-pins">{desk.pins.map(id=>{const s=screens.find(r=>r.slug===id)!;return <a href={screenHref(id)} key={id}><small>{s.group}</small><strong>{s.name} ↗</strong></a>})}{!desk.pins.length && <p>Choose Edit pins to add a screen.</p>}</div>}</section>
  <section className="mm-desk-card"><div className="mm-section-title"><h2>Priorities</h2><small>{outstanding} open</small></div><form className="mm-priority-form" onSubmit={e=>{e.preventDefault();if(!draft.trim())return;save({...desk,priorities:[...desk.priorities,{id:crypto.randomUUID(),text:draft.trim(),done:false}]});setDraft('')}}><label className="mm-sr" htmlFor="priority">New priority</label><input id="priority" maxLength={250} value={draft} placeholder="Add a priority" onChange={e=>setDraft(e.target.value)}/><button className="mm-smallbtn" disabled={!draft.trim()}>Add</button></form>
  {!desk.priorities.length && <p className="mm-muted">Your list is clear.</p>}<ul className="mm-priorities">{desk.priorities.map(p=><li key={p.id}><label><input type="checkbox" checked={p.done} onChange={()=>save({...desk,priorities:desk.priorities.map(x=>x.id===p.id?{...x,done:!x.done}:x)})}/><span>{p.text}</span></label><button aria-label={'Remove '+p.text} onClick={()=>save({...desk,priorities:desk.priorities.filter(x=>x.id!==p.id)})}>×</button></li>)}</ul></section></div>
  <p className="mm-muted" role="status">{storageOk?'Your pins and priorities are saved in this browser on this device.':'Browser storage is unavailable. Changes will last for this visit.'}</p></div>
}
