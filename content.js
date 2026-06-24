// ============================================================
// CONTENT.JS — edit everything here.
// Regular stops use: gap / action / learning / link / image
// Intro/closer stops use: body / image
// ============================================================

// ----------------------------------------------------------
// LINES
// ----------------------------------------------------------
const LINES = [
  { id: "fellowship", name: "Fellowship Line", color: "bay-blue" },
  { id: "duckling",   name: "Duckling Line",   color: "duckling-yellow" },
];

// ----------------------------------------------------------
// THEMES — sets the station accent color
// ----------------------------------------------------------
const THEMES = {
  micromobility:  "berkshires-green",
  data_spatial:   "independence-cranberry",
  av:             "granite-gray",
  research:       "bay-blue",
  ops:            "granite-gray",
};

// ----------------------------------------------------------
// STOPS — in presentation order
// ----------------------------------------------------------
const STOPS = [

  // ── INTRO ─────────────────────────────────────────────
  {
    id:    "first-day",
    type:  "intro",
    line:  "fellowship",
    title: "First Day!",
    body:  "2 hours late to my first day! First gap. A fitting reminder of the work I was about to do. My objectives: learn, expand my skill set, understand and probe more public system gaps",
    image: "images/porter-sq-snow.png",
  },

  // ── STOP 1 ────────────────────────────────────────────
  {
    id:       "reading-the-map",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "Getting a lay of the land",
    gap:      "Me! Brand new to the world of applied transportation.",
    action:   "Read the Commission Final Report cover to cover, guided by Caroline DeMarco.",
    learning: "Source of truth for the whole fellowship. Most of what followed traced back here.",
    link:     null,
    image:    "images/micromobility-report.png",
  },

  // ── STOP 2 ────────────────────────────────────────────
  {
    id:       "thank-you-cards",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "Thank you cards",
    gap:      "Commission members' contacts scattered across the web.",
    action:   "Manual research plus light automated scraper to support distribution of cards",
    learning: "Applying innovation to the small details; first green light to bring a different approach to an old problem.",
    link:     null,
    image:    "images/thankyou.png",
  },

  // ── STOP 3 ────────────────────────────────────────────
  {
    id:       "decoding-vins",
    line:     "fellowship",
    theme:    "data_spatial",
    title:    "Decoding VINs",
    gap:      "Truck crash data hidden inside undecoded VINs.",
    action:   "Learned the Mass Crash Data Portal, filtered crashes, decoded VINs in Python.",
    learning: "First time decoding VINs. The moment it worked was a great feeling",
    link:     null,
    image:    "images/vin.png",
  },

  // ── STOP 4 ────────────────────────────────────────────
  {
    id:       "library-transit-screens",
    line:     "fellowship",
    theme:    "data_spatial",
    title:    "Library transit screens map",
    gap:      "No spatial visualization of which libraries had transit screens.",
    action:   "GeoDOT license, ArcGIS map, weeks of compliance and process; project went cold; picked it back up, ow headed for an accessibility audit.",
    learning: "Learning when and how to kickstart a project again",
    link:     null,
    image:    "images/librarymap.png",
  },

  // ── STOP 5 ────────────────────────────────────────────
  {
    id:       "commbuys-vendor-run",
    line:     "fellowship",
    theme:    "ops",
    title:    "Printing the Report",
    gap:      "Commission report existed as a PDF.",
    action:   "Navigated COMMBUYS, found vendors, got the purchasing process moving.",
    learning: "First real encounter with government procurement; sometimes inefficient and leads to more cost overruns than the cost of procurement itself.",
    link:     null,
    image:    "images/commsbuy.png",
  },

  // ── STOP 6 ────────────────────────────────────────────
  {
    id:       "mass-micromobility-campaign",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "Mass Micromobility",
    gap:      "Recommendation 7 called for a public education campaign.",
    action:   "Five-week campaign, 21 posts, ten rider profiles, municipal toolkit.",
    learning: "How to operationalize creative work through institutional processes, and the power of uplifting people.",
    link:     null,
    image:    "images/social.png",
  },

  // ── STOP 7 ────────────────────────────────────────────
  {
    id:       "micromobility-101-webinar",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "Micromobility 101 Webinar",
    gap:      "General-audience educational resource on micromobility in Massachusetts needed following report.",
    action:   "Wrote, recorded, reviewed with RMV and City of Boston, published on the Hub.",
    learning: "The importance of storytelling and centering the human when distilling complex, right-brained topics",
    link:     null,
    image:    "images/webinar.png",
  },

  // ── STOP 8 ────────────────────────────────────────────
  {
    id:       "aarp-grant",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "AARP Livable Communities Grant",
    gap:      "Older adults largely left out of shared micromobility planning.",
    action:   "Research, budget, partner coordination, internal review, secured our full request: $14,930.",
    learning: "Best work comes from synthesizing a lot of perspectives into one coherent thing.",
    link:     null,
    image:    "images/aarp.png",
  },

  // ── STOP 9 ────────────────────────────────────────────
  {
    id:       "explore-micromobility",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "Explore Micromobility",
    gap:      "No single accessible guide to micromobility options and local regulations.",
    action:   "Developed bilingual public web app, WCAG 2.2 compliant, extensive internal review.",
    learning: "Deploying revealed how unclear institutional pathways can sometimes be, but hopefully carved a pathway for future projects.",
    link:     null,
    image:    "images/explore.png",
  },

  // ── STOP 10 ───────────────────────────────────────────
  {
    id:       "international-frameworks",
    line:     "fellowship",
    theme:    "research",
    title:    "Micro ID research",
    gap:      "Recommended statewide Micro ID policy needed grounding in international precedent.",
    action:   "Research across various jurisdictions, synthesized for Massachusetts context.",
    learning: "Foundation is there for a future fellow to hopefully pick it up.",
    link:     null,
    image:    "images/microid.png",
  },

  // ── STOP 11 ───────────────────────────────────────────
  {
    id:       "micromobility-hub",
    line:     "fellowship",
    theme:    "micromobility",
    title:    "Micromobility Hub",
    gap:      "Commission report resources scattered with no central home.",
    action:   "Coordinated with IT, stood up the Hub, filled it with resources.",
    learning: "Centralizing public resources is important in our fast-paced world!",
    link:     "https://www.mass.gov/micromobility-hub",
    image:    "images/hub.png",
  },

  // ── STOP 12 ───────────────────────────────────────────
  {
    id:       "public-engagement-research",
    line:     "fellowship",
    theme:    "research",
    title:    "DOT Public Engagement Research",
    gap:      "Open question about how MassDOT's public engagement practice (our own PPP) compared to peer DOTs.",
    action:   "Benchmarking research, recommendations including a digital engagement plan and IAP2 pilot.",
    learning: "The importance of public engagement, challenges, and risks",
    link:     null,
    image:    "images/iap2.png",
  },

  // ── STOP 13 ───────────────────────────────────────────
  {
    id:       "av-planning",
    line:     "fellowship",
    theme:    "av",
    title:    "AV Planning + Prototyping",
    gap:      "AV application process needed revision.",
    action:   "Process map, Smartsheet demo, supported internal AV planning series.",
    learning: "Small digital prototype and legible process map.",
    link:     "https://app.smartsheet.com/b/form/019e21d1e4c87536b5308a8b26d182a1",
    image:    "images/AVmap.png",
  },

  // ── STOP 14 ───────────────────────────────────────────
  {
    id:       "safe-ride-act",
    line:     "fellowship",
    theme:    "research",
    title:    "Post Safe Ride Act Research",
    gap:      "Public hearing surfaced gaps in the Ride Safe Act.",
    action:   "Precedent research across moped classification, UL language, age limits.",
    learning: "Informed conversations between the Lab and the Joint Committee on Transportation.",
    link:     null,
    image:    "images/hearing.png",
  },

  // ── STOP 15 ───────────────────────────────────────────
  {
    id:       "isa-next-steps",
    line:     "fellowship",
    theme:    "research",
    title:    "ISA Future Pathways Research",
    gap:      "Pravar's ISA research and experiment pointed out implementation gaps.",
    action:   "Probed those gaps to identify discrete data layers, coordination, and pathways needed for statewide rollout.",
    learning: "Real data gaps exist, but the state is well positioned to address this and become deployment ready.",
    link:     null,
    image:    "images/ISA.png",
  },

  // ── STOP 16 ───────────────────────────────────────────
  {
    id:       "bikeshare-walkshed",
    line:     "fellowship",
    theme:    "data_spatial",
    title:    "Bikeshare 10-min Walkshed",
    gap:      "Five seperate operators and datasets, incomplete picture of access.",
    action:   "Cleaned and unified all five, built a 10-minute walkshed against population density and demographics.",
    learning: "1 in 5 Massachusetts residents are within a 10-minute walk of bikeshare. Would not take much to connect everyone.",
    link:     "https://github.com/oouadani1/ma-bikeshare-coverage",
    image:    "images/bikesharemap.png",
  },

  // ── STOP 17 ───────────────────────────────────────────
  {
    id:       "lab-network-map",
    line:     "fellowship",
    theme:    "data_spatial",
    title:    "Lab Projects Network Map",
    gap:      "Three years of awesome Lab work living in institional memory and a few webpages",
    action:   "Kumu network map of every Lab project since 2023 and the connections between them.",
    learning: "The Lab is crafty at combining work and scaling projects up to address public sector gaps. ",
    link:     "https://kumu.io/theLab/the-lab-massdot-projects#the-lab-projects-network-map/the-lab-massdot",
    image:    "images/kumu.png",
  },

  // ── FINALE ────────────────────────────────────────────
  {
    id:    "finale",
    type:  "finale",
    line:  "fellowship",
    title: "Thank you.",
    body:  "Across all of it, my projects kept circling the same question: where is the gap between a system and the person trying to use it, and what would it take to close that gap? The form the answer took changed from project to project, whether it was a scraper, a web app, a grant, a cleaned dataset, a policy memo, or a map of the Lab itself, but the question underneath never really changed. That is the question I want to keep working on, in transportation, in city planning, and across the public sector more broadly.",
    image: null,
  },

];

// ----------------------------------------------------------
// PEOPLE — Duckling Line crossings (populate later)
// ----------------------------------------------------------
const PEOPLE = [
  // { name: "Kris Carter",  atStop: "bikeshare-walkshed" },
  // { name: "Jaclyn",       atStop: "bikeshare-walkshed" },
  // { name: "Pravar",      atStop: "isa-next-steps"     },
];

// ----------------------------------------------------------
// ACKNOWLEDGMENTS — shown on the finale slide departure board.
// ----------------------------------------------------------
const ACKNOWLEDGMENTS = [
  { name: "Kris Carter",          org: "The Lab @ MassDOT" },
  { name: "Jaclyn Youngblood",    org: "The Lab @ MassDOT" },
  { name: "Sam Grunebaum",        org: "The Lab @ MassDOT" },
  { name: "Sophia Regazzini",     org: "The Lab @ MassDOT" },
  { name: "Pravar Parashar",      org: "The Lab @ MassDOT" },
  { name: "Derek Krevat",         org: "MassDOT" },
  { name: "Amelia Aubourg",       org: "MassDOT" },
  { name: "Cheryl Dustin",        org: "MassDOT" },
  { name: "Faisa Sharif",         org: "MassDOT" },
  { name: "Michelle Deng",        org: "MassDOT" },
  { name: "Samantha Silverberg",  org: "MassDOT" },
  { name: "Matt Bamonte",         org: "MassDOT" },
  { name: "Marshall Hook",        org: "MassDOT" },
  { name: "Matt Grew",            org: "MassDOT" },
  { name: "Tiandra Ray",          org: "MassDOT" },
  { name: "Hannah Shumway",       org: "MassDOT" },
  { name: "Kristin Diamond",      org: "MassDOT" },
  { name: "Rachel Fichtenbaum",   org: "MassDOT" },
  { name: "John Goggin",          org: "MassDOT" },
  { name: "Patricia Cahill",      org: "MassDOT" },
  { name: "Galen Mook",           org: "MassBike" },
  { name: "Alex Salcedo",         org: "MassBike" },
  { name: "Matt Warfield",        org: "MBTA" },
  { name: "Carmel Levy",          org: "MBTA" },
  { name: "Yabe Abebe",           org: "MBTA" },
  { name: "Becca Smith",          org: "MBTA" },
  { name: "Jacob Brodeur",        org: "MBTA" },
  { name: "Michael Evans",        org: "City of Boston" },
  { name: "Michelle Ellicks",     org: "RMV" },
  { name: "Kara Oberg",           org: "co:census + Commission Member" },
  { name: "James Fuccione",       org: "MHAC" },
  { name: "Matt MacNabb",         org: "MBTA" },
  { name: "Kat Eshel",            org: "MBTA" },
  { name: "Karti Subramanian",    org: "MBTA" },
  { name: "Niren Sirohi",         org: "RMV" },
  { name: "Reggie Alexandre",     org: "MassDOT" },
  { name: "Andrea Burn",          org: "City of Boston" },
  { name: "Elijah Sinclair",      org: "MassCEC" },
  { name: "Carolyn Misch",        org: "City of Northampton" },
  { name: "Katerine Jansen",      org: "MABPAB" },
  // add more below — the board scrolls automatically
];

// ----------------------------------------------------------
// META
// ----------------------------------------------------------
const META = {
  title:    "Mind the Gap",
  subtitle: "Oussama Ouadani · Spring 2026 · The Lab @ MassDOT",
  line:     "Fellowship Line",
};
