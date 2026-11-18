import {projects} from './projects';
export type ProjectRecord={id:string;name:string;owner:string;status:string;destination:string;caseId?:string;summary:string};
const cases=new Set(['kannaway','kumbuya','scene','mahlmann-media']);
const base=[...projects,{id:'mahlmann-media',name:'Mahlmann Media',state:'Selected work',description:'Live events and media production.'}];
export const records:ProjectRecord[]=base.map(p=>({id:p.id,name:p.name,owner:'Chris Mahlmann',status:p.state,summary:p.description,caseId:cases.has(p.id)?p.id:undefined,destination:p.id==='scene'?'/media/':cases.has(p.id)?'/work/?project='+p.id+'#case-study':'/'+p.id+'/'}));
export function record(id:string|null){return records.find(p=>p.id===id)}
export function briefHref(id:string){return '/services/?project='+encodeURIComponent(id)+'#brief'}
export function evidenceHref(p:ProjectRecord){return p.caseId?'/work/?project='+encodeURIComponent(p.caseId)+'#case-study':p.destination}
