import {useState, type FormEvent} from 'react';
import {screens,screenHref,type Screen} from './directory';

type Answer={question:string;matches:Screen[]};
const prompts=['Show me the team','Where is the trading desk?','How do I hire Chris?','Show me the portfolio'];
const skip=new Set(['a','an','the','me','show','take','to','where','is','are','how','do','i','can','in','see','want','you','and','for','us','we','my']);
function match(question:string) {
 const terms=question.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w&&!skip.has(w));
 return screens.filter(s=>s.slug!=='guide').map(s=>{
  const name=s.name.toLowerCase(),termsForScreen=(s.name+' '+s.keywords+' '+s.summary).toLowerCase();
  return {s,score:terms.reduce((n,t)=>n+(name.includes(t)?4:termsForScreen.includes(t)?1:0),0)};
 }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(item=>item.s);
}
export default function Guide(){
 const [draft,setDraft]=useState(''),[answers,setAnswers]=useState<Answer[]>([]);
 function ask(q:string){if(!q.trim())return;setAnswers(prev=>[{question:q.trim(),matches:match(q)},...prev].slice(0,8));setDraft('')}
 function submit(e:FormEvent){e.preventDefault();ask(draft)}
 return <article className="mm-page"><header className="mm-intro"><p className="mm-overline">Site guide</p><h1>Find your <i>screen.</i></h1><p>Ask where to find a project, a tool or a service. The guide searches this site’s directory.</p></header>
 <form className="mm-priority-form" onSubmit={submit}><label className="mm-sr" htmlFor="guide-prompt">Ask the site guide</label><input id="guide-prompt" maxLength={220} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Where is the trading desk?"/><button className="mm-smallbtn" disabled={!draft.trim()}>Find screens</button></form>
 <div className="mm-tabs">{prompts.map(q=><button type="button" onClick={()=>ask(q)} key={q}>{q}</button>)}</div><div className="mm-guide-log" style={{marginTop:28}} aria-live="polite">{answers.map((answer,i)=><section className="mm-guide-entry" key={i}><strong>{answer.question}</strong>{answer.matches.length?<><p>{answer.matches[0].summary}</p>{answer.matches.map(s=><a key={s.slug} href={screenHref(s.slug)}>{s.name} ↗</a>)}</>:<p>I couldn’t find a matching screen. <a href="/explore/">Browse the directory</a> or <a href="/about/">contact Chris</a>.</p>}</section>)}</div></article>
}
