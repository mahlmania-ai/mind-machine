import { projects } from '../projects';

export type WorkCase = {
  id: string; name: string; category: 'Brand & digital' | 'Media & experiences';
  eyebrow: string; title: string; summary: string; role: string;
  context: string; approach: string; delivery: string; scope: string[]; takeaway: string;
};
const existing = (id: string) => projects.find(project => project.id === id)!;

// Scope descriptions draw on the user-approved 2024 executive-profile review.
// Unreconciled metrics and private source documents are not included.
export const workCases: WorkCase[] = [
  {
    id: 'kannaway', name: existing('kannaway').name, category: 'Brand & digital',
    eyebrow: 'BRAND / PRODUCT / LAUNCH', title: 'Bring the whole experience together.',
    summary: existing('kannaway').description, role: existing('kannaway').role,
    context: 'The work crossed the places people encountered the company: its identity, digital tools, printed materials, products and live events.',
    approach: 'Connect the strategy and creative direction across teams. Coordinate designers, writers, photographers, developers and production partners so each part supports the same launch.',
    delivery: 'Brand and website work, a back office, the Kannaway Connect mobile app, a new Connect magazine, product launches and convention programming.',
    scope: ['Brand identity', 'Website + back office', 'Connect mobile app', 'Connect magazine', 'Product launches', 'National convention'],
    takeaway: 'A brand becomes an experience when the individual pieces work together.',
  },
  {
    id: 'kumbuya', name: existing('kumbuya').name, category: 'Brand & digital',
    eyebrow: 'STRATEGY / PRODUCT / TEAM', title: 'Find the problem behind the brief.',
    summary: existing('kumbuya').description, role: existing('kumbuya').role,
    context: 'The initial task was to market an existing social-commerce platform. The deeper questions concerned its business model, features, design and core offering.',
    approach: 'Start with a new direction sketched in a notebook. Refine it with the team, then work with designers, developers, bloggers and marketing colleagues to bring it into the product.',
    delivery: 'Business-model development, user-experience and product direction, research, planning, testing and coordinated marketing work.',
    scope: ['Business model', 'Core offering', 'User experience', 'Product development', 'Testing', 'Marketing'],
    takeaway: 'Sometimes the useful next step is to rethink what you are asking people to use.',
  },
  {
    id: 'scene', name: existing('scene').name, category: 'Media & experiences',
    eyebrow: 'PUBLISHING / PEOPLE / PLACE', title: 'Take the publication into the city.',
    summary: existing('scene').description, role: existing('scene').role,
    context: 'Chicago Scene connected a publication with a local audience and a calendar of experiences beyond its pages.',
    approach: 'Bring online and offline public relations, digital marketing, social media and live programming into the same audience experience.',
    delivery: 'Magazine marketing and community work, New Year’s Eve at the Drake, the Chicago Scene Boat Party and Craft Crawl Chicago.',
    scope: ['Publishing', 'Public relations', 'Digital marketing', 'NYE at the Drake', 'Chicago Scene Boat Party', 'Craft Crawl Chicago'],
    takeaway: 'The story continues when the audience has a place to meet.',
  },
  {
    id: 'mahlmann-media', name: 'Mahlmann Media', category: 'Media & experiences',
    eyebrow: 'CREATIVE / CAMPAIGNS / EVENTS', title: 'Give an idea a public life.',
    summary: 'Strategic marketing and live experiences across different clients, connecting business goals with creative work, digital communication and events.',
    role: 'Marketing consultant. Strategy, campaign direction and coordination across creative, digital and event work.',
    context: 'Different organizations needed a useful combination of communication, a digital presence and experiences that brought people together.',
    approach: 'Translate the business goal into a campaign, then assemble the people and disciplines needed to deliver it.',
    delivery: 'Work included the Design Your Life fashion and lifestyle event with Whitney Port, UNITE4HAITI, a Hurricane Sandy relief benefit and Big Love Little Hearts events.',
    scope: ['Campaign strategy', 'Web + content', 'Media outreach', 'Design Your Life', 'Charitable events', 'Live production'],
    takeaway: 'The format follows the purpose: a campaign, an experience, or both.',
  },
];
