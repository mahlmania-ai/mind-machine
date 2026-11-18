import {records,briefHref,evidenceHref} from '../registry';
export function ProjectRecords({query='',ids}:{query?:string;ids?:string[]}){
 const list=records.filter(p=>(!ids||ids.includes(p.id))&&query.trim().toLowerCase().split(/\s+/).every(w=>(p.name+' '+p.summary+' '+p.id).toLowerCase().includes(w)));
 if(!list.length)return null;
 return <section className="mm-library"><h2>Project records</h2><div className="mm-directory">{list.map(p=><article key={p.id} style={{padding:'16px 12px',borderTop:'1px solid #667368'}}><small>{p.status}</small><h3><a href={p.destination}>{p.name} ↗</a></h3><p>{p.owner}</p><p>{p.caseId&&<a className="mm-inline" href={evidenceHref(p)}>Case study ↗ </a>} <a className="mm-inline" href={briefHref(p.id)}>Start a related brief ↗</a></p></article>)}</div></section>
}
