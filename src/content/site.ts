/**
 * Verified TAS Group content.
 *
 * Source: tasgroup.com.my (About the Company, Our Services, Contact Us pages), retrieved Oct 2026.
 * Copy is written for this site from those facts. Nothing here should be extended with
 * clients, volumes, fleet sizes, dates or claims that are not published by TAS.
 */

export const COMPANY = {
  name: "TAS Group of Companies",
  short: "TAS Group",
  email: "enquiry@tasgroup.com.my",
  phone: "+6 04-331 2922",
  phoneHref: "tel:+6043312922",
  founded: 1978,
  hq: "Butterworth, Penang",
  coords: "05°24′N 100°22′E",
} as const;

export const VISION =
  "Our vision is to pioneer sustainable logistics, setting the standard for excellence in customer satisfaction and environmental responsibility, delivering world class solutions.";

export const MISSION_POINTS = [
  "Deliver world class logistics solutions through a full spectrum of integrated services.",
  "Place environmental responsibility at the centre of how logistics is delivered.",
  "Pursue continuous improvement and innovation, including reducing carbon footprint.",
];

export const VALUES = [
  {
    title: "Dedicated to customers’ success",
    body: "Stay ahead of the supply chain and anticipate what customers will need next.",
  },
  {
    title: "Keep eyes on the business",
    body: "Pay attention to detail and share what we observe.",
  },
  {
    title: "Get it done",
    body: "Be resilient and resourceful when problems need solving.",
  },
  {
    title: "A thinking, learning organisation",
    body: "Scan for data and keep adapting our capabilities to serve clients.",
  },
];

export const CREDENTIALS = [
  { code: "MOF", title: "Registered Bumiputera contractor", detail: "Ministry of Finance, Malaysia" },
  { code: "MTO", title: "Certified Multimodal Transport Operator", detail: "Sea · Air · Land under one operator" },
  { code: "PPC", title: "Licensed cargo & stevedore company", detail: "Penang Port Commission" },
  { code: "RMC", title: "Customs clearance licence", detail: "Royal Malaysian Customs" },
];

/** Heritage: only 1978 and 1998 are dated by TAS sources. Later stages are deliberately undated. */
export const HERITAGE = [
  {
    id: "1978",
    marker: "1978",
    place: "Penang Port",
    code: "MYPEN",
    title: "Ganu Jaya, on the quayside",
    body: "The Group’s story begins with Ganu Jaya, a licensed stevedoring company supplying skilled labour for port operations in Penang.",
    capability: "Stevedoring",
  },
  {
    id: "1998",
    marker: "1998",
    place: "Butterworth",
    code: "BWH",
    title: "TAS Agency is founded",
    body: "TAS Agency opens in Butterworth as a licensed customs and shipping agent, built around the logistics needs of local small and medium industries.",
    capability: "Shipping & customs",
  },
  {
    id: "growth",
    marker: "Two decades",
    place: "Penang → Peninsular Malaysia",
    code: "FWD",
    title: "From agency to operator",
    body: "Over the next two decades TAS grows from agency work into freight forwarding, transportation, warehousing, project cargo and marine operations.",
    capability: "Freight · Transport · Warehousing · Marine",
  },
  {
    id: "network",
    marker: "Network",
    place: "Port Klang · KLIA · Langkawi · Singapore",
    code: "NET",
    title: "Beyond Penang",
    body: "The operational footprint extends to Port Klang, KLIA, Langkawi and Singapore, linking seaports, an air cargo hub and cross border land routes.",
    capability: "Regional network",
  },
  {
    id: "today",
    marker: "Today",
    place: "TAS Group of Companies",
    code: "TAS",
    title: "Integrated, door to door",
    body: "A total logistics group providing door to door domestic and international services for ship charterers, owners, exporters and importers.",
    capability: "Integrated logistics",
  },
] as const;

export type ServiceId =
  | "freight"
  | "customs"
  | "warehouse"
  | "transport"
  | "project"
  | "tugbarge"
  | "marine";

export type Service = {
  id: ServiceId;
  index: string;
  stage: string;
  title: string;
  kicker: string;
  body: string;
  points: string[];
  image: string;
  imageAlt: string;
};

export const SERVICES: Service[] = [
  {
    id: "freight",
    index: "01",
    stage: "Cargo departs",
    title: "Freight Forwarding",
    kicker: "Air Freight · Sea Freight",
    body: "International and domestic sea and air freight, arranged end to end, from full container loads to hand carried consignments.",
    points: [
      "Sea freight: Full Container Load (FCL) & Loose Container Load (LCL)",
      "Air freight, courier & hand carry",
      "Door to door solutions",
      "Dangerous goods handling",
      "High value & sensitive shipments",
    ],
    image: "/images/container-ship.jpg",
    imageAlt: "Aerial view of a loaded container ship leaving a white wake",
  },
  {
    id: "customs",
    index: "02",
    stage: "Cargo clears",
    title: "Customs Brokerage",
    kicker: "Licensed by Royal Malaysian Customs",
    body: "TAS clears cargo under its own customs clearance licence, with experienced brokers handling the documentation and regulatory detail that keeps shipments compliant.",
    points: [
      "Own customs clearance licence (Royal Malaysian Customs)",
      "Clearance at ports nationwide",
      "Documentation & regulatory expertise",
      "Full compliance with customs formalities",
    ],
    image: "/images/customs.jpg",
    imageAlt: "A controlled lane between tall stacks of shipping containers",
  },
  {
    id: "warehouse",
    index: "03",
    stage: "Cargo is stored",
    title: "Warehouse & Distribution",
    kicker: "Bonded & non bonded",
    body: "Bonded and non bonded warehousing in Penang, Butterworth, Klang, KLIA and Singapore, with value added handling before onward distribution.",
    points: [
      "Bonded & non bonded warehousing",
      "Penang · Butterworth · Klang · KLIA · Singapore",
      "24 hour security & CCTV surveillance",
      "Pick and pack, repacking & assembly",
      "Distribution services",
    ],
    image: "/images/warehouse.jpg",
    imageAlt: "Tall warehouse racking stacked with wrapped cartons",
  },
  {
    id: "transport",
    index: "04",
    stage: "Cargo moves by road",
    title: "Transportation",
    kicker: "Operated by Bexxbay Express",
    body: "Group subsidiary Bexxbay Express runs a fleet of 20+ bonded and non bonded trucks connecting ports, warehouses and customers across Malaysia and into Singapore.",
    points: [
      "20+ trucks, bonded & non bonded",
      "Container haulage, tipper & low loader trucks",
      "Full & loose truck load",
      "Local Malaysia and Singapore long haul",
    ],
    image: "/images/truck.jpg",
    imageAlt: "A semi trailer truck travelling along a highway",
  },
  {
    id: "project",
    index: "05",
    stage: "Cargo that doesn’t fit a box",
    title: "Project Cargo, Heavy Lift & Mover",
    kicker: "Planning to positioning",
    body: "Oversized and heavy cargo handled as a project, from planning, approvals and packing through heavy lift operations to installation on site.",
    points: [
      "Planning & consultation",
      "Authority approvals, sourcing & consolidation",
      "Heavy lift operations & export packing",
      "Insurance & warehousing",
      "Machinery positioning, installation & commissioning",
    ],
    image: "/images/heavy-lift.jpg",
    imageAlt: "A floating crane lifting a large industrial module in a harbour",
  },
  {
    id: "tugbarge",
    index: "06",
    stage: "Cargo on the water",
    title: "Tug & Barge",
    kicker: "Owner operator at Penang Port",
    body: "A specialised tug and barge fleet at Penang Port moves dry bulk cargo, and passenger boats operate within the port vicinity.",
    points: [
      "Tug & barge owner at Penang Port",
      "Dry bulk cargo transport",
      "Passenger boat operations in the port vicinity",
    ],
    image: "/images/tugboat.jpg",
    imageAlt: "A harbour tug crossing dark water",
  },
  {
    id: "marine",
    index: "07",
    stage: "Vessels are served",
    title: "Ship Agency & Marine Services",
    kicker: "Agency · Supply · Crew · Port labour",
    body: "Ship agency and a wide range of marine services for owners and charterers, from brokerage and bunkering to crew changes, stevedoring and repairs.",
    points: [
      "Ship agency, brokerage, chartering & chandling",
      "Bunkering (port & off port limits)",
      "Crew change & medical assistance",
      "Stevedoring, tele clerks & lashing gangs",
      "Ship spares clearance & just in time delivery",
      "Ship & boat repair, sludge removal",
    ],
    image: "/images/port-cranes.jpg",
    imageAlt: "Ship to shore cranes silhouetted against a sunset",
  },
];

export const MARINE_FULL_LIST = [
  "Ship Agency",
  "Ship Brokerage",
  "Ship Chandling",
  "Ship Chartering",
  "Tug Boat & Barge Hire",
  "Passenger / Crew Boat Hire",
  "Bunkering (port & off port)",
  "Crew Change & Medical Assistance",
  "Vessel Supplies & Replenishment",
  "Off Port Limit Services",
  "Cargo Survey",
  "Stevedoring Services",
  "Ship Spares Clearance & Delivery (JIT)",
  "Ship & Boat Repair",
  "Forklift, Crane & Shovel Rental",
  "Sludge Removal",
  "Skilled Port Workforce",
  "Tele Clerks & Lashing Gangs",
];

export type OfficeId = "penang" | "portklang" | "klia" | "langkawi" | "singapore";

export type Office = {
  id: OfficeId;
  name: string;
  role: string;
  code: string;
  lat: number;
  lon: number;
  address: string[];
  phone: string;
  fax?: string;
  capabilities: string[];
};

/** Published office addresses. lat/lon are place-level approximations for map placement. */
export const OFFICES: Office[] = [
  {
    id: "penang",
    name: "Penang",
    role: "Head Office",
    code: "PEN",
    lat: 5.399,
    lon: 100.366,
    address: ["No. 6 & 8, Lengkok Kapal", "Off Jalan Chain Ferry", "12100 Butterworth, Penang"],
    phone: "+6 04-331 2922",
    fax: "+6 04-332 6922",
    capabilities: ["Group head office", "Tug & barge at Penang Port", "Warehousing (Penang & Butterworth)", "Customs & shipping agency (TAS Agency, since 1998)"],
  },
  {
    id: "portklang",
    name: "Port Klang",
    role: "Office",
    code: "PKG",
    lat: 3.007,
    lon: 101.44,
    address: ["B-3-10, Boulevard BBT One", "Lebuh Batu Nilam 2, Bandar Bukit Tinggi", "41200 Klang, Selangor"],
    phone: "+6 03-3319 5922",
    capabilities: ["Office serving Port Klang", "Warehousing (Klang)"],
  },
  {
    id: "klia",
    name: "KLIA",
    role: "Office",
    code: "KUL",
    lat: 2.745,
    lon: 101.7,
    address: ["Room 03, Mezzanine Floor CS1", "Cainiao Aeropolis eWTP Hub, FCZ KLIA Cargo Village", "Jalan KLIA S3, 64000 Sepang"],
    phone: "+6 03-8703 3039",
    fax: "+6 03-8703 3040",
    capabilities: ["Office at KLIA Cargo Village", "Warehousing (KLIA)"],
  },
  {
    id: "langkawi",
    name: "Langkawi",
    role: "Office",
    code: "LGK",
    lat: 6.318,
    lon: 99.85,
    address: ["No. 45, Persiaran Mutiara", "Kelana Mas", "07000 Kuah, Langkawi"],
    phone: "+6 04-966 8833",
    fax: "+6 04-966 8933",
    capabilities: ["Office in Kuah, Langkawi"],
  },
  {
    id: "singapore",
    name: "Singapore",
    role: "Office",
    code: "SIN",
    lat: 1.327,
    lon: 103.7,
    address: ["119 Neythal Road", "Singapore 628605"],
    phone: "+65 9357 7822",
    capabilities: ["Office in Singapore", "Warehousing (Singapore)", "On the Group’s Malaysia and Singapore long haul trucking route"],
  },
];

export type Entity = {
  id: string;
  name: string;
  reg: string;
  role: string;
  /** true when the role is described by TAS sources; false when inferred only from the company name */
  verifiedRole: boolean;
  links: ServiceId[];
};

export const ENTITIES: Entity[] = [
  { id: "holdings", name: "TAS Management Holdings", reg: "1282566-A", role: "Group management & holding company", verifiedRole: false, links: [] },
  { id: "agency", name: "TAS Agency", reg: "474887-T", role: "Licensed customs & shipping agent, founded 1998 in Butterworth", verifiedRole: true, links: ["customs", "freight"] },
  { id: "maritime", name: "TAS Maritime", reg: "871757-T", role: "The Group’s maritime company", verifiedRole: false, links: ["tugbarge", "marine"] },
  { id: "freight", name: "TAS Freight Services", reg: "660925-A", role: "The Group’s freight company", verifiedRole: false, links: ["freight"] },
  { id: "bexxbay", name: "Bexxbay Express", reg: "913945-W", role: "Transportation: a fleet of 20+ bonded & non bonded trucks", verifiedRole: true, links: ["transport", "warehouse"] },
  { id: "ganujaya", name: "Ganu Jaya", reg: "0043580-T", role: "Licensed stevedoring since 1978: where the Group began", verifiedRole: true, links: ["marine"] },
];

export const NAV_SECTIONS = [
  { id: "top", label: "Origin", code: "00" },
  { id: "heritage", label: "Heritage", code: "01" },
  { id: "port", label: "Port", code: "02" },
  { id: "multimodal", label: "Sea · Air · Land", code: "03" },
  { id: "operations", label: "Operations", code: "04" },
  { id: "project-cargo", label: "Heavy Lift", code: "05" },
  { id: "marine", label: "Marine", code: "06" },
  { id: "network", label: "Network", code: "07" },
  { id: "group", label: "Group", code: "08" },
  { id: "control", label: "Control", code: "09" },
  { id: "responsibility", label: "Responsibility", code: "10" },
  { id: "quote", label: "Destination", code: "11" },
] as const;
