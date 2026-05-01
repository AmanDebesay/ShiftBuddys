// ─────────────────────────────────────────────────────────────
// ShiftBuddys — Site Data
// Edit this file to update all text content across the website
// without touching component code.
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: 'ShiftBuddys',
  tagline: 'Built for the Patch. Built for Your Life.',
  description: 'The only app built for the complete life of an oilsands rotation worker.',
  url: 'https://shiftbuddys.ca',
  email: 'hello@shiftbuddys.ca',
  social: {
    facebook: 'https://facebook.com/ShiftBuddys',
    instagram: 'https://instagram.com/ShiftBuddys',
    linkedin: 'https://linkedin.com/company/ShiftBuddys',
  },
  appStore: '#',      // Replace with Apple App Store URL when live
  playStore: '#',     // Replace with Google Play URL when live
}

export const NAV_LINKS = [
  { label: 'Features',   href: '/features' },
  { label: 'For Employers', href: '/employers' },
  { label: 'Pricing',    href: '/pricing' },
  { label: 'About',      href: '/about' },
  { label: 'Blog',       href: '/blog' },
  { label: 'Contact',    href: '/contact' },
]

// ─── Hero (Home page) ────────────────────────────────────────
export const HERO = {
  eyebrow: 'Now Available in Fort McMurray',
  headline: 'Your Shift.\nYour Family.\nYour Life.',
  subheadline: 'ShiftBuddys is the app built for oilsands rotation workers — combining shift scheduling, family connection, financial wellness, crew coordination, and Fort McMurray life in one place.',
  cta_primary: { label: 'Download Free', href: '#download' },
  cta_secondary: { label: 'Watch How It Works', href: '#how-it-works' },
  photo: '/images/hero-worker.png',
  stats: [
    { value: '60,000+', label: 'Fort McMurray workers' },
    { value: '14 Days', label: 'average rotation away' },
    { value: '1 App', label: 'for your whole life' },
  ],
}

// ─── Countdown widget on home ────────────────────────────────
export const COUNTDOWN_DEMO = {
  days: 9,
  label: 'Home in',
  sublabel: 'Your countdown starts the moment you set your rotation',
}

// ─── Features (6 modules) ────────────────────────────────────
export const MODULES = [
  {
    id: 'shift-hub',
    emoji: '🗓️',
    icon: 'Calendar',
    color: '#4376b1',
    title: 'Shift Hub',
    subtitle: 'Your schedule, perfectly organized',
    description: 'Set your rotation once and your entire year generates automatically. The bold countdown to home becomes the first thing you check every morning.',
    features: [
      'Auto-generates full year from your rotation pattern (14/7, 21/7, 7/7, custom)',
      '"Home in X days" countdown — your daily ritual',
      'Shift type tags: Day, Night, Travel, Layover, Days Off',
      'Overtime tracker and paycheck estimator',
      'One-tap sync to Google Calendar, Apple Calendar, and Outlook',
      'Shareable iCal link — family always sees your schedule',
      '"Halfway through" milestone alerts for morale',
    ],
    photo: '/images/hero-worker.png',
  },
  {
    id: 'family-sync',
    emoji: '👨‍👩‍👧',
    icon: 'Heart',
    color: '#e85d75',
    title: 'Family Sync',
    subtitle: 'Stay close from 1,000km away',
    description: 'Invite up to 5 family members to your circle. Your shift schedule lives on their calendar. The distance doesn\'t have to feel so far.',
    features: [
      'Shared family calendar — no more "when are you home again?"',
      'One-tap "I\'m thinking of you" emotional pings',
      'Daily check-in cards shared between you and your partner',
      'Milestone manager — warns you when you\'ll miss a family event',
      'Kids mode — fun countdown with drawings they can send you',
      'Private family photo journal — digital scrapbook of what you missed',
      '"Safe arrival" ping when you land at camp',
      'Coming Home Mode — activates 48 hours before you walk through the door',
    ],
    photo: '/images/coming-home.png',
  },
  {
    id: 'money-manager',
    emoji: '💰',
    icon: 'DollarSign',
    color: '#22c55e',
    title: 'Money Manager',
    subtitle: 'High earner. Smart saver.',
    description: 'Many oilsands workers earn $130K+ and retire with nothing. ShiftBuddys helps you see where it goes — without being preachy about it.',
    features: [
      'Paycheck tracker — see annual earnings building in real time',
      'Rotation budget planner — control the dangerous days-off spending week',
      'Savings goal tracker with visual progress (truck, house, emergency fund)',
      'Spending categories built for shift workers (PPE, flights, union dues)',
      'Days Off Spending Alert at 75% and 100% of your cap',
      'Tax estimate tool — no more tax season shock',
      'RRSP/TFSA contribution tracker',
      'CRA Benefits Calendar — CCB dates, RRSP deadlines, T4 reminders',
      'Trades & Certification Wallet — H2S Alive, First Aid, WHMIS expiry alerts',
    ],
    // PHOTO: Replace with /images/feature-money.jpg
    // Ideal: Worker reviewing finances on tablet, clean desk or break room
    photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=85&fit=crop',
  },
  {
    id: 'wellbeing',
    emoji: '🧠',
    icon: 'Brain',
    color: '#a855f7',
    title: 'Wellbeing',
    subtitle: 'Your mental health, finally seen',
    description: 'Backed by documented oilsands mental health research. This module gives the hidden crisis a voice — and gives workers tools to actually do something about it.',
    features: [
      'Daily mood check-in — 5 seconds, emoji-based, builds a trend you can see',
      'Rotation mood pattern — shows if day 10+ is always your hardest',
      'Sleep tracker — patterns against shift type, identifies chronic debt',
      'Rotation health tracker — water, activity, alcohol — data not judgment',
      '"Camp loneliness toolkit" — 5-minute activities for downtime',
      'Anonymous peer community — moderated, genuine, "anyone else?"',
      'Crisis support fast access — Alberta 211, crisis lines, EAP, always visible',
      'Weekly habit challenges with streaks and badges',
    ],
    photo: '/images/camp-life.png',
  },
  {
    id: 'fort-mac-life',
    emoji: '🏙️',
    icon: 'MapPin',
    color: '#f59e0b',
    title: 'Fort Mac Life',
    subtitle: 'Your city. Your days off.',
    description: 'No other app combines shift scheduling with a hyperlocal Fort McMurray life guide. This turns ShiftBuddys from a utility into a lifestyle companion.',
    features: [
      'Days-off activity planner — outdoors, family, restaurants, events, nightlife',
      '"What\'s on this week" — Fort McMurray Today, RMWB, local events',
      'Restaurant guide rated by shift workers themselves',
      'Local deals board — businesses post ShiftBuddys-exclusive discounts',
      'Fort McMurray newcomer guide for FIFO workers new to the city',
      'Weather widget with extreme cold and wildfire smoke alerts',
      'YMM community board — gear, carpools, roommates, tips',
      'Seasonal guides — winter trails, summer river spots, fishing',
    ],
    photo: '/images/highway-63.png',
  },
  {
    id: 'crew-network',
    emoji: '👷',
    icon: 'Users',
    color: '#06b6d4',
    title: 'Crew Network',
    subtitle: 'Your crew. Your community.',
    description: 'The coworker bond is just as important as family connection. Private crew channels, shift swaps, carpool matching, and "who\'s on my flight home" — all in one place.',
    features: [
      'Auto-matched crew groups by employer, rotation, and site',
      'Private channels: General, Carpools & Flights, Shift Swaps, Gear for Sale',
      '"Who\'s on my flight" — enter flight number, see your crewmates',
      'Carpool coordinator for Highway 63 corridor runs',
      'Shift Swap Marketplace — post, find, confirm within your verified crew',
      'Native in-app chat with push notifications and read receipts',
      'SMS bridging — non-app crewmates still receive messages as texts',
    ],
    photo: '/images/crew-network.png',
  },
]

// ─── Coming Home mode callout ─────────────────────────────────
export const COMING_HOME = {
  label: 'Exclusive Feature',
  title: 'Coming Home Mode',
  subtitle: 'Nothing like it exists anywhere.',
  description: 'Activates 48 hours before your rotation ends. Prompts for you. Prompts for your partner. Conversation starters. A reintegration checklist. Because the first 24 hours home shouldn\'t feel like coming home to strangers.',
  worker_prompts: [
    '"What\'s one thing you want to do with your family in the first hour?"',
    '"You\'ve been in work mode for 14 days. Give yourself time to decompress."',
    '"Ask your partner what was hard while you were gone — and just listen first."',
  ],
  partner_prompts: [
    '"He/she lands tomorrow. What do you need to say that\'s been waiting?"',
    '"Give everyone 30 minutes just to be together before the logistics."',
    'Write a welcome home note — it appears on their screen when they land.',
  ],
  photo: '/images/coming-home.png',
}

// ─── Pricing ──────────────────────────────────────────────────
export const PRICING = {
  individual: [
    {
      tier: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started — no credit card needed',
      color: '#4376b1',
      features: [
        'Shift calendar & countdown timer',
        'Family sync (up to 2 members)',
        'Basic mood check-in',
        'Fort Mac Life events feed',
        'Weather widget',
        'Safe arrival pings',
        'Basic crew chat (read-only)',
      ],
      cta: 'Download Free',
      href: '#download',
      highlight: false,
    },
    {
      tier: 'Premium',
      price: '$7.99',
      period: 'per month',
      annual: '$59.99/year (save 37%)',
      description: 'Everything — for workers serious about their life',
      color: '#E87722',
      features: [
        'Everything in Free',
        'Unlimited family sync (5 members)',
        'Full Money Manager + savings goals',
        'Wellbeing trends + rotation patterns',
        'Coming Home Mode',
        'Shift Swap Marketplace',
        'Full Fort Mac Life + deals access',
        'Trades & Certification Wallet',
        'Flight tracker',
        'CRA Benefits Calendar',
        'Anonymous peer community',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      href: '#download',
      highlight: true,
    },
  ],
  enterprise: {
    title: 'Enterprise',
    description: 'For oilsands operators, contractors, and resource companies',
    tiers: [
      { size: '200 – 500 employees', price: '$8', annual: '$19,200 – $48,000/yr' },
      { size: '500 – 2,000 employees', price: '$6', annual: '$36,000 – $144,000/yr' },
      { size: '2,000 – 10,000 employees', price: '$4', annual: '$96,000 – $480,000/yr' },
      { size: '10,000+ employees', price: '$3', annual: '$360,000+/yr' },
    ],
    benefits: [
      'All Premium features for every employee',
      'Anonymized wellness dashboard for HR',
      'Team mood trends without individual data',
      'Sleep & fatigue aggregate reports for HSE',
      'Certification compliance tracking',
      'Onboarding support and training',
      'Dedicated account manager',
      'Free 90-day pilot — zero commitment',
    ],
    cta: 'Book a Pilot',
    href: '/contact?type=employer',
  },
}

// ─── Testimonials ─────────────────────────────────────────────
// Replace with real quotes once you collect them from beta users
export const TESTIMONIALS = [
  {
    name: 'Marcus T.',
    role: 'Heavy Equipment Operator, Suncor',
    location: 'Fort McMurray',
    rotation: '14 on / 7 off',
    quote: 'The countdown timer sounds simple but I check it every single morning like a clock. It\'s the first thing I open.',
    avatar: null, // Replace with /images/testimonial-1.jpg
    rating: 5,
  },
  {
    name: 'Priya K.',
    role: 'Partner of a rotation worker',
    location: 'Calgary, AB',
    rotation: 'Partner — 2 kids at home',
    quote: 'For the first time I actually know when he\'s coming home without having to text him. The family calendar alone is worth it.',
    avatar: null,
    rating: 5,
  },
  {
    name: 'Devon L.',
    role: 'Process Operator, CNRL',
    location: 'Fort McMurray',
    rotation: '7 on / 7 off',
    quote: 'The shift swap feature alone saved me twice this month. Way better than the group chat chaos we had before.',
    avatar: null,
    rating: 5,
  },
  {
    name: 'James R.',
    role: 'Pipefitter — First oilsands job',
    location: 'Originally Manila, Philippines',
    rotation: '21 on / 7 off',
    quote: 'The newcomer guide helped me figure out everything — doctor, licence, where to live. I felt like someone actually built this for me.',
    avatar: null,
    rating: 5,
  },
]

// ─── Employer page ────────────────────────────────────────────
export const EMPLOYER = {
  headline: 'Your workers are counting down to home.\nHelp them get there whole.',
  subheadline: 'ShiftBuddys gives oilsands operators a measurable, purpose-built employee wellness platform — with anonymized data your HR and HSE teams have never had access to before.',
  stats: [
    { value: '$30K–$80K', label: 'Cost to replace one skilled worker' },
    { value: '3–8%', label: 'Average EAP utilization rate' },
    { value: '3×', label: 'Higher sleep disorder rates among shift workers' },
    { value: '90 Days', label: 'Free pilot — zero commitment' },
  ],
  why: [
    {
      icon: 'TrendingDown',
      title: 'Reduce Costly Turnover',
      description: 'Replacing a heavy equipment operator costs $30,000–$80,000. Workers who feel supported stay longer. ShiftBuddys creates measurable retention impact.',
    },
    {
      icon: 'Shield',
      title: 'HSE Fatigue & Mental Health Data',
      description: 'Anonymized sleep and mood trend data gives your HSE managers early warning signals they\'ve never had before — without identifying individuals.',
    },
    {
      icon: 'Award',
      title: 'Recruitment Advantage',
      description: '"We provide ShiftBuddys for all employees and their families" is a real differentiator in job postings in a competitive labour market.',
    },
    {
      icon: 'BarChart2',
      title: 'Replace Underperforming EAPs',
      description: 'Most companies spend $50K–$200K/year on EAP programs with 3–8% worker utilization. ShiftBuddys is purpose-built and measurably more engaging.',
    },
    {
      icon: 'Lock',
      title: 'Privacy You Can Guarantee',
      description: 'Individual worker data is never visible to employers. Ever. Workers see this guarantee on their home screen. That\'s what drives adoption.',
    },
    {
      icon: 'Zap',
      title: 'Free 90-Day Pilot',
      description: 'Start with 200 workers. Zero cost. Zero commitment. We provide an anonymized wellness report at the end showing what your team needed most.',
    },
  ],
  photo: '/images/employer-meeting.png',
}

// ─── About page ───────────────────────────────────────────────
export const ABOUT = {
  headline: 'Built Here. For Here.',
  story: [
    'ShiftBuddys was born in Fort McMurray — not in a Silicon Valley boardroom. We built it because we live this life, or we\'re close to people who do.',
    'We saw what the University of Alberta researchers documented and what the Globe and Mail reported: oilsands workers have worse mental health, higher stress, and more family strain than the general population. And there was no app built for any of it.',
    'Every feature in ShiftBuddys came from a real conversation with a real worker in this community. The countdown timer. The Coming Home Mode. The shift swap marketplace. The family journal. These aren\'t invented features — they\'re solutions to problems we heard over and over.',
    'Our unfair advantage is simple: we\'re from here. When a worker in camp sees that this app was made by someone from their city, for their community — they trust it instantly. That trust is worth more than any marketing budget.',
  ],
  values: [
    { icon: 'Heart', title: 'Family First', description: 'Every feature is designed around the tension between work and home. We never forget what workers are counting down to.' },
    { icon: 'Shield', title: 'Privacy Always', description: 'Your data belongs to you. Employers see anonymized trends only. This is non-negotiable and always will be.' },
    { icon: 'MapPin', title: 'Locally Built', description: 'We understand Fort McMurray culture in a way no outside company ever could. That authenticity is the foundation of everything.' },
    { icon: 'Users', title: 'Community Owned', description: 'ShiftBuddys succeeds when Fort McMurray workers and their families succeed. That\'s the only metric that matters.' },
  ],
  team: [
    { name: 'Aman Debesay', role: 'Founder & CEO', bio: 'Fort McMurray local. Built ShiftBuddys for the workers and families who make this community what it is.', photo: '/images/founder.png' },
  ],
  photo: '/images/family-home.png',
}

// ─── Blog posts ───────────────────────────────────────────────
export const BLOG_POSTS = [
  {
    slug: 'oilsands-mental-health-crisis',
    title: 'The Hidden Mental Health Crisis in the Oilsands — And What We\'re Doing About It',
    excerpt: 'University of Alberta research confirms what workers already know: rotation workers face documented mental health challenges that generic wellness apps completely ignore.',
    category: 'Mental Health',
    date: '2025-01-15',
    readTime: '6 min read',
    // PHOTO: Replace with /images/blog-mental-health.jpg
    photo: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80&fit=crop',
    author: 'ShiftBuddys Team',
  },
  {
    slug: 'coming-home-reintegration',
    title: 'Why the First 24 Hours Home Are the Hardest — And How to Make Them Better',
    excerpt: 'After 14 days in camp, coming home should feel like relief. For many rotation workers, it feels like culture shock. Here\'s what the research says and how Coming Home Mode helps.',
    category: 'Family',
    date: '2025-01-22',
    readTime: '8 min read',
    photo: '/images/coming-home.png',
    author: 'ShiftBuddys Team',
  },
  {
    slug: 'oilsands-financial-planning',
    title: '$130K a Year and Nothing to Show For It — The Real Financial Story in Fort McMurray',
    excerpt: 'Why do so many high-earning oilsands workers struggle with savings? The psychology of rotation lifestyle and what you can do about it starting this week.',
    category: 'Financial Wellness',
    date: '2025-02-01',
    readTime: '7 min read',
    photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80&fit=crop',
    author: 'ShiftBuddys Team',
  },
  {
    slug: 'fort-mcmurray-newcomer-guide',
    title: 'New to Fort McMurray? The Complete Newcomer Guide for FIFO Workers',
    excerpt: 'From getting your Alberta driver\'s licence to finding a family doctor and the best neighbourhoods to live in — everything a new Fort McMurray worker needs to know.',
    category: 'Fort Mac Life',
    date: '2025-02-10',
    readTime: '10 min read',
    photo: '/images/highway-63.png',
    author: 'ShiftBuddys Team',
  },
]

// ─── FAQ ──────────────────────────────────────────────────────
export const FAQ = [
  {
    q: 'Is ShiftBuddys free to download?',
    a: 'Yes — ShiftBuddys is completely free to download and includes a generous free tier with the shift calendar, countdown timer, family sync for 2 members, and the Fort Mac Life guide. Premium features are $7.99/month or $59.99/year.',
  },
  {
    q: 'Can my employer see my mood logs or personal data?',
    a: 'Never. Individual worker data is completely private and never visible to employers under any circumstances. Employers who license ShiftBuddys for their workforce receive only anonymized aggregate data — team-level trends with no individual identification possible. This is a legal guarantee, not just a promise.',
  },
  {
    q: 'Does my family need to download a separate app?',
    a: 'Your family gets a free companion app included with your account — up to 5 family members. They download the same ShiftBuddys app and join your family circle with an invite link you send them via SMS or WhatsApp.',
  },
  {
    q: 'What rotation patterns does ShiftBuddys support?',
    a: 'ShiftBuddys supports all standard oilsands rotation patterns: 14 on/7 off, 21 on/7 off, 7 on/7 off, and fully custom patterns. You set it once and your entire year generates automatically.',
  },
  {
    q: 'Does the app work when I have no internet at camp?',
    a: 'Yes — ShiftBuddys is designed for offline use. Your shift schedule, countdown, and family calendar are cached on your device. Mood check-ins and journal entries save offline and sync when you reconnect. Critical features never require a live connection.',
  },
  {
    q: 'What is Coming Home Mode?',
    a: 'Coming Home Mode activates automatically 48 hours before your rotation ends. It switches your home screen to a special mode with countdown, conversation prompts for both you and your partner, and a gentle reintegration checklist. It helps make the first 24 hours home the best they can be.',
  },
  {
    q: 'How does the Shift Swap Marketplace work?',
    a: 'You post a shift you need covered (date, type, and what you\'re offering in return). Only your verified crewmates on the same rotation can see and respond. When someone offers to cover it, you confirm via in-app chat and the app generates a summary you can screenshot for your supervisor.',
  },
  {
    q: 'Is ShiftBuddys available on both iPhone and Android?',
    a: 'Yes — ShiftBuddys is available on both iOS (iPhone) and Android. Both apps are identical in features.',
  },
]

// ─── Download section ─────────────────────────────────────────
export const DOWNLOAD = {
  headline: 'Start Your Countdown Today',
  subheadline: 'Download ShiftBuddys free. Set your rotation in 60 seconds.',
  note: 'No credit card. No commitment. Just your countdown to home.',
  // PHOTO: Replace with /images/app-mockup.png
  // Ideal: iPhone and Android phone showing the app home screen with countdown
  mockup: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&q=85&fit=crop',
}
