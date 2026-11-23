import type { Metadata } from "next";
import { HackathonDetailPage } from "@/components/hackathons/HackathonDetail";

// Comprehensive demo event data
const DEMO_EVENTS: Record<string, any> = {
  "india-ai-2026": {
    id: "1",
    name: "India AI Innovation Challenge 2026",
    slug: "india-ai-2026",
    organizer: "Innovation Hacks",
    organizerVerified: true,
    organizerSlug: "innovation-hacks",
    mode: "online",
    tagline: "Build the future of Autonomous Intelligence — in 48 hours.",
    summary: "The largest AI hackathon in India. Compete across 5 tracks — LLMs, Computer Vision, Generative AI, AI for Good, and Open Innovation.",
    description: "Join India's most anticipated AI hackathon and push the boundaries of artificial intelligence. Whether you're building a generative AI agent, an edge computer vision tool, or an AI-powered solution for social good — this is your stage.\n\nOver 48 hours, teams of 2-5 will design, build, and present their solutions to a panel of judges from Google, Microsoft, NVIDIA, and leading Indian AI startups.",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&auto=format&fit=crop&q=80",
    tags: ["AI/ML", "Python", "Deep Learning", "LLMs", "Computer Vision"],
    prizePool: "₹10,00,000",
    isFree: false,
    ticketPrice: "₹499",
    participants: 4200,
    teamSize: "2-5",
    status: "registration_open",
    registrationDeadline: new Date(Date.now() + 8 * 86400000),
    startDate: new Date(Date.now() + 15 * 86400000),
    endDate: new Date(Date.now() + 17 * 86400000),
    submissionDeadline: new Date(Date.now() + 17 * 86400000 - 3600000),
    resultsDate: new Date(Date.now() + 20 * 86400000),
    timezone: "Asia/Kolkata",
    prizes: [
      { rank: 1, name: "Grand Champion (1st)", amount: "₹4,00,000", sponsor: "Innovation Hacks" },
      { rank: 2, name: "Runner Up (2nd)", amount: "₹2,00,000", sponsor: "Innovation Hacks" },
      { rank: 3, name: "2nd Runner Up (3rd)", amount: "₹1,00,000", sponsor: "Innovation Hacks" },
      { rank: null, name: "Best Use of Google Cloud AI", amount: "₹50,000", sponsor: "Google Cloud" },
      { rank: null, name: "Best AI for Social Good", amount: "₹50,000", sponsor: "NASSCOM Foundation" },
      { rank: null, name: "Best High School / Student Team", amount: "₹50,000", sponsor: "Innovation Hacks" },
    ],
    tracks: [
      { name: "Generative AI & Autonomous Agents", description: "Multi-agent orchestration, tool-using LLMs, and autonomous cognitive systems." },
      { name: "Computer Vision & Visual Intelligence", description: "Real-time edge perception, document intelligence, and assistive video tech." },
      { name: "NLP & Regional Indian Languages", description: "Vernacular speech, translation, and localized conversational interfaces." },
      { name: "AI for Climate & Social Impact", description: "Disaster warning systems, smart agriculture, and clean energy optimization." },
      { name: "Open Innovation Track", description: "Any breakthrough AI system that solves a pressing developer or consumer need." },
    ],
    sponsors: [
      { name: "Innovation Hacks", tier: "Title Partner", logo: "https://ui-avatars.com/api/?name=Innovation+Hacks&background=1565D8&color=fff&size=60" },
      { name: "Google Cloud", tier: "Platinum Sponsor", logo: "https://ui-avatars.com/api/?name=Google+Cloud&background=4285F4&color=fff&size=60" },
      { name: "NVIDIA", tier: "Gold Sponsor", logo: "https://ui-avatars.com/api/?name=NVIDIA&background=76B900&color=fff&size=60" },
    ],
    judges: [
      { name: "Dr. Priya Sharma", title: "Principal AI Scientist, Google DeepMind", avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=1565D8&color=fff&size=80" },
      { name: "Rahul Mehta", title: "Head of AI Architecture, Innovation Hacks", avatar: "https://ui-avatars.com/api/?name=Rahul+Mehta&background=0EA5E9&color=fff&size=80" },
      { name: "Ananya Krishnan", title: "Founder & CEO, NeuralStream AI", avatar: "https://ui-avatars.com/api/?name=Ananya+K&background=D97706&color=fff&size=80" },
      { name: "Vikram Singhal", title: "Partner, Bharat Innovation Fund", avatar: "https://ui-avatars.com/api/?name=Vikram+S&background=10B981&color=fff&size=80" },
    ],
  },
  "web3-summit-2026": {
    id: "2",
    name: "Web3 Builders Summit",
    slug: "web3-summit-2026",
    organizer: "CryptoHub India",
    organizerVerified: true,
    organizerSlug: "cryptohub",
    mode: "hybrid",
    location: "Bangalore, India",
    tagline: "Decentralized Finance, Zero Knowledge & Next-Gen Smart Contracts.",
    summary: "Build next-generation dApps on Ethereum, Solana, and Polygon with $25,000 in bounties.",
    description: "Web3 Builders Summit is Asia's premiere blockchain hackathon. Bring your laptop to Bangalore or build virtually from anywhere in the world. Compete for $25,000 in protocol grants and prize pools across DeFi, Account Abstraction, DePIN, and ZK Proofs.",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1400&auto=format&fit=crop&q=80",
    tags: ["Solidity", "DeFi", "Web3", "Ethereum", "Solana"],
    prizePool: "$25,000",
    isFree: false,
    ticketPrice: "$49",
    participants: 1800,
    teamSize: "1-4",
    status: "registration_open",
    registrationDeadline: new Date(Date.now() + 12 * 86400000),
    startDate: new Date(Date.now() + 22 * 86400000),
    endDate: new Date(Date.now() + 24 * 86400000),
    submissionDeadline: new Date(Date.now() + 24 * 86400000 - 3600000),
    resultsDate: new Date(Date.now() + 26 * 86400000),
    timezone: "Asia/Kolkata",
    prizes: [
      { rank: 1, name: "Grand Prize (1st)", amount: "$10,000", sponsor: "Polygon Labs" },
      { rank: 2, name: "DeFi Track Winner", amount: "$5,000", sponsor: "Uniswap Foundation" },
      { rank: 3, name: "Best ZK Innovation", amount: "$4,000", sponsor: "Starknet" },
      { rank: null, name: "Best Mobile dApp", amount: "$3,000", sponsor: "Solana Foundation" },
      { rank: null, name: "Best Public Good", amount: "$3,000", sponsor: "Gitcoin" },
    ],
    tracks: [
      { name: "Decentralized Finance & Yield Protocols", description: "Novel AMMs, cross-chain liquidity, and decentralized lending models." },
      { name: "Account Abstraction & Onboarding", description: "ERC-4337 smart contract wallets, gasless transactions, and seamless UX." },
      { name: "Decentralized Physical Infrastructure (DePIN)", description: "Hardware-connected networks, IoT sensors, and verifiable compute." },
      { name: "Zero Knowledge Proofs (ZKP)", description: "Privacy-preserving identity, zkRollups, and cryptographic verification." },
    ],
    sponsors: [
      { name: "Polygon Labs", tier: "Diamond Sponsor", logo: "https://ui-avatars.com/api/?name=Polygon&background=8247E5&color=fff&size=60" },
      { name: "Solana", tier: "Platinum Sponsor", logo: "https://ui-avatars.com/api/?name=Solana&background=14F195&color=000&size=60" },
    ],
    judges: [
      { name: "Siddharth Verma", title: "Ecosystem Lead, Polygon", avatar: "https://ui-avatars.com/api/?name=Sid+Verma&background=8247E5&color=fff&size=80" },
      { name: "Elena Rostova", title: "Core Protocol Researcher, Ethereum Foundation", avatar: "https://ui-avatars.com/api/?name=Elena+R&background=1565D8&color=fff&size=80" },
    ],
  },
  "student-hack-2026": {
    id: "3",
    name: "Student Hack: Open Innovation",
    slug: "student-hack-2026",
    organizer: "IIT Delhi Innovation Cell",
    organizerVerified: true,
    organizerSlug: "iit-delhi",
    mode: "online",
    tagline: "India's largest student hackathon — 100% Free for all college builders.",
    summary: "Build software, hardware, or mobile apps solving real-world challenges. Open to all students.",
    description: "Student Hack 2026 is organized by IIT Delhi Innovation Cell in collaboration with Innovation Hacks. Exclusively for college students and recent grads. Build any project you envision — no tech stack restriction, completely free registration, and direct mentorship from IIT alumni.",
    coverImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1400&auto=format&fit=crop&q=80",
    tags: ["Open Innovation", "Student", "Beginner Friendly", "Any Stack"],
    prizePool: "₹2,00,000",
    isFree: true,
    participants: 6800,
    teamSize: "2-6",
    status: "registration_open",
    registrationDeadline: new Date(Date.now() + 5 * 86400000),
    startDate: new Date(Date.now() + 10 * 86400000),
    endDate: new Date(Date.now() + 12 * 86400000),
    submissionDeadline: new Date(Date.now() + 12 * 86400000 - 3600000),
    resultsDate: new Date(Date.now() + 14 * 86400000),
    timezone: "Asia/Kolkata",
    prizes: [
      { rank: 1, name: "1st Place Champions", amount: "₹1,00,000", sponsor: "IIT Delhi Innovation Cell" },
      { rank: 2, name: "2nd Place Runners Up", amount: "₹60,000", sponsor: "Innovation Hacks" },
      { rank: 3, name: "3rd Place", amount: "₹40,000", sponsor: "IIT Delhi" },
    ],
    tracks: [
      { name: "Campus & Education Tech", description: "Fix learning, library, and campus productivity with smart tools." },
      { name: "Healthcare & Well-being", description: "Mental health apps, preventive wellness trackers, emergency response." },
      { name: "Smart Cities & Mobility", description: "Public transport optimization, waste reduction, civic reporting." },
      { name: "Open Innovation", description: "Any creative project built with passion and craftsmanship." },
    ],
    sponsors: [
      { name: "Innovation Hacks", tier: "Ecosystem Partner", logo: "https://ui-avatars.com/api/?name=Innovation+Hacks&background=1565D8&color=fff&size=60" },
      { name: "GitHub Education", tier: "Partner", logo: "https://ui-avatars.com/api/?name=GitHub&background=24292e&color=fff&size=60" },
    ],
    judges: [
      { name: "Prof. Arvind Rao", title: "Head of Dept, IIT Delhi", avatar: "https://ui-avatars.com/api/?name=Arvind+Rao&background=1565D8&color=fff&size=80" },
      { name: "Meera Nair", title: "Product Architect, Innovation Hacks", avatar: "https://ui-avatars.com/api/?name=Meera+Nair&background=0EA5E9&color=fff&size=80" },
    ],
  },
  "fintech-disrupt-2026": {
    id: "4",
    name: "FinTech Disrupt 2026",
    slug: "fintech-disrupt-2026",
    organizer: "Razorpay & HSBC",
    organizerVerified: true,
    organizerSlug: "razorpay-hsbc",
    mode: "offline",
    location: "Mumbai, India",
    tagline: "Reimagining Payments, Lending, UPI 2.0 & WealthTech.",
    summary: "₹15,00,000 prize pool. Build on production banking APIs live at the Mumbai Financial District.",
    description: "FinTech Disrupt 2026 is an in-person 36-hour sprint at the heart of Mumbai. Powered by Razorpay, HSBC, and Innovation Hacks. Teams get exclusive sandbox access to credit underwriting models, UPI 2.0 rails, and cross-border payment APIs.",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&auto=format&fit=crop&q=80",
    tags: ["FinTech", "Payments", "UPI", "Banking API", "WealthTech"],
    prizePool: "₹15,00,000",
    isFree: false,
    ticketPrice: "₹999",
    participants: 950,
    teamSize: "2-4",
    status: "registration_open",
    registrationDeadline: new Date(Date.now() + 18 * 86400000),
    startDate: new Date(Date.now() + 30 * 86400000),
    endDate: new Date(Date.now() + 32 * 86400000),
    submissionDeadline: new Date(Date.now() + 32 * 86400000 - 3600000),
    resultsDate: new Date(Date.now() + 34 * 86400000),
    timezone: "Asia/Kolkata",
    prizes: [
      { rank: 1, name: "1st Place — Grand Disruptor", amount: "₹7,00,000", sponsor: "Razorpay" },
      { rank: 2, name: "2nd Place", amount: "₹4,00,000", sponsor: "HSBC" },
      { rank: 3, name: "3rd Place", amount: "₹2,00,000", sponsor: "Innovation Hacks" },
      { rank: null, name: "Best Use of Razorpay APIs", amount: "₹2,00,000", sponsor: "Razorpay" },
    ],
    tracks: [
      { name: "UPI 2.0 & Next-Gen Payments", description: "Conversational payments, offline NFC transactions, cross-border remittance." },
      { name: "Alternative Credit Scoring & Lending", description: "Cashflow-based MSME underwriting and algorithmic micro-credit." },
      { name: "Fraud Detection & Compliance", description: "Real-time anomaly detection, AML monitoring, and biometrics." },
    ],
    sponsors: [
      { name: "Razorpay", tier: "Title Sponsor", logo: "https://ui-avatars.com/api/?name=Razorpay&background=0257B8&color=fff&size=60" },
      { name: "HSBC", tier: "Co-Host", logo: "https://ui-avatars.com/api/?name=HSBC&background=DB0011&color=fff&size=60" },
    ],
    judges: [
      { name: "Kunal Shah", title: "Fintech Angel & Advisor", avatar: "https://ui-avatars.com/api/?name=Kunal+S&background=1565D8&color=fff&size=80" },
      { name: "Deepa Menon", title: "VP of Engineering, Razorpay", avatar: "https://ui-avatars.com/api/?name=Deepa+M&background=0257B8&color=fff&size=80" },
    ],
  },
  "global-open-2026": {
    id: "9",
    name: "Global Open Innovation Challenge",
    slug: "global-open-2026",
    organizer: "Innovation Hacks",
    organizerVerified: true,
    organizerSlug: "innovation-hacks",
    mode: "online",
    tagline: "Build without limits. The world's largest open software challenge.",
    summary: "$50,000 Global Prize Pool. Over 12,000 builders competing across every tech stack.",
    description: "The Global Open Innovation Challenge is the flagship worldwide competition hosted by Innovation Hacks. We believe that groundbreaking ideas can come from anywhere. Choose any domain — developer tooling, SaaS, mobile apps, social platforms, or enterprise systems.",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80",
    tags: ["Open Innovation", "Global", "Any Stack", "Open Source"],
    prizePool: "$50,000",
    isFree: true,
    participants: 12000,
    teamSize: "1-6",
    status: "registration_open",
    registrationDeadline: new Date(Date.now() + 30 * 86400000),
    startDate: new Date(Date.now() + 45 * 86400000),
    endDate: new Date(Date.now() + 48 * 86400000),
    submissionDeadline: new Date(Date.now() + 48 * 86400000 - 3600000),
    resultsDate: new Date(Date.now() + 52 * 86400000),
    timezone: "UTC",
    prizes: [
      { rank: 1, name: "Global Winner (1st)", amount: "$20,000", sponsor: "Innovation Hacks" },
      { rank: 2, name: "2nd Place", amount: "$12,000", sponsor: "Innovation Hacks" },
      { rank: 3, name: "3rd Place", amount: "$8,000", sponsor: "Innovation Hacks" },
      { rank: null, name: "Best Open Source Contribution", amount: "$5,000", sponsor: "Open Source Collective" },
      { rank: null, name: "Community Choice Award", amount: "$5,000", sponsor: "Innovation Hacks" },
    ],
    tracks: [
      { name: "Developer Tools & Infrastructure", description: "CLI tools, testing frameworks, SDKs, and developer productivity systems." },
      { name: "Next-Gen SaaS & Enterprise", description: "B2B productivity tools, automations, and collaboration software." },
      { name: "Public Goods & Social Impact", description: "Education access, disaster response, and civic engagement software." },
    ],
    sponsors: [
      { name: "Innovation Hacks", tier: "Global Organizer", logo: "https://ui-avatars.com/api/?name=Innovation+Hacks&background=1565D8&color=fff&size=60" },
    ],
    judges: [
      { name: "Chief Architect", title: "Innovation Hacks Core Team", avatar: "https://ui-avatars.com/api/?name=IH+Judge&background=1565D8&color=fff&size=80" },
    ],
  },
};

// Fallback generator for any slug
function getEventBySlug(slug: string) {
  if (DEMO_EVENTS[slug]) return DEMO_EVENTS[slug];

  // Dynamic fallback for any slug so no page 404s
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    id: slug,
    name: title,
    slug: slug,
    organizer: "Innovation Hacks",
    organizerVerified: true,
    organizerSlug: "innovation-hacks",
    mode: "online",
    tagline: `Compete, build, and innovate in ${title}.`,
    summary: `Join top builders in ${title}. Submit your project and win rewards.`,
    description: `Welcome to ${title}, powered by Innovation Hacks. Join talented developers, designers, and innovators from across the globe to build cutting-edge solutions.\n\nOver the hackathon timeframe, participants will have access to mentorship, workshop sessions, and sponsor API tools to bring ideas to reality.`,
    coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1400&auto=format&fit=crop&q=80",
    tags: ["Technology", "Innovation", "Coding", "Builders"],
    prizePool: "₹5,00,000",
    isFree: true,
    participants: 2500,
    teamSize: "1-4",
    status: "registration_open",
    registrationDeadline: new Date(Date.now() + 10 * 86400000),
    startDate: new Date(Date.now() + 20 * 86400000),
    endDate: new Date(Date.now() + 22 * 86400000),
    submissionDeadline: new Date(Date.now() + 22 * 86400000 - 3600000),
    resultsDate: new Date(Date.now() + 25 * 86400000),
    timezone: "Asia/Kolkata",
    prizes: [
      { rank: 1, name: "1st Place Winner", amount: "₹2,50,000", sponsor: "Innovation Hacks" },
      { rank: 2, name: "Runner Up", amount: "₹1,50,000", sponsor: "Innovation Hacks" },
      { rank: 3, name: "2nd Runner Up", amount: "₹1,00,000", sponsor: "Innovation Hacks" },
    ],
    tracks: [
      { name: "General Track", description: "Solve core domain problems using modern software engineering." },
      { name: "Innovation Track", description: "Create novel approaches with AI, Web3, or Cloud technologies." },
    ],
    sponsors: [
      { name: "Innovation Hacks", tier: "Host Partner", logo: "https://ui-avatars.com/api/?name=Innovation+Hacks&background=1565D8&color=fff&size=60" },
    ],
    judges: [
      { name: "Technical Jury", title: "Innovation Hacks Panel", avatar: "https://ui-avatars.com/api/?name=Jury&background=1565D8&color=fff&size=80" },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  return {
    title: `${event.name} | HACKSYRA`,
    description: event.summary,
    openGraph: {
      title: `${event.name} | HACKSYRA`,
      description: event.summary,
      images: [event.coverImage],
    },
  };
}

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  return <HackathonDetailPage event={event} />;
}
