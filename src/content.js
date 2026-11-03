// All site copy lives here. Edit this file to update the portfolio.

export const profile = {
  name: 'Louie Apolinario',
  role: 'Product designer and computer engineer',
  headline: 'I design digital products and write the code that ships them.',
  intro:
    "I take web and mobile products from the first wireframe to production code, so the design you sign off on is the one your users get.",
  availability: 'Taking new projects',
  focus: 'Product design, front-end, SaaS',
  background: 'Computer engineering',
  // Shown in the hero panel and the contact section. Add yours, e.g.:
  // { label: 'LinkedIn', text: 'in/louie', url: 'https://linkedin.com/in/...' },
  // { label: 'Résumé', text: 'Download PDF', url: '/resume.pdf' },  (put the file in /public)
  links: [],
  email: 'eiuol.web@gmail.com',
}

// `kind` picks the thumbnail sketch: 'dashboard' | 'mobile' | 'flow' | 'list'
// `tags` drive the filter chips on the Work section.
export const projects = [
  {
    id: 'promax',
    name: 'ProMax Dashboard',
    title: 'Finance analytics for modern teams',
    summary: 'One dashboard that answers the questions finance leads used to dig through 14 reports for.',
    details:
      'Rebuilt the reporting experience around the three questions finance leads ask every Monday. Consolidated 14 report screens into one configurable dashboard with saved views.',
    role: 'Lead product designer',
    year: '2025',
    outcome: 'Reporting time cut from hours to minutes',
    tags: ['Dashboard', 'Web'],
    kind: 'dashboard',
    hue: 228,
  },
  {
    id: 'launchflow',
    name: 'LaunchFlow',
    title: 'Onboarding that converts',
    summary: 'New users reach their first result before setup asks them for anything.',
    details:
      'Replaced a 9-step setup wizard with progressive onboarding that gets users to their first result before asking for configuration.',
    role: 'Product designer',
    year: '2024',
    outcome: '+42% activation in release tests',
    tags: ['Web'],
    kind: 'flow',
    hue: 152,
  },
  {
    id: 'pulse',
    name: 'Pulse CRM',
    title: 'CRM redesign for faster collaboration',
    summary: 'A pipeline redesigned around how sales teams actually hand off deals.',
    details:
      'Mapped how sales teams hand off deals, then redesigned the pipeline, activity feed, and shared notes around those handoffs.',
    role: 'UX and UI design',
    year: '2024',
    outcome: 'Fewer clicks per deal update',
    tags: ['Dashboard', 'Web'],
    kind: 'list',
    hue: 18,
  },
  {
    id: 'nexa',
    name: 'Nexa Mobile',
    title: 'Mobile product shipped in 8 weeks',
    summary: 'Design and engineering ran in parallel from day one, so nothing waited on a handoff.',
    details:
      'Ran design and engineering in parallel with a shared component library, so screens shipped as soon as they were approved.',
    role: 'Design lead',
    year: '2023',
    outcome: 'Concept to App Store in 8 weeks',
    tags: ['Mobile'],
    kind: 'mobile',
    hue: 280,
  },
]

// A real sequence, shown as a connected prototype flow.
export const process = [
  { title: 'Discover', text: 'Talk to users, map how things work today, and agree on the one number this project has to move.' },
  { title: 'Design', text: 'Wireframes first, then high-fidelity screens and a component library. Real users test it before anything is final.' },
  { title: 'Build and measure', text: 'I build the front end myself or pair with your engineers. After launch, we check that number and keep improving.' },
]

export const about = {
  text: [
    "I'm a computer engineer who cares as much about how software feels as how it works. Most of my work is SaaS: dashboards, onboarding flows, and mobile apps for startups and product teams.",
    "Because I design and build, nothing gets lost in a handoff. I prototype in code when that's faster, I can tell early when a design will be expensive to build, and I talk to engineers in their own terms.",
  ],
  // TODO: confirm these numbers (or name the products behind them).
  facts: [
    ['Background', profile.background],
    ['Focus', profile.focus],
    ['Brands helped scale', '12'],
    ['Monthly users reached', '8M'],
  ],
}
