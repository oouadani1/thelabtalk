// ============================================================
// CONTENT.JS — edit everything here.
// To add a photo: set image: "images/your-file.jpg"
// To change stop text: edit context / objective / how / result
// To change result label to "Insight": set resultLabel: "Insight"
// ============================================================

// ----------------------------------------------------------
// LINES
// ----------------------------------------------------------
const LINES = [
  { id: "fellowship", name: "Fellowship Line", color: "berkshires-green" },
  { id: "duckling",   name: "Duckling Line",   color: "duckling-yellow" },
];

// ----------------------------------------------------------
// THEMES — sets the station accent color
// Keys: tag name. Values: CSS variable name.
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
// type: "intro" | "outro" → shows body text (no four-point grid)
// type: undefined → regular four-point stop
// ----------------------------------------------------------
const STOPS = [

  // ── COLD OPEN ─────────────────────────────────────────
  {
    id:    "cold-open",
    type:  "intro",
    line:  "fellowship",
    title: "Service launch, +2 hrs",
    body:  "Arrived two hours late on the first day. A snowstorm had taken down most of the region's transit. The commute ended up taking as long as the onboarding.",
    image: null,
  },

  // ── STOP 1 ────────────────────────────────────────────
  {
    id:          "reading-the-map",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "Reading the whole map",
    context:     "Arrived to a full micromobility docket. The Micromobility Commission had just released its final report.",
    objective:   "Get oriented, quickly.",
    how:         "Read everything — starting with the Commission report.",
    result:      "Became the Lab's reference point on it. Most of what followed traced back to this.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 2 ────────────────────────────────────────────
  {
    id:          "thank-you-cards",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "Thank-you cards",
    context:     "Commission members had just finished months of work.",
    objective:   "Acknowledge it properly.",
    how:         "Web-scraped contact info, sent cards.",
    result:      "A greeting card, built with Python. First official act.",
    resultLabel: "Insight",
    image:       null,
  },

  // ── STOP 3 ────────────────────────────────────────────
  {
    id:          "library-transit-screens",
    line:        "fellowship",
    theme:       "data_spatial",
    title:       "Library transit screens",
    context:     "Transit info screens in public libraries. No clear owner, no clear process.",
    objective:   "Map them. Surface the accessibility question.",
    how:         "Built an ArcGIS map. Hit unclear institutional pathways, kept at it.",
    result:      "Months later, headed to an accessibility-team audit.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 4 ────────────────────────────────────────────
  {
    id:          "commbuys-vendor-run",
    line:        "fellowship",
    theme:       "ops",
    title:       "COMMBUYS vendor run",
    context:     "The Commission report needed to exist as a physical document.",
    objective:   "Find who could print it.",
    how:         "Researched and contacted COMMBUYS vendors.",
    result:      "First contact with state procurement.",
    resultLabel: "Insight",
    image:       null,
  },

  // ── STOP 5 ────────────────────────────────────────────
  {
    id:          "decoding-vins",
    line:        "fellowship",
    theme:       "data_spatial",
    title:       "Decoding VINs",
    context:     "Truck-crash data locked inside raw vehicle identification codes.",
    objective:   "Make it usable.",
    how:         "Decoded the VINs in Python.",
    result:      "Opaque codes became analyzable safety data.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 6 ────────────────────────────────────────────
  {
    id:          "mass-micromobility-campaign",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "Mass Micromobility campaign",
    context:     "Recommendation 7 of the Commission report called for a public education campaign.",
    objective:   "Deliver one that could outlast the fellowship.",
    how:         "Led design and production — [TODO: # of posts/animations], centered on actual riders. Built a comms toolkit so municipalities could run their own.",
    result:      "A recommendation turned into a reusable asset.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 7 ────────────────────────────────────────────
  {
    id:          "micromobility-101-webinar",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "Micromobility 101 webinar",
    context:     "The campaign needed something durable behind it.",
    objective:   "A resource that holds past the campaign cycle.",
    how:         "Recorded a 101 webinar.",
    result:      "Standing reference material, independent of the campaign.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 8 ────────────────────────────────────────────
  {
    id:          "aarp-grant",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "AARP Livable Communities grant",
    context:     "Older adults are largely outside the reach of existing micromobility programs.",
    objective:   "Fund work to close that gap.",
    how:         "Wrote and secured the grant.",
    result:      "$14,930 for expanded access statewide.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 9 ────────────────────────────────────────────
  {
    id:          "explore-micromobility",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "Explore Micromobility",
    context:     "No single, accessible guide to micromobility options and local rules existed in Massachusetts.",
    objective:   "Build one that works for everyone.",
    how:         "Bilingual public web app, WCAG 2.2. Went through extensive internal review.",
    result:      "The Lab's main fellowship deliverable. Internal review surfaced process questions that hadn't been asked before.",
    resultLabel: "Result",
    image:       null,
    // [TODO: confirm this is the peak stop]
  },

  // ── STOP 10 ───────────────────────────────────────────
  {
    id:          "international-frameworks",
    line:        "fellowship",
    theme:       "research",
    title:       "International frameworks → Micro ID",
    context:     "Statewide Micro ID policy development needed grounding in how other places handle it.",
    objective:   "Learn from international precedent.",
    how:         "Researched regulatory frameworks across jurisdictions.",
    result:      "Analysis now feeding active Micro ID policy work.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 11 ───────────────────────────────────────────
  {
    id:          "micromobility-hub",
    line:        "fellowship",
    theme:       "micromobility",
    title:       "Micromobility Hub",
    context:     "Statewide guidance, toolkits, and resources lived in too many places.",
    objective:   "Centralize them.",
    how:         "Built a public-facing Micromobility Hub.",
    result:      "One place for everything — guidance, comms kit, educational and municipal materials.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 12 ───────────────────────────────────────────
  {
    id:          "public-engagement-research",
    line:        "fellowship",
    theme:       "research",
    title:       "Public engagement research",
    context:     "MassDOT wanted a clearer picture of its own public engagement practice.",
    objective:   "Benchmark against peer DOTs.",
    how:         "[TODO: confirm scope — landscape/benchmarking research]",
    result:      "A baseline for improving how the agency involves people in decisions.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 13 ───────────────────────────────────────────
  {
    id:          "av-planning",
    line:        "fellowship",
    theme:       "av",
    title:       "AV planning support",
    context:     "MassDOT's AV testing pathway wasn't visible internally.",
    objective:   "Make it legible, and easier to improve.",
    how:         "Process-mapped the existing pathway, presented to the team, built a Smartsheet application mockup.",
    result:      "The team could see the full pathway clearly for the first time.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 14 ───────────────────────────────────────────
  {
    id:          "safe-ride-act",
    line:        "fellowship",
    theme:       "research",
    title:       "Post–Safe Ride Act research",
    context:     "A public hearing flagged gaps in the Safe Ride Act amendments — classification, UL language, age limits.",
    objective:   "Build an evidence base for fixing them.",
    how:         "Researched precedent across moped classification, UL standards, and age restriction approaches.",
    result:      "Research grounding the identified gaps.",
    resultLabel: "Result",
    image:       null,
  },

  // ── STOP 15 ───────────────────────────────────────────
  {
    id:          "isa-next-steps",
    line:        "fellowship",
    theme:       "research",
    title:       "ISA next steps",
    context:     "Pravaar, a previous fellow, ran a thorough ISA experiment. The question was what scaling it would actually take.",
    objective:   "Scope the next chapter.",
    how:         "Built on that research — identified the data layers, coordination, and resources the next phase needs.",
    result:      "The experiment becomes a roadmap. Pass it on.",
    resultLabel: "Insight",
    image:       null,
  },

  // ── STOP 16 ───────────────────────────────────────────
  {
    id:          "lab-network-map",
    line:        "fellowship",
    theme:       "data_spatial",
    title:       "Lab network map",
    context:     "Three years of Lab projects and collaborations lived mostly in people's heads.",
    objective:   "Make it visible.",
    how:         "Built a Kumu network map of projects, people, and connections since 2023.",
    result:      "Worth noting: I turned out to be a node in it.",
    resultLabel: "Insight",
    image:       null,
  },

  // ── STOP 17 ───────────────────────────────────────────
  {
    id:          "bikeshare-walkshed",
    line:        "fellowship",
    theme:       "data_spatial",
    title:       "Bikeshare 10-minute walkshed",
    context:     "Five bikeshare operators in Massachusetts. Five inconsistent datasets.",
    objective:   "A single clean picture of who can actually reach a station.",
    how:         "Unified and cleaned all five datasets. Spatialized a 10-minute walkshed against population density and demographics.",
    result:      "A reusable spatial asset, handed off to Kris and Jaclyn.",
    resultLabel: "Result",
    image:       null,
  },

  // ── CLOSER ────────────────────────────────────────────
  {
    id:    "closer",
    type:  "outro",
    line:  "fellowship",
    title: "End of the line",
    body:  "I spent the last stretch mapping the Lab — three years of projects and the people who worked on them. Somewhere in that process, I found myself on the map too. The line keeps running.",
    image: null,
  },

];

// ----------------------------------------------------------
// PEOPLE — Duckling Line crossings (populate later)
// Each entry marks where someone intersected the Fellowship Line.
// ----------------------------------------------------------
const PEOPLE = [
  // { name: "Kris Carter",  atStop: "bikeshare-walkshed" },
  // { name: "Jaclyn",       atStop: "bikeshare-walkshed" },
  // { name: "Pravaar",      atStop: "isa-next-steps"     },
];

// ----------------------------------------------------------
// META
// ----------------------------------------------------------
const META = {
  title:    "Mind the Gap",
  subtitle: "Oussama Ouadani · Spring 2026 · The Lab @ MassDOT",
  line:     "Fellowship Line",
};
