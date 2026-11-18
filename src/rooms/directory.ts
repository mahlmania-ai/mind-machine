export type Screen = { slug: string; name: string; group: string; summary: string; keywords: string };
export const screens: Screen[] = [
  { slug: '', name: 'Mind', group: 'Worlds', summary: 'Enter the orbital garden where ideas take shape.', keywords: 'mind garden eden creative homepage space green portrait' },
  { slug: 'machine', name: 'Machine', group: 'Worlds', summary: 'Open the vault and explore how the teams work together.', keywords: 'operations team companies circuitry factory vault machine' },
  { slug: 'markets', name: 'Markets', group: 'Worlds', summary: 'Arrange a three-screen futures research desk.', keywords: 'trading terminal futures cot news markets finance charts' },
  { slug: 'floor', name: 'The Floor', group: 'Worlds', summary: 'Explore the proposed trading floor and incubator in Chicago.', keywords: 'chicago board of trade physical floor venue founders studios' },
  { slug: 'atlas', name: 'Atlas', group: 'Worlds', summary: 'Open the interactive globe in God’s Eye View.', keywords: 'atlas map globe geography earth cable flood imagery' },
  { slug:'compare', name:'Compare styles', group:'Studio', summary:'Apply two visual styles to the same screen.', keywords:'design fonts palette spacing compare' },
  { slug:'eden', name:'Creator workspace', group:'Workspace', summary:'Browse creators, study posts, build lists and arrange ideas on a board.', keywords:'eden board creative canvas notes' },
  { slug:'conducting', name:'Machine teams', group:'Workspace', summary:'Explore a company team, its pilot and its workflow.', keywords:'conducting AI operations departments machinery' },
  { slug:'trading-reference', name:'Trading screen library', group:'Worlds', summary:'Inspect official tastytrade platform views.', keywords:'options chain curve positions orders tastytrade screen reference' },
  { slug: 'dashboard', name: 'My dashboard', group: 'Workspace', summary: 'Pin destinations and keep a short list of priorities.', keywords: 'private personal dashboard tasks notes favorites' },
  { slug: 'founder-os', name: 'Founder OS', group: 'Workspace', summary: 'Tour the operating dashboard with a sample company.', keywords: 'founder org agents tasks operating system sample departments' },
  { slug: 'work', name: 'Selected work', group: 'Studio', summary: 'See the projects, Chris’s role and the build journal.', keywords: 'portfolio cases kannaway kumbuya chicago scene journal releases' },
  { slug: 'services', name: 'Services', group: 'Studio', summary: 'Shape a brief for strategy, implementation or storytelling.', keywords: 'sales consulting hire start project service offer brief commission automation' },
  { slug: 'history', name: 'Historical engine', group: 'Studio', summary: 'Follow a piece of evidence from a source to a story.', keywords: 'history ancestry research records story historical engine' },
  { slug: 'media', name: 'Media & publishing', group: 'Studio', summary: 'Explore how a story moves from print to a live room.', keywords: 'publishing media magazine chicago scene events film stories' },
  { slug: 'software', name: 'Software', group: 'Studio', summary: 'Inspect the applications behind the site and open each one.', keywords: 'products software platform apps projects code' },
  { slug: 'guide', name: 'Site guide', group: 'Studio', summary: 'Ask where to find a project, a tool or a service.', keywords: 'site guide navigation find search chat' },
  { slug: 'about', name: 'About & contact', group: 'Studio', summary: 'Meet Chris and start a conversation about working together.', keywords: 'about contact email chris mahlmann' },
];
export const screenHref = (slug: string) => slug === 'atlas' ? '/atlas/?welcome=0' : slug ? '/' + slug + '/' : '/';
