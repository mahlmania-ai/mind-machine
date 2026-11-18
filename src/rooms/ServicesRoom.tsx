import {record} from '../registry';
import { useRef, useState, type FormEvent } from 'react';
import './work-services.css';

const Arrow = () => <span aria-hidden="true">↗</span>;
const needs = ['Strategy & direction', 'Brand & digital experience', 'Workflows & automation', 'History, media & storytelling', 'Let’s work it out together'];
const initialInterest = () => {
  const params=new URLSearchParams(window.location.search);
  const value=record(params.get('project'))?.name || params.get('interest');
  return value && value.length <= 150 ? value : '';
};

export function ServicesRoom() {
  const [service, setService] = useState(needs[4]);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [idea, setIdea] = useState(() => { const interest = initialInterest(); return interest ? `I’m interested in work like ${interest}.\n\n` : ''; });
  const [current, setCurrent] = useState('');
  const [timing, setTiming] = useState('');
  const [reference, setReference] = useState('');
  const [opened, setOpened] = useState(false);
  const ideaField = useRef<HTMLTextAreaElement>(null);
  const body = `Hi Chris,\n\nI’d like to explore: ${service}\n\nThe idea / what I want to improve:\n${idea.trim()}\n\nWhat happens today:\n${current.trim() || 'Let’s discuss'}\n\nName: ${name.trim() || 'Not included'}\nOrganization / project: ${organization.trim() || 'Not included'}\nTiming: ${timing.trim() || 'Let’s discuss'}\nUseful reference: ${reference.trim() || 'Not included'}\n`;
  const mailto = `mailto:chris@mahlmania.ai?subject=${encodeURIComponent(`A project to explore — ${service}`)}&body=${encodeURIComponent(body)}`;
  const choose = (value: string) => { setService(value); document.getElementById('brief')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); ideaField.current?.focus({ preventScroll: true }); };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idea.trim()) { ideaField.current?.setCustomValidity('Add a few words about your idea.'); ideaField.current?.reportValidity(); return; }
    setOpened(true); window.location.href = mailto;
  };

  return <div className="folio-room services-room">
    <section className="folio-intro services-intro" aria-labelledby="services-room-title"><div><p className="folio-kicker">WORK WITH CHRIS</p><h1 id="services-room-title">Mind + Machine.<br/><em>Put it to work.</em></h1></div><div className="folio-intro-aside"><p>Bring a new idea, a complicated project, or something that should work better. We’ll find the direction and build what makes it useful.</p><a className="folio-button" href="#brief">Start with your idea <Arrow /></a></div></section>
    <section className="services-equation" aria-label="The Mind and Machine approach"><div><span className="equation-symbol" aria-hidden="true">✳</span><p className="folio-kicker">MIND</p><h2>Understand what matters.</h2><p>Your knowledge, goals, audience and decisions. The context that gives the work its direction.</p></div><span className="equation-plus" aria-hidden="true">+</span><div><span className="equation-symbol machine-symbol" aria-hidden="true">⌘</span><p className="folio-kicker">MACHINE</p><h2>Make it useful.</h2><p>The experiences, content, tools and workflows that put that understanding into practice.</p></div></section>
    <section className="services-capabilities" aria-labelledby="capabilities-title"><div className="folio-index-heading"><div><p className="folio-kicker">WHERE I CAN HELP</p><h2 id="capabilities-title">What needs to happen?</h2></div><a href="/work/" className="folio-link">See the work <Arrow /></a></div>
      {[
        { name: needs[0], title: 'Give the idea a direction.', description: 'Research the problem, clarify the offering and connect the business model, audience and experience. Turn the possibilities into a useful plan.', detail: 'Research · positioning · business and product direction', evidence: 'Kumbuya: business-model and product work', project: 'kumbuya' },
        { name: needs[1], title: 'Bring the experience together.', description: 'Connect brand, websites, digital products, content and launches. Build a coherent experience across the places people encounter your work.', detail: 'Creative direction · websites · digital experiences · launches', evidence: 'Kannaway: brand, app, publishing and launch work', project: 'kannaway' },
        { name: needs[2], title: 'Make the work flow.', description: 'Map a process, find the repeated work and design practical tools and automation around it. Start with a defined workflow and a clear way to review the result.', detail: 'Workflow design · knowledge systems · integrations · automation', evidence: 'Explore current software work', path: '/software/' },
        { name: needs[3], title: 'Give the story a life.', description: 'Shape research and subject knowledge into a story people can experience. Explore publishing, corporate or personal histories, media, and live programming.', detail: 'Story development · publishing · media · events', evidence: 'Chicago Scene: a publication and its community', project: 'scene' },
      ].map((item, index) => <article className="services-capability" key={item.name}><span className="folio-detail-number">0{index + 1}</span><div><p className="folio-kicker">{item.name}</p><h3>{item.title}</h3><p>{item.description}</p><span className="services-deliverables">{item.detail}</span><a className="services-evidence" href={item.path || `/work/?project=${item.project}#case-study`}>{item.evidence} <Arrow /></a></div><button className="services-select" onClick={() => choose(item.name)} aria-label={`Discuss ${item.name}`}>Let’s explore this <Arrow /></button></article>)}
    </section>
    <section className="services-engagements" aria-labelledby="engagement-title"><div><p className="folio-kicker">A WAY TO BEGIN</p><h2 id="engagement-title">Start where<br/><em>you are.</em></h2><p>The engagement follows the problem. We agree on the scope, responsibilities, schedule and price before work begins.</p></div><ol><li><span>01</span><div><h3>Define the system.</h3><p>Make sense of the opportunity, the audience and the current process. Leave with a direction and a practical brief.</p></div></li><li><span>02</span><div><h3>Build the system.</h3><p>Take a scoped piece of work through design, implementation and review. Connect the people and tools the project needs.</p></div></li><li><span>03</span><div><h3>Keep improving it.</h3><p>Review how the work is being used, prioritize changes and support its next iteration.</p></div></li></ol></section>
    <section className="services-brief" id="brief" aria-labelledby="brief-title"><div className="services-brief-intro"><p className="folio-kicker">LET’S MAKE SOMETHING</p><h2 id="brief-title">What are<br/>you <em>imagining?</em></h2><p>A few sentences are enough to begin. Tell me what you want to change, what you have now, and what a useful result would look like.</p><a href="mailto:chris@mahlmania.ai" className="folio-link">chris@mahlmania.ai <Arrow /></a><p className="services-privacy">This form opens an email draft for you to review. Nothing is submitted to this website, and your answers are not saved here.</p></div>
      <form className="services-form" onSubmit={submit}><label htmlFor="service-need">What would help most?<select id="service-need" value={service} onChange={event => setService(event.target.value)}>{needs.map(need => <option key={need}>{need}</option>)}</select></label><label htmlFor="service-idea">Your idea or the thing you want to improve <span>Required</span><textarea ref={ideaField} id="service-idea" value={idea} onChange={event => { setIdea(event.target.value); setOpened(false); event.target.setCustomValidity(''); }} rows={5} maxLength={1600} required placeholder="Here’s what I’m working on…" /></label><label htmlFor="service-current">What happens today? <span>Optional</span><textarea id="service-current" value={current} onChange={event => setCurrent(event.target.value)} rows={3} maxLength={800} placeholder="The current process, tools, or starting point" /></label><div className="services-form-row"><label htmlFor="service-name">Your name <span>Optional</span><input id="service-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} maxLength={100}/></label><label htmlFor="service-organization">Organization or project <span>Optional</span><input id="service-organization" autoComplete="organization" value={organization} onChange={event => setOrganization(event.target.value)} maxLength={150}/></label></div><div className="services-form-row"><label htmlFor="service-timing">Timing <span>Optional</span><input id="service-timing" value={timing} onChange={event => setTiming(event.target.value)} maxLength={150} placeholder="A launch date, or just exploring"/></label><label htmlFor="service-reference">A useful link <span>Optional</span><input id="service-reference" type="url" value={reference} onChange={event => setReference(event.target.value)} maxLength={500} placeholder="https://"/></label></div><div className="services-form-actions"><button className="folio-button" type="submit">Open email draft <Arrow /></button><a href={`data:text/plain;charset=utf-8,${encodeURIComponent(body)}`} download="my-project-brief.txt">Download your brief ↓</a></div><p className="services-form-note" role="status">{opened ? 'Your email app may have opened. Review the draft there before sending. If it did not open, download the brief and email it to Chris.' : 'You choose when to send it. No price, schedule or engagement is committed by this form.'}</p></form>
    </section>
  </div>;
}

export default ServicesRoom;
