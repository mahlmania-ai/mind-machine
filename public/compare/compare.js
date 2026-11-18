(() => {
const live=!document.querySelector('#fg'), pair=document.getElementById('pair');
const looks={
 'Screen original':null,
 'Console':['#050b0c','#0c1514','#e9f0ed','#00ffab','#1d2b27','Geist','Geist Mono'],
 'Red':['#0a0507','#200e14','#f0eaec','#ff4557','#47242c','Geist','Geist Mono'],
 'White':['#f4f5f7','#fff','#15171a','#0a8f63','#c6cdc9','Geist','Geist Mono'],
 'Frost':['#06080c','#101722','#eaf4ff','#9fc6ff','#293a50','Geist','Geist Mono'],
 'Grey Frost':['#18191d','#222429','#ecf2fa','#9fc6ff','#454750','Geist','Geist Mono'],
 'Monolith':['#0a0a0a','#161616','#f2f2f2','#eaeaea','#3a3a3a','JetBrains Mono','JetBrains Mono'],
 'Daylight':['#f2f6f9','#fff','#16222c','#324956','#afc3d2','JetBrains Mono','JetBrains Mono'],
 'Garden':['#0b1513','#14231e','#e8eddd','#e4ef83','#3e5147','DM Sans','Geist Mono'],
 'Studio paper':['#eeeae0','#faf8f1','#102c28','#048c7b','#b8c2b8','Georgia','Geist Mono']
};
const accents={Ice:['#9fc6ff','#426c9f'],Lime:['#a3df68','#3b7239'],Ember:['#ff986d','#a33e28'],Mint:['#77d9b8','#217559']};
for(const [name,v] of Object.entries(accents)){looks[name+' dark']=['#18191d','#222429','#ecf2fa',v[0],'#464850','Geist','Geist Mono'];looks[name+' light']=['#e9eaed','#f6f6f8','#1d1d1f',v[1],'#c3c7cc','Geist','Geist Mono']}
const rooms={Markets:['markets',' .mt-desk','.mt-pane-header','.mt-pane-tabs'],Machine:['machine','.mt-machine-hero','.mt-vault-invitation'],Mind:['','.v3-hero','#work','#approach'],Explore:['explore','.mm-features','.mm-library'],Floor:['floor','.floor-cover','#program'],Dashboard:['dashboard','.mm-desk-layout','.mm-priority-form'],Work:['work','.folio-intro','.folio-index','#journal'],Services:['services','.folio-intro','#brief'],History:['history','.mm-story-layout','.mm-story-card'],Media:['media','.mm-story-layout','.mm-story-card'],Software:['software','.mm-software-list'],About:['about','.mm-about-grid'],Guide:['guide','.mm-priority-form','.mm-tabs']};
if(live){rooms['Idea canvas']=['eden','.ix-eden'];rooms['Machine teams']=['conducting','.ix-teams'];rooms['Trading screen library']=['trading-reference','.ix-trading']}
const labels={' .mt-desk':'Research desk','.mt-pane-header':'Instrument header','.mt-pane-tabs':'Chart and research tabs','.v3-hero':'Garden entrance','.mt-machine-hero':'Vault entrance','.mt-vault-invitation':'Vault controls','#program':'Program diagram','#brief':'Brief form','#journal':'Journal'};
function el(t,text){const e=document.createElement(t);if(text)e.textContent=text;return e}
function select(parent,name,values,init){let l=el('label',name),s=el('select');l.append(s);parent.append(l);s.setAttribute('aria-label',name);for(let v of values)s.add(new Option(v,v));s.value=init;return s}
const bar=el('div');bar.className='pick shared';pair.before(bar);const screen=select(bar,'Shared screen',Object.keys(rooms),'Markets'),section=select(bar,'Shared section',[],'');
function sections(){section.replaceChildren();for(let x of rooms[screen.value].slice(1))section.add(new Option(labels[x]||x.replace(/^[.#]/,'').replaceAll('-',' '),x))}
sections();pair.replaceChildren();
function pane(side,initial){const a=el('article'),b=el('div'),f=el('iframe'),wrap=el('div'),status=el('div');a.className='item';b.className='pick';wrap.className='frame';status.className='spec';f.title=side+' style preview';f.setAttribute('scrolling','yes');wrap.append(f);a.append(b,wrap,status);pair.append(a);
 const look=select(b,side+' style',Object.keys(looks),initial),font=select(b,side+' font',['Style default','DM Sans','Instrument Serif','Geist','Geist Mono','JetBrains Mono','Inter','Georgia','Arial'],'Style default'),density=select(b,side+' spacing',['Original','Compact','Airy'],'Original');
 let revision=0;
 async function draw(){let rev=++revision;delete a.dataset.ready;status.textContent='Rendering…';const key=screen.value,sel=section.value.trim();function fit(){let z=wrap.clientWidth/960;f.style.cssText='width:960px;height:680px;transform-origin:0 0;transform:scale('+z+');border:0;display:block';wrap.style.height=680*z+'px'}fit();
 f.onload=async()=>{let d=f.contentDocument,w=f.contentWindow;if(!d||rev!==revision)return;let target;for(let i=0;i<100 && !(target=d.querySelector(sel));i++)await new Promise(r=>setTimeout(r,60));if(rev!==revision)return;if(!target){status.textContent='This section is unavailable.';return}
 let nodes=[...d.body.querySelectorAll('*'),d.body],p=looks[look.value],factor=({Original:1,Compact:.72,Airy:1.4})[density.value];if(live&&document.getElementById('fontset')){let st=el('style');st.textContent=document.getElementById('fontset').textContent;d.head.append(st)}
 const settings=nodes.filter(e=>!['SCRIPT','STYLE','LINK','META'].includes(e.tagName)).map(e=>{let c=w.getComputedStyle(e);return [e,c.fontFamily,c.backgroundColor,c.color,c.borderColor,c.borderStyle,c.backgroundImage,...['paddingTop','paddingRight','paddingBottom','paddingLeft','rowGap','columnGap'].map(k=>c[k])]});
 const put=(e,n,v)=>e.style.setProperty(n,v,'important');
 for(let [e,oldFont,bg,ink,border,bs,img,...spaces] of settings){let chosen=font.value==='Style default'?(p?(/mono/i.test(oldFont)?p[6]:p[5]):''):font.value;if(chosen)put(e,'font-family','"'+chosen+'", '+(/Mono/.test(chosen)?'monospace':/Serif|Georgia/.test(chosen)?'serif':'sans-serif'));
 if(p){const hasBg=bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent',control=e.matches('button,select,input,textarea,[role=tab]'),on=e.matches('[aria-pressed=true],[aria-selected=true],.active,.is-active,.is-selected,.mt-solid-button,.v3-primary'),rgb=(ink.match(/[\d.]+/g)||[]).map(Number),signal=key==='Markets'&&((rgb[0]>rgb[1]*1.35)||(rgb[1]>rgb[0]*1.55))&&e.matches('span,small,strong,td');if(!signal)put(e,'color',on?p[0]:p[2]);if(on||control||hasBg||e===d.body){put(e,'background-color',on?p[3]:e===d.body||e.matches('main,article,.mm-shell,.mt-room,.folio-room')?p[0]:p[1]);if(img.includes('gradient')&&!img.includes('url('))put(e,'background-image','none')}if(bs!=='none')put(e,'border-color',p[4]);if(e.matches('a'))put(e,'text-decoration-color',p[3]);if(e.matches('svg text'))put(e,'fill',p[2])}
 if(factor!==1)spaces.forEach((v,i)=>{if(/^\d+(\.\d+)?px$/.test(v)&&parseFloat(v)>0)put(e,['padding-top','padding-right','padding-bottom','padding-left','row-gap','column-gap'][i],(parseFloat(v)*factor).toFixed(2)+'px')});
 }
 d.body.inert=true;await d.fonts.ready;if(rev!==revision)return;w.scrollTo({top:target.getBoundingClientRect().top+w.scrollY,behavior:'instant'});status.textContent=key+' · '+look.value+' · '+(font.value==='Style default'?(p?p[5]:'screen font'):font.value)+' · '+density.value.toLowerCase()+' spacing';const sample=target.querySelector('button,a,input')||target;const cs=w.getComputedStyle(sample);status.append(document.createTextNode(' · '+cs.fontSize+' type · '+cs.paddingLeft+' control inset'));a.dataset.ready=String(rev)
 };if(live){f.removeAttribute('srcdoc');f.src='/'+rooms[key][0]+(rooms[key][0]?'/':'')+'?design-preview='+rev}else f.srcdoc=doc(key)}
 const ob=new ResizeObserver(()=>{const z=wrap.clientWidth/960;f.style.transform='scale('+z+')';wrap.style.height=680*z+'px'});ob.observe(wrap);for(let s of [look,font,density])s.onchange=draw;draw();return draw}
let panels=[pane('Left','Screen original'),pane('Right','Monolith')];screen.onchange=()=>{sections();panels.forEach(f=>f())};section.onchange=()=>panels.forEach(f=>f());
})();
