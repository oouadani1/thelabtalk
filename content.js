// ============================================================
// CONTENT.JS — edit everything here, nothing else needs touching
// for text, color, stop order, images, or people.
// ============================================================

// ----------------------------------------------------------
// LINES
// Each line needs: id, name, color (CSS variable name)
// ----------------------------------------------------------
const LINES = [
  { id: "fellowship", name: "Fellowship Line", color: "berkshires-green" },
  { id: "duckling",   name: "Duckling Line",   color: "duckling-yellow" },
];

// ----------------------------------------------------------
// THEMES — tag a stop; drives the station accent color
// Keys are tag names, values are CSS variable names
// ----------------------------------------------------------
const THEMES = {
  micromobility:  "bay-blue",
  data_spatial:   "independence-cranberry",
  av:             "granite-gray",
  research:       "berkshires-green",
  ops:            "granite-gray",
};

// ----------------------------------------------------------
// STOPS — in presentation order
//
// Fields:
//   id          unique slug (no spaces)
//   type        "intro" | "outro" | undefined (default = 4-point stop)
//   line        which line this stop lives on
//   theme       key from THEMES (sets accent color)
//   title       station name, shown big
//   body        for intro/outro only — free text, no four-point grid
//   context     for regular stops
//   objective   for regular stops
//   how         for regular stops
//   result      for regular stops (4th point)
//   resultLabel "Result" or "Insight" — defaults to "Result"
//   peak        true on exactly one stop = the high point (subtle emphasis)
//   image       null, or a path like "images/snow.jpg"
//   notes       presenter notes — only shown when N is pressed
// ----------------------------------------------------------
const STOPS = [
  // ── COLD OPEN ─────────────────────────────────────────
  {
    id:    "cold-open",
    type:  "intro",
    line:  "fellowship",
    title: "Service launch, +2 hrs",
    body:  "My first day I arrived two hours late. A snowstorm had taken down half the region's transit, which in hindsight was the most honest introduction to the work I could have asked for. The systems we lean on are fragile, and we show up anyway.",
    image: null,
    notes: "Set the tone slow. Let it land before you advance.",
  },

  // ── STOP 1 ────────────────────────────────────────────
  {
    id:        "reading-the-map",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "Reading the whole map",
    context:   "I arrived as a new fellow into a deep micromobility docket — and a major Micromobility Commission report had just dropped.",
    objective: "Get fluent, fast.",
    how:       "Read everything. Especially the Commission report.",
    result:    "Became the Lab's go-to on the report. It's the ground everything downstream stood on.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "Move fast through this one — it's setup.",
  },

  // ── STOP 2 ────────────────────────────────────────────
  {
    id:        "thank-you-cards",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "Thank-you cards",
    context:   "Commission members had just delivered a heavy lift. It seemed right to acknowledge that.",
    objective: "Thank them properly.",
    how:       "Web-scraped their contact info to send cards.",
    result:    "My first official act was a web scraper, for a greeting card. High-tech means, human ends.",
    resultLabel: "Insight",
    peak:      false,
    image:     null,
    notes:     "This one usually gets a quiet laugh. Don't oversell it.",
  },

  // ── STOP 3 ────────────────────────────────────────────
  {
    id:        "library-transit-screens",
    line:      "fellowship",
    theme:     "data_spatial",
    title:     "Library transit screens",
    context:   "Transit info screens in public libraries — no clear owner, no clear process.",
    objective: "Map them. Surface the accessibility question.",
    how:       "Built an ArcGIS map. Hit unclear institutional pathways. Kept at it.",
    result:    "Months on, it's being taken seriously and is headed for an accessibility-team audit. The delayed train still arrives.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 4 ────────────────────────────────────────────
  {
    id:        "commbuys-vendor-run",
    line:      "fellowship",
    theme:     "ops",
    title:     "COMMBUYS vendor run",
    context:   "The Commission report needed to physically exist.",
    objective: "Find who could print it.",
    how:       "Researched and contacted COMMBUYS vendors.",
    result:    "First contact with state procurement. Foreshadowing for later detective work.",
    resultLabel: "Insight",
    peak:      false,
    image:     null,
    notes:     "Move fast.",
  },

  // ── STOP 5 ────────────────────────────────────────────
  {
    id:        "decoding-vins",
    line:      "fellowship",
    theme:     "data_spatial",
    title:     "Decoding VINs",
    context:   "Truck-crash data locked inside raw vehicle identification codes — opaque by default.",
    objective: "Make it usable.",
    how:       "Parsed and decoded VINs in Python.",
    result:    "Turned opaque codes into analyzable safety data.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 6 ────────────────────────────────────────────
  {
    id:        "mass-micromobility-campaign",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "Mass Micromobility campaign",
    context:   "Recommendation 7 of the Commission report called for public education. A recommendation isn't a campaign.",
    objective: "Deliver it — and make it last.",
    how:       "Led and designed a social campaign ([TODO: # of posts/animations]), people-first angle uplifting actual riders, plus reusable kits so municipalities can run their own.",
    result:    "A recommendation turned into a scalable, handoff-ready asset.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "Let this one breathe — it's one of the bigger deliverables.",
  },

  // ── STOP 7 ────────────────────────────────────────────
  {
    id:        "micromobility-101-webinar",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "Micromobility 101 webinar",
    context:   "Public education needed a durable anchor, not just a social feed.",
    objective: "Make something evergreen.",
    how:       "Recorded a 101 webinar.",
    result:    "A standing resource that outlasts the campaign — and me.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 8 ────────────────────────────────────────────
  {
    id:        "aarp-grant",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "AARP Livable Communities grant",
    context:   "Older adults are underserved by micromobility access — and that gap has a funding solution.",
    objective: "Secure it.",
    how:       "Wrote and won the grant.",
    result:    "$14,930 to expand access for older adults statewide.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "Let the number land.",
  },

  // ── STOP 9 — PEAK ─────────────────────────────────────
  {
    id:        "explore-micromobility",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "Explore Micromobility",
    context:   "Residents lack a clear, accessible guide to their options and local rules.",
    objective: "Build one anyone can use.",
    how:       "Bilingual public web app, WCAG 2.2, extensive internal review.",
    result:    "Flagship deliverable — surfaced internal processes, won champions and sponsors, raised the Lab's visibility, and built relationships for future work.",
    resultLabel: "Result",
    peak:      true,   // [TODO: confirm this is the peak stop — move peak: true if not]
    image:     null,
    notes:     "This is the peak — let it breathe. Mention the bilingual/accessibility angle.",
  },

  // ── STOP 10 ───────────────────────────────────────────
  {
    id:        "international-frameworks",
    line:      "fellowship",
    theme:     "research",
    title:     "International frameworks → Micro ID",
    context:   "Statewide Micro ID policy needs grounding in what works elsewhere.",
    objective: "Learn from global precedent.",
    how:       "Researched and analyzed international regulatory frameworks.",
    result:    "Research feeding statewide Micro ID policy.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 11 ───────────────────────────────────────────
  {
    id:        "micromobility-hub",
    line:      "fellowship",
    theme:     "micromobility",
    title:     "Micromobility Hub",
    context:   "Guidance, toolkits, and resources were scattered. People didn't know where to look.",
    objective: "One public home for all of it.",
    how:       "Built a public-facing resource library centralizing statewide guidance, comms toolkit, educational and municipal materials.",
    result:    "The everything-in-one-place capstone for micromobility.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "Let this one breathe — it's a true capstone.",
  },

  // ── STOP 12 ───────────────────────────────────────────
  {
    id:        "public-engagement-research",
    line:      "fellowship",
    theme:     "research",
    title:     "Public engagement research",
    context:   "The agency wanted a clearer picture of how it brings the public in.",
    objective: "Benchmark current practice against peer DOTs.",
    how:       "[TODO: confirm scope — landscape/benchmarking research]",
    result:    "A benchmarking foundation for strengthening public engagement.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "ROOM BEAT — say out loud, don't show: \"One of these was for someone in this room. I'm told the feedback loop is now operational — we'll find out shortly.\" Do NOT name her. Do not put her name on screen.",
  },

  // ── STOP 13 ───────────────────────────────────────────
  {
    id:        "av-planning",
    line:      "fellowship",
    theme:     "av",
    title:     "AV planning support",
    context:   "MassDOT's AV testing process wasn't fully legible internally.",
    objective: "Make the pathway visible and improvable.",
    how:       "Process-mapped the existing AV testing process, presented to the internal team, built a Smartsheet application mockup.",
    result:    "Helped the team see and streamline the pathway — a new branch on the line.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 14 ───────────────────────────────────────────
  {
    id:        "safe-ride-act",
    line:      "fellowship",
    theme:     "research",
    title:     "Post–Safe Ride Act research",
    context:   "A public hearing surfaced gaps in the amendments.",
    objective: "Inform fixes with precedent and best practice.",
    how:       "Researched moped classification, UL language, and age limitations.",
    result:    "An evidence base supporting the identified gaps.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 15 ───────────────────────────────────────────
  {
    id:        "isa-next-steps",
    line:      "fellowship",
    theme:     "research",
    title:     "ISA next steps",
    context:   "A previous fellow ran thorough ISA experiment research. The experiment was done. The question was what scaling it actually requires.",
    objective: "Scope the next chapter.",
    how:       "Built on Pravaar's work, identified the data layers and coordination needed to move from experiment to deployment.",
    result:    "One fellow's experiment becomes the next fellow's roadmap. The relay baton — which is exactly what I'm about to hand off.",
    resultLabel: "Insight",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 16 ───────────────────────────────────────────
  {
    id:        "lab-network-map",
    line:      "fellowship",
    theme:     "data_spatial",
    title:     "Lab network map",
    context:   "Three years of Lab work lived in people's heads.",
    objective: "Make institutional memory visible.",
    how:       "Built a Kumu network map of projects, people, and connections since 2023.",
    result:    "I spent months mapping the Lab's network and turned out to be a node in it the whole time.",
    resultLabel: "Insight",
    peak:      false,
    image:     null,
    notes:     "",
  },

  // ── STOP 17 ───────────────────────────────────────────
  {
    id:        "bikeshare-walkshed",
    line:      "fellowship",
    theme:     "data_spatial",
    title:     "Bikeshare 10-minute walkshed",
    context:   "Five MA bikeshare operators. Five messy datasets. No single view of who can actually reach a station.",
    objective: "One clean source.",
    how:       "Unified and cleaned all five operators' data, spatialized a population-density walkshed, analyzed against age equity and demographics.",
    result:    "A reusable spatial asset, handed off to Kris and Jaclyn. Access within reach — and the line's last stop.",
    resultLabel: "Result",
    peak:      false,
    image:     null,
    notes:     "Let this one breathe. It's the last project stop.",
  },

  // ── CLOSER ────────────────────────────────────────────
  {
    id:    "closer",
    type:  "outro",
    line:  "fellowship",
    title: "End of the line",
    body:  "I spent the last stretch mapping the Lab — three years of projects and the people who carried them. Somewhere in the building of it I realized I'd become one of the nodes. That's the quiet logic of this place: the work is meant to outlast the person doing it. I'm getting off here. The line keeps running.",
    image: null,
    notes: "17 stops in ~10 minutes is ~30 seconds each. Move fast through 1–5; let 6, 8, 9, 11, 17 breathe.",
  },
];

// ----------------------------------------------------------
// PEOPLE — the Duckling Line crossings
// Each entry marks where someone intersected the Fellowship Line.
// Populate later; data model is ready.
// ----------------------------------------------------------
const PEOPLE = [
  // { name: "Kris Carter",  atStop: "bikeshare-walkshed" },
  // { name: "Jaclyn",       atStop: "bikeshare-walkshed" },
  // { name: "Pravaar",      atStop: "isa-next-steps"     },
];

// ----------------------------------------------------------
// META — talk title, subtitle, presented by
// ----------------------------------------------------------
const META = {
  title:    "Mind the Gap",
  subtitle: "Oussama Ouadani · Spring 2026 · The Lab @ MassDOT",
  line:     "Fellowship Line",
};
