"use client";
import { useState, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type POC = "Jenny" | "Doris" | "Jialin" | "Falida";
type Stage =
  | "Sourced" | "Contacted" | "Negotiating" | "Brief Sent"
  | "Script Review" | "In Production" | "Published" | "Completed";
type NavTab =
  | "Overview" | "Pipeline" | "Outreach" | "Content" | "Payment" | "Report" | "Partners";

interface Creator {
  id: string; handle: string; name: string;
  followers: number; er: number; avg_views: number;
  niche: string; stage: Stage; poc: POC;
  price: number; content_type: string; post_date: string;
  views_24h: number; signups: number; score: number;
  outreach_sent: boolean; fu_count: number; last_contact: string;
  email: string; notes: string;
  payment_status: "Pending" | "Invoiced" | "Paid";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const POC_COLORS: Record<POC, string> = {
  Jenny: "#f59e0b", Doris: "#3b82f6", Jialin: "#ec4899", Falida: "#22c55e",
};
const POC_BG: Record<POC, string> = {
  Jenny: "#fef3c7", Doris: "#dbeafe", Jialin: "#fce7f3", Falida: "#dcfce7",
};

const STAGE_COLORS: Record<Stage, string> = {
  "Sourced":       "#94a3b8",
  "Contacted":     "#60a5fa",
  "Negotiating":   "#f59e0b",
  "Brief Sent":    "#f97316",
  "Script Review": "#a855f7",
  "In Production": "#22c55e",
  "Published":     "#06b6d4",
  "Completed":     "#1d4ed8",
};

const STAGES: Stage[] = [
  "Sourced","Contacted","Negotiating","Brief Sent",
  "Script Review","In Production","Published","Completed",
];

const NAV_TABS: NavTab[] = [
  "Overview","Pipeline","Outreach","Content","Payment","Report","Partners",
];

// SVG icons
const ICONS: Record<NavTab, string> = {
  Overview:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/></svg>`,
  Pipeline:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="3.5" height="14" rx="1.5" fill="currentColor" opacity=".9"/><rect x="6.25" y="1" width="3.5" height="10" rx="1.5" fill="currentColor" opacity=".9"/><rect x="11.5" y="1" width="3.5" height="6" rx="1.5" fill="currentColor" opacity=".9"/></svg>`,
  Outreach:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M1 5.5L8 9.5L15 5.5" stroke="currentColor" stroke-width="1.5"/></svg>`,
  Content:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 5.5L11 8L6.5 10.5V5.5Z" fill="currentColor"/></svg>`,
  Payment:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M1 7H15" stroke="currentColor" stroke-width="1.5"/><rect x="3" y="9" width="3" height="1.5" rx=".75" fill="currentColor"/></svg>`,
  Report:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor"/><rect x="6" y="5" width="3" height="10" rx="1" fill="currentColor"/><rect x="11" y="1" width="3" height="14" rx="1" fill="currentColor"/></svg>`,
  Partners:  `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="5" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M12 10c1.66 0 3 1.34 3 3" stroke="currentColor" stroke-width="1.5"/></svg>`,
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_CREATORS: Creator[] = [
  { id:"c01",handle:"@marcuswebb",  name:"Marcus Webb",    followers:245000,er:4.2,avg_views:38000,niche:"Career",   stage:"Published",     poc:"Jenny", price:1850,content_type:"AI Tool Review",  post_date:"2026-06-01",views_24h:52000,signups:218,score:100,outreach_sent:true, fu_count:0,last_contact:"2026-05-10",email:"marcus@webb.co",          notes:"Top performer, repeat Q3",    payment_status:"Paid"},
  { id:"c02",handle:"@sophialin",   name:"Sophia Lin",     followers:189000,er:5.1,avg_views:29000,niche:"Jobs",     stage:"Published",     poc:"Doris", price:1400,content_type:"Job Search Hack", post_date:"2026-06-03",views_24h:41000,signups:187,score:92, outreach_sent:true, fu_count:0,last_contact:"2026-05-12",email:"sophia@linmedia.com",     notes:"Great retention rate",        payment_status:"Paid"},
  { id:"c03",handle:"@alexchang",   name:"Alex Chang",     followers:312000,er:3.3,avg_views:55000,niche:"Tech",     stage:"Published",     poc:"Jenny", price:2800,content_type:"Tool Comparison",  post_date:"2026-06-05",views_24h:63000,signups:241,score:89, outreach_sent:true, fu_count:0,last_contact:"2026-05-08",email:"alex@changtech.io",       notes:"Needs FU on invoice",         payment_status:"Invoiced"},
  { id:"c04",handle:"@priyapatel",  name:"Priya Patel",    followers:98000, er:6.8,avg_views:18000,niche:"Career",   stage:"In Production", poc:"Jialin",price:780, content_type:"Resume Review",     post_date:"2026-06-12",views_24h:0,    signups:0,  score:0,  outreach_sent:true, fu_count:1,last_contact:"2026-05-20",email:"priya@patelcreates.com",  notes:"Script v2 approved",          payment_status:"Pending"},
  { id:"c05",handle:"@tomrivera",   name:"Tom Rivera",     followers:421000,er:2.8,avg_views:72000,niche:"Lifestyle",stage:"Script Review", poc:"Falida",price:3600,content_type:"Career Tip",         post_date:"2026-06-15",views_24h:0,    signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-18",email:"tom@riveracontent.com",    notes:"Waiting on v2",               payment_status:"Pending"},
  { id:"c06",handle:"@emmachen",    name:"Emma Chen",      followers:67000, er:7.2,avg_views:12000,niche:"Jobs",     stage:"Brief Sent",    poc:"Jenny", price:520, content_type:"Job Search Hack", post_date:"2026-06-18",views_24h:0,    signups:0,  score:0,  outreach_sent:true, fu_count:1,last_contact:"2026-05-22",email:"emma@chencreates.co",      notes:"Confirmed brief receipt",     payment_status:"Pending"},
  { id:"c07",handle:"@jakemorris",  name:"Jake Morris",    followers:156000,er:4.5,avg_views:27000,niche:"Tech",     stage:"In Production", poc:"Doris", price:1200,content_type:"AI Tool Review",  post_date:"2026-06-14",views_24h:0,    signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-19",email:"jake@jakemorris.tv",       notes:"Shooting this week",          payment_status:"Pending"},
  { id:"c08",handle:"@lilykim",     name:"Lily Kim",       followers:234000,er:3.9,avg_views:41000,niche:"Career",   stage:"Negotiating",   poc:"Jialin",price:1700,content_type:"Career Tip",        post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:2,last_contact:"2026-05-23",email:"lily@kimvision.com",       notes:"Counter offer $2000",         payment_status:"Pending"},
  { id:"c09",handle:"@davidpark",   name:"David Park",     followers:89000, er:5.6,avg_views:16000,niche:"Finance",  stage:"Contacted",     poc:"Falida",price:700, content_type:"Tool Comparison",  post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:1,last_contact:"2026-05-25",email:"david@parkfinance.io",     notes:"No reply yet",                payment_status:"Pending"},
  { id:"c10",handle:"@rachelyu",    name:"Rachel Yu",      followers:178000,er:4.1,avg_views:31000,niche:"Career",   stage:"Published",     poc:"Jenny", price:1350,content_type:"Resume Review",    post_date:"2026-06-04",views_24h:38000,signups:154,score:85, outreach_sent:true, fu_count:0,last_contact:"2026-05-11",email:"rachel@rayu.co",           notes:"Good ER uplift",              payment_status:"Paid"},
  { id:"c11",handle:"@miketan",     name:"Mike Tan",       followers:52000, er:8.1,avg_views:9500, niche:"Jobs",     stage:"Sourced",       poc:"Doris", price:400, content_type:"Job Search Hack", post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:false,fu_count:0,last_contact:"",           email:"mike@miketan.me",          notes:"Found via NanoInfluencer",    payment_status:"Pending"},
  { id:"c12",handle:"@annafield",   name:"Anna Field",     followers:310000,er:3.0,avg_views:49000,niche:"Lifestyle",stage:"Completed",     poc:"Jialin",price:2400,content_type:"AI Tool Review",  post_date:"2026-05-28",views_24h:58000,signups:203,score:87, outreach_sent:true, fu_count:0,last_contact:"2026-05-05",email:"anna@fieldmedia.com",      notes:"Long-term candidate",         payment_status:"Paid"},
  { id:"c13",handle:"@benhuang",    name:"Ben Huang",      followers:134000,er:4.8,avg_views:22000,niche:"Tech",     stage:"Script Review", poc:"Falida",price:1050,content_type:"Tool Comparison",  post_date:"2026-06-16",views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-21",email:"ben@benhtech.com",          notes:"Script sent",                 payment_status:"Pending"},
  { id:"c14",handle:"@claraosborne",name:"Clara Osborne",  followers:76000, er:6.3,avg_views:13500,niche:"Career",   stage:"Brief Sent",    poc:"Jenny", price:580, content_type:"Career Tip",        post_date:"2026-06-19",views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-24",email:"clara@claraosborne.co",    notes:"Very enthusiastic",           payment_status:"Pending"},
  { id:"c15",handle:"@seanwu",      name:"Sean Wu",        followers:201000,er:3.7,avg_views:35000,niche:"Finance",  stage:"In Production", poc:"Doris", price:1580,content_type:"AI Tool Review",  post_date:"2026-06-13",views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-20",email:"sean@seanwumedia.io",      notes:"On schedule delivery",        payment_status:"Pending"},
  { id:"c16",handle:"@nataliereyes",name:"Natalie Reyes",  followers:445000,er:2.6,avg_views:78000,niche:"Career",   stage:"Published",     poc:"Jialin",price:3900,content_type:"Resume Review",    post_date:"2026-06-02",views_24h:89000,signups:312,score:96, outreach_sent:true, fu_count:0,last_contact:"2026-05-09",email:"natalie@reyes.media",      notes:"Top 3 all-time performer",    payment_status:"Paid"},
  { id:"c17",handle:"@oliverchen",  name:"Oliver Chen",    followers:88000, er:5.4,avg_views:15000,niche:"Jobs",     stage:"Contacted",     poc:"Falida",price:680, content_type:"Job Search Hack", post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:2,last_contact:"2026-05-26",email:"oliver@olcreates.co",      notes:"FU#2 sent",                   payment_status:"Pending"},
  { id:"c18",handle:"@hannahmay",   name:"Hannah May",     followers:122000,er:4.6,avg_views:21000,niche:"Lifestyle",stage:"Negotiating",   poc:"Jenny", price:950, content_type:"Career Tip",        post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:1,last_contact:"2026-05-25",email:"hannah@hannahmaytv.com",   notes:"Rate discussion in progress", payment_status:"Pending"},
  { id:"c19",handle:"@ryanleung",   name:"Ryan Leung",     followers:267000,er:3.5,avg_views:46000,niche:"Tech",     stage:"Completed",     poc:"Doris", price:2100,content_type:"Tool Comparison",  post_date:"2026-05-25",views_24h:54000,signups:189,score:83, outreach_sent:true, fu_count:0,last_contact:"2026-05-03",email:"ryan@ryleung.io",           notes:"Good ROI, repeat candidate",  payment_status:"Paid"},
  { id:"c20",handle:"@isabellawood",name:"Isabella Wood",  followers:55000, er:7.8,avg_views:10000,niche:"Career",   stage:"Sourced",       poc:"Jialin",price:430, content_type:"Resume Review",    post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:false,fu_count:0,last_contact:"",           email:"issy@isabellawood.co",     notes:"Via NanoInfluencer export",   payment_status:"Pending"},
  { id:"c21",handle:"@matthewlam",  name:"Matthew Lam",    followers:189000,er:4.0,avg_views:33000,niche:"Finance",  stage:"Brief Sent",    poc:"Falida",price:1450,content_type:"AI Tool Review",  post_date:"2026-06-20",views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-23",email:"matt@mlam.tv",              notes:"Brief confirmed",             payment_status:"Pending"},
  { id:"c22",handle:"@zoegrant",    name:"Zoe Grant",      followers:334000,er:3.1,avg_views:58000,niche:"Lifestyle",stage:"Published",     poc:"Jenny", price:2650,content_type:"Career Tip",        post_date:"2026-06-06",views_24h:71000,signups:267,score:91, outreach_sent:true, fu_count:0,last_contact:"2026-05-13",email:"zoe@zoegrant.media",        notes:"Strong delivery",             payment_status:"Invoiced"},
  { id:"c23",handle:"@aaronmoss",   name:"Aaron Moss",     followers:71000, er:6.1,avg_views:12500,niche:"Jobs",     stage:"Script Review", poc:"Doris", price:550, content_type:"Job Search Hack", post_date:"2026-06-17",views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-22",email:"aaron@aaronmoss.co",        notes:"v1 feedback sent",            payment_status:"Pending"},
  { id:"c24",handle:"@chloe_james", name:"Chloe James",    followers:146000,er:4.4,avg_views:25000,niche:"Career",   stage:"In Production", poc:"Jialin",price:1150,content_type:"Resume Review",    post_date:"2026-06-11",views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-19",email:"chloe@chloejames.tv",       notes:"Filming completed",           payment_status:"Pending"},
  { id:"c25",handle:"@ethanroberts",name:"Ethan Roberts",  followers:502000,er:2.4,avg_views:88000,niche:"Tech",     stage:"Published",     poc:"Falida",price:4200,content_type:"AI Tool Review",  post_date:"2026-06-07",views_24h:102000,signups:389,score:94,outreach_sent:true, fu_count:0,last_contact:"2026-05-10",email:"ethan@eroberts.io",         notes:"Top 5 all-time",              payment_status:"Invoiced"},
  { id:"c26",handle:"@misakitanaka",name:"Misaki Tanaka",  followers:93000, er:5.9,avg_views:17000,niche:"Career",   stage:"Contacted",     poc:"Jenny", price:720, content_type:"Career Tip",        post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:0,last_contact:"2026-05-27",email:"misaki@msakitv.com",        notes:"Replied positively",          payment_status:"Pending"},
  { id:"c27",handle:"@lucasevans",  name:"Lucas Evans",    followers:212000,er:3.8,avg_views:37000,niche:"Finance",  stage:"Completed",     poc:"Doris", price:1680,content_type:"Tool Comparison",  post_date:"2026-05-22",views_24h:45000,signups:162,score:79, outreach_sent:true, fu_count:0,last_contact:"2026-04-30",email:"lucas@lucasevans.co",       notes:"Repeat candidate",            payment_status:"Paid"},
  { id:"c28",handle:"@amberli",     name:"Amber Li",       followers:118000,er:4.9,avg_views:20000,niche:"Jobs",     stage:"Negotiating",   poc:"Jialin",price:920, content_type:"Job Search Hack", post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:true, fu_count:1,last_contact:"2026-05-26",email:"amber@amberli.media",       notes:"Wants 15% affiliate cut",     payment_status:"Pending"},
  { id:"c29",handle:"@jacksonwang", name:"Jackson Wang",   followers:387000,er:2.9,avg_views:65000,niche:"Lifestyle",stage:"Published",     poc:"Falida",price:3100,content_type:"Career Tip",        post_date:"2026-06-08",views_24h:78000,signups:298,score:88, outreach_sent:true, fu_count:0,last_contact:"2026-05-14",email:"jackson@jacksonwang.tv",    notes:"Solid delivery",              payment_status:"Invoiced"},
  { id:"c30",handle:"@grace_ho",    name:"Grace Ho",       followers:61000, er:7.0,avg_views:11000,niche:"Career",   stage:"Sourced",       poc:"Jenny", price:480, content_type:"Resume Review",    post_date:"",           views_24h:0,   signups:0,  score:0,  outreach_sent:false,fu_count:0,last_contact:"",           email:"grace@graceho.co",          notes:"NanoInfluencer export",       payment_status:"Pending"},
];

function avatarColor(name: string) {
  const palette = ["#6366f1","#f59e0b","#ec4899","#22c55e","#14b8a6","#f97316","#3b82f6","#a855f7","#ef4444","#06b6d4"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return palette[h];
}
function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
}
function fmtK(n: number) { return n >= 1000 ? `${(n/1000).toFixed(n >= 100000 ? 0 : 1)}K` : String(n); }
function daysSince(d: string) {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KolPage() {
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [activeTab, setActiveTab] = useState<NavTab>("Pipeline");
  const [activePOC, setActivePOC] = useState<POC | "All">("All");
  const [campaign, setCampaign] = useState("Demo June 2026");
  const [drawer, setDrawer] = useState<Creator | null>(null);

  const filtered = activePOC === "All" ? creators : creators.filter(c => c.poc === activePOC);

  function moveStage(id: string, stage: Stage) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
    if (drawer?.id === id) setDrawer(d => d ? { ...d, stage } : d);
  }
  function updateNotes(id: string, notes: string) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
    if (drawer?.id === id) setDrawer(d => d ? { ...d, notes } : d);
  }
  function cyclePayment(id: string) {
    setCreators(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next: Creator["payment_status"] = c.payment_status === "Pending" ? "Invoiced" : c.payment_status === "Invoiced" ? "Paid" : "Pending";
      return { ...c, payment_status: next };
    }));
    if (drawer?.id === id) setDrawer(d => d ? { ...d, payment_status: d.payment_status === "Pending" ? "Invoiced" : d.payment_status === "Invoiced" ? "Paid" : "Pending" } : d);
  }
  function openDrawer(c: Creator) { setDrawer(c); }
  function closeDrawer() { setDrawer(null); }

  return (
    <div className="kol-root">
      <style>{CSS}</style>

      {/* Sidebar */}
      <aside className="kol-sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" fill="#fff" opacity=".15"/>
              <path d="M5 6l4 3-4 3V6zM10 6h3M10 9h2.5M10 12h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="sb-name">KOL Pipeline</div>
            <div className="sb-tagline">Influencer OS</div>
          </div>
        </div>

        <div className="sb-section-label">WORKSPACE</div>
        <nav className="sb-nav">
          {NAV_TABS.map(tab => (
            <button
              key={tab}
              className={`sb-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="sb-icon" dangerouslySetInnerHTML={{ __html: ICONS[tab] }} />
              <span>{tab}</span>
              {tab === "Pipeline" && (
                <span className="sb-badge">{creators.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sb-divider" />

        <div className="sb-section-label">CAMPAIGN</div>
        <div className="sb-campaign-select">
          <select value={campaign} onChange={e => setCampaign(e.target.value)}>
            <option>Demo June 2026</option>
            <option>Demo May 2026</option>
            <option>Q3 2026 Planning</option>
          </select>
        </div>

        <div className="sb-section-label" style={{ marginTop: 16 }}>POC FILTER</div>
        <div className="sb-poc-list">
          <button
            className={`sb-poc-item ${activePOC === "All" ? "active" : ""}`}
            onClick={() => setActivePOC("All")}
          >
            <span className="sb-poc-avatar" style={{ background: "#475569" }}>AL</span>
            <span className="sb-poc-name">All</span>
            <span className="sb-poc-count">{creators.length}</span>
          </button>
          {(Object.keys(POC_COLORS) as POC[]).map(p => (
            <button
              key={p}
              className={`sb-poc-item ${activePOC === p ? "active" : ""}`}
              onClick={() => setActivePOC(p === activePOC ? "All" : p)}
            >
              <span className="sb-poc-avatar" style={{ background: POC_COLORS[p] }}>{p[0]}</span>
              <span className="sb-poc-name">{p}</span>
              <span className="sb-poc-count">{creators.filter(c => c.poc === p).length}</span>
            </button>
          ))}
        </div>

        <div className="sb-footer">
          <span className="sb-footer-dot" />
          <span>GitHub Pages · mock data</span>
        </div>
      </aside>

      {/* Main content */}
      <div className="kol-main">
        {/* Top header */}
        <header className="kol-header">
          <div className="kh-left">
            <span className="kh-breadcrumb">KOL Pipeline</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="kh-page">{activeTab}</span>
          </div>
          <div className="kh-right">
            <div className="kh-campaign-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="#22c55e" strokeWidth="1.5"/><circle cx="6" cy="6" r="1.5" fill="#22c55e"/></svg>
              {campaign}
            </div>
            {(Object.keys(POC_COLORS) as POC[]).map(p => (
              <span key={p} className="kh-poc-tag" style={{ background: POC_BG[p], color: POC_COLORS[p] }}>{p}</span>
            ))}
          </div>
        </header>

        {/* Tab body */}
        <div className="kol-body">
          {activeTab === "Overview"  && <OverviewTab  creators={filtered} onOpen={openDrawer} />}
          {activeTab === "Pipeline"  && <PipelineTab  creators={filtered} onMove={moveStage} onOpen={openDrawer} />}
          {activeTab === "Outreach"  && <OutreachTab  creators={filtered} onOpen={openDrawer} />}
          {activeTab === "Content"   && <ContentTab   creators={filtered} onOpen={openDrawer} />}
          {activeTab === "Payment"   && <PaymentTab   creators={filtered} onOpen={openDrawer} onCycle={cyclePayment} />}
          {activeTab === "Report"    && <ReportTab    creators={filtered} onOpen={openDrawer} />}
          {activeTab === "Partners"  && <PartnersTab  creators={filtered} onOpen={openDrawer} />}
        </div>
      </div>

      {/* Creator Drawer */}
      {drawer && (
        <>
          <div className="drawer-overlay" onClick={closeDrawer} />
          <CreatorDrawer
            creator={drawer}
            onClose={closeDrawer}
            onStageChange={(s) => moveStage(drawer.id, s)}
            onNotesChange={(n) => updateNotes(drawer.id, n)}
            onPaymentCycle={() => cyclePayment(drawer.id)}
          />
        </>
      )}
    </div>
  );
}

// ─── Creator Drawer ───────────────────────────────────────────────────────────
function CreatorDrawer({
  creator: c, onClose, onStageChange, onNotesChange, onPaymentCycle,
}: {
  creator: Creator;
  onClose: () => void;
  onStageChange: (s: Stage) => void;
  onNotesChange: (n: string) => void;
  onPaymentCycle: () => void;
}) {
  const days = daysSince(c.last_contact);
  const cpm = c.views_24h ? (c.price / c.views_24h * 1000).toFixed(2) : null;
  const cpa = c.signups ? (c.price / c.signups).toFixed(2) : null;

  return (
    <aside className="creator-drawer">
      {/* Header */}
      <div className="cd-header">
        <div className="cd-avatar" style={{ background: avatarColor(c.name) }}>
          {initials(c.name)}
        </div>
        <div className="cd-identity">
          <div className="cd-name">{c.name}</div>
          <div className="cd-handle">{c.handle}</div>
          <div className="cd-tags">
            <span className="cd-tag-niche">{c.niche}</span>
            <span className="cd-tag-type">{c.content_type}</span>
          </div>
        </div>
        <button className="cd-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Key stats */}
      <div className="cd-stats">
        <div className="cd-stat">
          <div className="cd-stat-val">{fmtK(c.followers)}</div>
          <div className="cd-stat-lbl">Followers</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-val">{c.er}%</div>
          <div className="cd-stat-lbl">Eng. Rate</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-val">{fmtK(c.avg_views)}</div>
          <div className="cd-stat-lbl">Avg Views</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-val">${c.price.toLocaleString()}</div>
          <div className="cd-stat-lbl">Deal Price</div>
        </div>
      </div>

      {/* Stage */}
      <div className="cd-section">
        <div className="cd-section-title">STAGE</div>
        <div className="cd-stage-grid">
          {STAGES.map(s => (
            <button
              key={s}
              className={`cd-stage-btn ${c.stage === s ? "active" : ""}`}
              style={c.stage === s ? { background: STAGE_COLORS[s] + "22", color: STAGE_COLORS[s], borderColor: STAGE_COLORS[s] } : {}}
              onClick={() => onStageChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* POC */}
      <div className="cd-section">
        <div className="cd-section-title">POC</div>
        <div className="cd-row">
          <span className="cd-poc-badge" style={{ background: POC_BG[c.poc], color: POC_COLORS[c.poc] }}>
            {c.poc}
          </span>
          <span className="cd-muted">assigned</span>
        </div>
      </div>

      {/* Outreach */}
      <div className="cd-section">
        <div className="cd-section-title">OUTREACH</div>
        <div className="cd-info-rows">
          <div className="cd-info-row">
            <span className="cd-info-lbl">Email</span>
            <a href={`mailto:${c.email}`} className="cd-info-link">{c.email}</a>
          </div>
          <div className="cd-info-row">
            <span className="cd-info-lbl">Last contact</span>
            <span className="cd-info-val">
              {c.last_contact || "—"}
              {days !== null && <span className={`cd-days ${days > 7 ? "warn" : ""}`}> · {days}d ago</span>}
            </span>
          </div>
          <div className="cd-info-row">
            <span className="cd-info-lbl">Follow-ups</span>
            <span className="cd-info-val">
              {c.fu_count > 0
                ? <span className="cd-fu-badge">FU#{c.fu_count}</span>
                : <span className="cd-muted">None yet</span>}
            </span>
          </div>
          <div className="cd-info-row">
            <span className="cd-info-lbl">Outreach sent</span>
            <span className={`cd-bool ${c.outreach_sent ? "yes" : "no"}`}>
              {c.outreach_sent ? "✓ Sent" : "✗ Not yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Performance (if published) */}
      {(c.stage === "Published" || c.stage === "Completed") && c.views_24h > 0 && (
        <div className="cd-section">
          <div className="cd-section-title">PERFORMANCE</div>
          <div className="cd-perf-grid">
            <div className="cd-perf-item">
              <div className="cd-perf-val">{c.views_24h.toLocaleString()}</div>
              <div className="cd-perf-lbl">Views</div>
            </div>
            <div className="cd-perf-item">
              <div className="cd-perf-val">{c.signups}</div>
              <div className="cd-perf-lbl">Signups</div>
            </div>
            {cpm && <div className="cd-perf-item">
              <div className="cd-perf-val">${cpm}</div>
              <div className="cd-perf-lbl">CPM</div>
            </div>}
            {cpa && <div className="cd-perf-item">
              <div className="cd-perf-val">${cpa}</div>
              <div className="cd-perf-lbl">CPA</div>
            </div>}
            {c.score > 0 && <div className="cd-perf-item">
              <div className="cd-perf-val" style={{ color: "#3b82f6" }}>{c.score}</div>
              <div className="cd-perf-lbl">Score</div>
            </div>}
          </div>
        </div>
      )}

      {/* Payment */}
      <div className="cd-section">
        <div className="cd-section-title">PAYMENT</div>
        <div className="cd-row">
          <span className={`pay-pill ${c.payment_status.toLowerCase()}`}>{c.payment_status}</span>
          <button className="cd-cycle-btn" onClick={onPaymentCycle}>Change →</button>
        </div>
      </div>

      {/* Notes */}
      <div className="cd-section cd-section-notes">
        <div className="cd-section-title">NOTES</div>
        <textarea
          className="cd-notes"
          value={c.notes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="Add notes..."
          rows={3}
        />
      </div>
    </aside>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ creators, onOpen }: { creators: Creator[]; onOpen: (c: Creator) => void }) {
  const published  = creators.filter(c => c.stage === "Published" || c.stage === "Completed");
  const active     = creators.filter(c => !["Sourced","Completed"].includes(c.stage));
  const totalSpend = creators.reduce((s, c) => s + c.price, 0);
  const totalViews = published.reduce((s, c) => s + c.views_24h, 0);
  const totalSigns = published.reduce((s, c) => s + c.signups, 0);
  const avgCPM     = published.length ? published.reduce((s,c) => s + (c.price/(c.views_24h||1)*1000), 0)/published.length : 0;
  const avgCPA     = totalSigns ? totalSpend / totalSigns : 0;
  const maxF       = Math.max(...creators.map(c=>c.followers));

  return (
    <div className="tab-overview">
      {/* KPI row */}
      <div className="kpi-row">
        {[
          { label:"Total Creators", value: creators.length, fmt: (v: number)=>String(v), sub: "this campaign", accent: "#3b82f6" },
          { label:"Active",         value: active.length,   fmt: (v: number)=>String(v), sub: "in progress",   accent: "#f59e0b" },
          { label:"Published",      value: published.length,fmt: (v: number)=>String(v), sub: "videos live",   accent: "#22c55e" },
          { label:"Total Budget",   value: totalSpend,      fmt: (v: number)=>`$${v.toLocaleString()}`, sub: "committed", accent: "#6366f1" },
          { label:"Total Views",    value: totalViews,      fmt: (v: number)=>fmtK(v),   sub: "published",     accent: "#06b6d4" },
          { label:"Signups",        value: totalSigns,      fmt: (v: number)=>String(v), sub: "attributed",    accent: "#ec4899" },
          { label:"Avg CPM",        value: avgCPM,          fmt: (v: number)=>`$${v.toFixed(2)}`, sub: "vs $20 TK", accent: "#f97316" },
          { label:"Avg CPA",        value: avgCPA,          fmt: (v: number)=>`$${v.toFixed(2)}`, sub: "per signup", accent: "#22c55e" },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-accent" style={{ background: k.accent }} />
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.accent }}>{k.fmt(k.value)}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="overview-cols">
        {/* Funnel */}
        <div className="ov-card">
          <div className="ov-card-title">Pipeline Funnel</div>
          <div className="funnel-list">
            {STAGES.map(s => {
              const cnt = creators.filter(c => c.stage === s).length;
              const pct = creators.length ? cnt / creators.length : 0;
              return (
                <div key={s} className="funnel-row">
                  <div className="funnel-stage" style={{ color: STAGE_COLORS[s] }}>{s}</div>
                  <div className="funnel-bar-track">
                    <div className="funnel-bar-fill" style={{ width: `${pct*100}%`, background: STAGE_COLORS[s] + "cc" }} />
                  </div>
                  <div className="funnel-cnt">{cnt}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* POC progress */}
        <div className="ov-card">
          <div className="ov-card-title">Team Execution</div>
          {(["Jenny","Doris","Jialin","Falida"] as POC[]).map(poc => {
            const cs = creators.filter(c => c.poc === poc);
            const done = cs.filter(c => ["Published","Completed"].includes(c.stage)).length;
            return (
              <div key={poc} className="team-row">
                <span className="team-avatar" style={{ background: POC_COLORS[poc] }}>{poc[0]}</span>
                <span className="team-name">{poc}</span>
                <div className="team-bar-track">
                  <div className="team-bar-fill" style={{ width: `${cs.length ? done/cs.length*100 : 0}%`, background: POC_COLORS[poc] }} />
                </div>
                <span className="team-ratio">{done}/{cs.length}</span>
              </div>
            );
          })}
        </div>

        {/* Top creators */}
        <div className="ov-card">
          <div className="ov-card-title">Top by Followers</div>
          <div className="top-list">
            {[...creators].sort((a,b)=>b.followers-a.followers).slice(0,8).map(c => (
              <button key={c.id} className="top-item" onClick={() => onOpen(c)}>
                <div className="top-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
                <div className="top-info">
                  <div className="top-name">{c.name}</div>
                  <div className="top-meta">{fmtK(c.followers)} · {c.er}%</div>
                </div>
                <div className="top-bar-wrap">
                  <div className="top-bar" style={{ width: `${c.followers/maxF*100}%` }} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline / Kanban ────────────────────────────────────────────────────────
function PipelineTab({ creators, onMove, onOpen }: { creators: Creator[]; onMove: (id:string, s:Stage)=>void; onOpen: (c:Creator)=>void }) {
  const dragId = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<Stage | null>(null);

  return (
    <div className="tab-pipeline">
      {/* POC task bar */}
      <div className="poc-taskbar">
        {(["Jenny","Doris","Jialin","Falida"] as POC[]).map(poc => {
          const cs = creators.filter(c => c.poc === poc);
          const inProg = cs.filter(c => !["Sourced","Published","Completed"].includes(c.stage)).length;
          const pub = cs.filter(c => ["Published","Completed"].includes(c.stage)).length;
          return (
            <div key={poc} className="poc-task-card">
              <span className="poc-task-avatar" style={{ background: POC_COLORS[poc] }}>{poc[0]}</span>
              <div className="poc-task-info">
                <div className="poc-task-name">{poc}</div>
                <div className="poc-task-meta">{inProg} active · {pub} published</div>
              </div>
              <div className="poc-task-progress">
                <div style={{ width: `${cs.length ? pub/cs.length*100 : 0}%`, height: "100%", background: POC_COLORS[poc], borderRadius: 3 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="kanban-board">
        {STAGES.map(stage => {
          const cards = creators.filter(c => c.stage === stage);
          const stageColor = STAGE_COLORS[stage];
          return (
            <div
              key={stage}
              className={`kanban-col ${dragOver === stage ? "drag-over" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => { if (dragId.current) { onMove(dragId.current, stage); } dragId.current = null; setDragOver(null); }}
            >
              <div className="kc-col-head">
                <div className="kc-col-dot" style={{ background: stageColor }} />
                <span className="kc-col-name">{stage}</span>
                <span className="kc-col-count" style={{ background: stageColor + "22", color: stageColor }}>{cards.length}</span>
              </div>
              <div className="kc-cards">
                {cards.map(c => (
                  <div
                    key={c.id}
                    className="kc-card"
                    draggable
                    onDragStart={() => { dragId.current = c.id; }}
                    onClick={() => onOpen(c)}
                  >
                    <div className="kc-card-top">
                      <div className="kc-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
                      <div className="kc-card-info">
                        <div className="kc-card-name">{c.name}</div>
                        <div className="kc-card-handle">{c.handle}</div>
                      </div>
                      <div className="kc-poc-dot" style={{ background: POC_COLORS[c.poc] }} title={c.poc} />
                    </div>
                    <div className="kc-card-meta">
                      <span>{fmtK(c.followers)}</span>
                      <span className="kc-er">{c.er}% ER</span>
                      <span className="kc-price">${c.price.toLocaleString()}</span>
                    </div>
                    {c.fu_count > 0 && (
                      <div className="kc-fu">FU#{c.fu_count}</div>
                    )}
                    {c.post_date && (
                      <div className="kc-date">{c.post_date}</div>
                    )}
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="kc-empty">Drop here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Outreach Tab ─────────────────────────────────────────────────────────────
function OutreachTab({ creators, onOpen }: { creators: Creator[]; onOpen: (c:Creator)=>void }) {
  const queue  = creators.filter(c => !c.outreach_sent);
  const fu     = creators.filter(c => c.outreach_sent && c.stage === "Contacted" && c.fu_count < 2);
  const all    = [...creators].sort((a,b) => (b.last_contact > a.last_contact ? 1 : -1));

  return (
    <div className="tab-outreach">
      <div className="ot-notice">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#3b82f6" strokeWidth="1.5"/><path d="M7 4.5v3M7 9.5v.5" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Outreach sent as <strong>jenny@jobright.ai</strong> · Click any row to view creator detail
      </div>

      <SectionBlock title={`Unsent (${queue.length})`}>
        <CreatorTable
          creators={queue}
          cols={["handle","poc","followers","er","price","email"]}
          onOpen={onOpen}
        />
      </SectionBlock>

      <SectionBlock title={`Follow-up Queue (${fu.length})`}>
        <CreatorTable
          creators={fu}
          cols={["handle","poc","stage","fu_count","last_contact","days_since"]}
          onOpen={onOpen}
        />
      </SectionBlock>

      <SectionBlock title={`All Outreach (${all.filter(c=>c.outreach_sent).length})`}>
        <CreatorTable
          creators={all.filter(c=>c.outreach_sent)}
          cols={["handle","poc","stage","fu_count","last_contact","notes"]}
          onOpen={onOpen}
        />
      </SectionBlock>
    </div>
  );
}

// ─── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab({ creators, onOpen }: { creators: Creator[]; onOpen: (c:Creator)=>void }) {
  const pub = [...creators.filter(c=>c.post_date)].sort((a,b)=>a.post_date.localeCompare(b.post_date));
  const byDate: Record<string, Creator[]> = {};
  pub.forEach(c => { if (!byDate[c.post_date]) byDate[c.post_date] = []; byDate[c.post_date].push(c); });

  return (
    <div className="tab-content">
      <div className="cal-strip">
        {Object.entries(byDate).map(([date, cs]) => (
          <div key={date} className="cal-day">
            <div className="cal-day-label">{date.slice(5)}</div>
            {cs.map(c => (
              <button key={c.id} className="cal-event" style={{ borderLeftColor: POC_COLORS[c.poc] }} onClick={() => onOpen(c)}>
                <div className="cal-event-name">{c.name}</div>
                <div className="cal-event-type">{c.content_type}</div>
              </button>
            ))}
          </div>
        ))}
      </div>

      <CreatorTable
        creators={pub}
        cols={["handle","poc","content_type","post_date","views_24h","signups","price","cpm","cpa"]}
        onOpen={onOpen}
      />
    </div>
  );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────
function PaymentTab({ creators, onOpen, onCycle }: { creators: Creator[]; onOpen: (c:Creator)=>void; onCycle: (id:string)=>void }) {
  const paid    = creators.filter(c=>c.payment_status==="Paid").reduce((s,c)=>s+c.price,0);
  const inv     = creators.filter(c=>c.payment_status==="Invoiced").reduce((s,c)=>s+c.price,0);
  const pend    = creators.filter(c=>c.payment_status==="Pending").reduce((s,c)=>s+c.price,0);

  return (
    <div className="tab-payment">
      <div className="pay-summary">
        <div className="pay-sum-card paid">
          <div className="psc-label">Paid</div>
          <div className="psc-value">${paid.toLocaleString()}</div>
          <div className="psc-count">{creators.filter(c=>c.payment_status==="Paid").length} creators</div>
        </div>
        <div className="pay-sum-card invoiced">
          <div className="psc-label">Invoiced</div>
          <div className="psc-value">${inv.toLocaleString()}</div>
          <div className="psc-count">{creators.filter(c=>c.payment_status==="Invoiced").length} creators</div>
        </div>
        <div className="pay-sum-card pending">
          <div className="psc-label">Pending</div>
          <div className="psc-value">${pend.toLocaleString()}</div>
          <div className="psc-count">{creators.filter(c=>c.payment_status==="Pending").length} creators</div>
        </div>
      </div>

      <table className="data-table">
        <thead><tr>
          <th>Creator</th><th>POC</th><th>Price</th><th>Stage</th><th>Status</th><th>Action</th>
        </tr></thead>
        <tbody>
          {creators.map(c => (
            <tr key={c.id} className="clickable-row" onClick={() => onOpen(c)}>
              <td>
                <div className="td-creator">
                  <div className="td-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
                  <div>
                    <div className="td-name">{c.name}</div>
                    <div className="td-handle">{c.handle}</div>
                  </div>
                </div>
              </td>
              <td><span className="poc-pill" style={{ background: POC_BG[c.poc], color: POC_COLORS[c.poc] }}>{c.poc}</span></td>
              <td className="td-mono">${c.price.toLocaleString()}</td>
              <td><span className="stage-chip" style={{ background: STAGE_COLORS[c.stage]+"22", color: STAGE_COLORS[c.stage] }}>{c.stage}</span></td>
              <td><span className={`pay-pill ${c.payment_status.toLowerCase()}`}>{c.payment_status}</span></td>
              <td>
                <button className="cycle-btn" onClick={e => { e.stopPropagation(); onCycle(c.id); }}>→</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────────────
function ReportTab({ creators, onOpen }: { creators: Creator[]; onOpen: (c:Creator)=>void }) {
  const scored   = [...creators.filter(c=>c.score>0)].sort((a,b)=>b.score-a.score);
  const totalSpend = creators.reduce((s,c)=>s+c.price,0);
  const totalSigns = scored.reduce((s,c)=>s+c.signups,0);
  const avgCPA = totalSigns ? (totalSpend/totalSigns).toFixed(2) : "—";

  return (
    <div className="tab-report">
      <div className="report-insights">
        <div className="ri-header">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5H14L10.5 8l1.3 4L8 9.5 4.2 12l1.3-4L2 5.5h4.5L8 1z" fill="#f59e0b"/></svg>
          Campaign Insights
        </div>
        <div className="ri-list">
          {[
            `Resume Review content delivered <strong>+61% ER uplift</strong> vs. baseline — highest of all content types.`,
            `Mid-tier creators (100k–500k) achieved best CPM, outperforming micro and macro tiers.`,
            `Avg CPA this campaign: <strong>$${avgCPA}</strong> vs. industry baseline $354.`,
            `New Grad / Intern audience generated <strong>+74.8% ER uplift</strong> — recommend targeting Q3.`,
            `Top 3 performers account for <strong>40% of signups</strong> on 28% of spend.`,
          ].map((t, i) => (
            <div key={i} className="ri-item" dangerouslySetInnerHTML={{ __html: `<span class="ri-num">${i+1}</span>${t}` }} />
          ))}
        </div>
      </div>

      <div className="section-label">Top Performers</div>
      <div className="performers-row">
        {scored.slice(0,5).map((c,i) => (
          <button key={c.id} className="performer-card" onClick={() => onOpen(c)}>
            <div className="pc-rank">#{i+1}</div>
            <div className="pc-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
            <div className="pc-name">{c.name}</div>
            <div className="pc-handle">{c.handle}</div>
            <div className="pc-score" style={{ color: "#3b82f6" }}>{c.score}</div>
            <div className="pc-stats">
              <span>{c.views_24h.toLocaleString()} views</span>
              <span>{c.signups} signups</span>
            </div>
          </button>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 24 }}>All Videos Ranked</div>
      <table className="data-table">
        <thead><tr><th>#</th><th>Creator</th><th>Content</th><th>Score</th><th>Views</th><th>Signups</th><th>CPM</th><th>CPA</th></tr></thead>
        <tbody>
          {scored.map((c,i) => (
            <tr key={c.id} className="clickable-row" onClick={() => onOpen(c)}>
              <td className="td-mono td-muted">#{i+1}</td>
              <td><div className="td-creator">
                <div className="td-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
                <div><div className="td-name">{c.name}</div><div className="td-handle">{c.handle}</div></div>
              </div></td>
              <td>{c.content_type}</td>
              <td><strong>{c.score}</strong></td>
              <td className="td-mono">{c.views_24h.toLocaleString()}</td>
              <td className="td-mono">{c.signups}</td>
              <td className="td-mono">${(c.price/c.views_24h*1000).toFixed(2)}</td>
              <td className="td-mono">${(c.price/c.signups).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Partners Tab ─────────────────────────────────────────────────────────────
function PartnersTab({ creators, onOpen }: { creators: Creator[]; onOpen: (c:Creator)=>void }) {
  const partners = creators.filter(c => c.score >= 80 || c.payment_status === "Paid");

  return (
    <div className="tab-partners">
      <div className="partners-grid">
        {partners.map(c => (
          <button key={c.id} className="partner-card" onClick={() => onOpen(c)}>
            <div className="ptc-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
            <div className="ptc-name">{c.name}</div>
            <div className="ptc-handle">{c.handle}</div>
            <div className="ptc-stats">
              <div>{fmtK(c.followers)} followers</div>
              <div>{c.er}% ER</div>
              {c.score > 0 && <div style={{ color: "#3b82f6" }}>Score {c.score}</div>}
            </div>
            <div className="ptc-footer">
              <span className="poc-pill" style={{ background: POC_BG[c.poc], color: POC_COLORS[c.poc] }}>{c.poc}</span>
              <span className={`pay-pill ${c.payment_status.toLowerCase()}`}>{c.payment_status}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shared: SectionBlock ─────────────────────────────────────────────────────
function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="section-block">
      <div className="sb-title">{title}</div>
      {children}
    </div>
  );
}

// ─── Shared: CreatorTable ─────────────────────────────────────────────────────
type ColKey = "handle"|"poc"|"followers"|"er"|"price"|"email"|"stage"|"fu_count"|"last_contact"|"days_since"|"notes"|"content_type"|"post_date"|"views_24h"|"signups"|"cpm"|"cpa";

function CreatorTable({ creators, cols, onOpen }: { creators: Creator[]; cols: ColKey[]; onOpen: (c:Creator)=>void }) {
  const HEADS: Record<ColKey, string> = {
    handle:"Handle", poc:"POC", followers:"Followers", er:"ER", price:"Price", email:"Email",
    stage:"Stage", fu_count:"FU#", last_contact:"Last Contact", days_since:"Days",
    notes:"Notes", content_type:"Content Type", post_date:"Post Date",
    views_24h:"Views", signups:"Signups", cpm:"CPM", cpa:"CPA",
  };

  return (
    <table className="data-table">
      <thead><tr>
        {cols.map(c => <th key={c}>{HEADS[c]}</th>)}
      </tr></thead>
      <tbody>
        {creators.length === 0
          ? <tr><td colSpan={cols.length} className="empty-row">No creators in this view</td></tr>
          : creators.map(cr => (
            <tr key={cr.id} className="clickable-row" onClick={() => onOpen(cr)}>
              {cols.map(col => <td key={col}><Cell c={cr} col={col} /></td>)}
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

function Cell({ c, col }: { c: Creator; col: ColKey }) {
  const days = daysSince(c.last_contact);
  switch (col) {
    case "handle":
      return (
        <div className="td-creator">
          <div className="td-avatar" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
          <div><div className="td-name">{c.name}</div><div className="td-handle">{c.handle}</div></div>
        </div>
      );
    case "poc":
      return <span className="poc-pill" style={{ background: POC_BG[c.poc], color: POC_COLORS[c.poc] }}>{c.poc}</span>;
    case "followers":
      return <span className="td-mono">{fmtK(c.followers)}</span>;
    case "er":
      return <span className="td-mono">{c.er}%</span>;
    case "price":
      return <span className="td-mono">${c.price.toLocaleString()}</span>;
    case "email":
      return <a href={`mailto:${c.email}`} className="td-link" onClick={e => e.stopPropagation()}>{c.email}</a>;
    case "stage":
      return <span className="stage-chip" style={{ background: STAGE_COLORS[c.stage]+"22", color: STAGE_COLORS[c.stage] }}>{c.stage}</span>;
    case "fu_count":
      return c.fu_count > 0 ? <span className="fu-chip">FU#{c.fu_count}</span> : <span className="td-muted">—</span>;
    case "last_contact":
      return <span>{c.last_contact || <span className="td-muted">—</span>}</span>;
    case "days_since":
      return days !== null ? <span className={days > 7 ? "warn-text" : ""}>{days}d</span> : <span className="td-muted">—</span>;
    case "notes":
      return <span className="td-notes">{c.notes || "—"}</span>;
    case "content_type":
      return <span>{c.content_type}</span>;
    case "post_date":
      return <span>{c.post_date || <span className="td-muted">TBD</span>}</span>;
    case "views_24h":
      return <span className="td-mono">{c.views_24h ? c.views_24h.toLocaleString() : <span className="td-muted">—</span>}</span>;
    case "signups":
      return <span className="td-mono">{c.signups || <span className="td-muted">—</span>}</span>;
    case "cpm":
      return <span className="td-mono">{c.views_24h ? `$${(c.price/c.views_24h*1000).toFixed(2)}` : <span className="td-muted">—</span>}</span>;
    case "cpa":
      return <span className="td-mono">{c.signups ? `$${(c.price/c.signups).toFixed(2)}` : <span className="td-muted">—</span>}</span>;
    default:
      return <span>—</span>;
  }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .kol-root {
    display: flex;
    min-height: 100vh;
    background: #f1f5f9;
    font-family: -apple-system, "Inter", ui-sans-serif, system-ui, sans-serif;
    font-size: 13px;
    color: #0f172a;
    position: relative;
  }

  /* ── Sidebar ──────────────────────────────────────────────────── */
  .kol-sidebar {
    width: 220px;
    min-height: 100vh;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
    z-index: 20;
  }
  .sb-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 18px 16px 14px;
    border-bottom: 1px solid #1e293b;
  }
  .sb-logo {
    width: 34px; height: 34px;
    background: #3b82f6;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sb-name { font-weight: 700; font-size: 14px; color: #f1f5f9; letter-spacing: -.2px; }
  .sb-tagline { font-size: 10px; color: #475569; margin-top: 1px; }

  .sb-section-label {
    font-size: 10px;
    letter-spacing: .08em;
    color: #334155;
    font-weight: 600;
    padding: 14px 16px 6px;
  }
  .sb-nav { display: flex; flex-direction: column; gap: 1px; padding: 0 8px; }
  .sb-item {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 8px 10px;
    border: none; background: none; cursor: pointer;
    border-radius: 7px; color: #64748b;
    font-size: 13px; font-family: inherit;
    transition: background .12s, color .12s;
    text-align: left;
    position: relative;
  }
  .sb-item:hover { background: #1e293b; color: #cbd5e1; }
  .sb-item.active { background: #1e3a5f; color: #93c5fd; }
  .sb-item.active .sb-icon { color: #3b82f6; }
  .sb-icon { display: flex; align-items: center; flex-shrink: 0; }
  .sb-badge {
    margin-left: auto;
    background: #1e293b;
    color: #64748b;
    font-size: 10px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 10px;
  }
  .sb-item.active .sb-badge { background: #1e3a5f; color: #93c5fd; }

  .sb-divider { height: 1px; background: #1e293b; margin: 8px 16px; }

  .sb-campaign-select {
    padding: 0 10px;
  }
  .sb-campaign-select select {
    width: 100%; padding: 7px 10px;
    background: #1e293b; border: 1px solid #334155;
    border-radius: 7px; color: #94a3b8; font-size: 12px;
    font-family: inherit; cursor: pointer; outline: none;
  }
  .sb-campaign-select select:focus { border-color: #3b82f6; }

  .sb-poc-list { display: flex; flex-direction: column; gap: 1px; padding: 0 8px; }
  .sb-poc-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px; border-radius: 7px;
    border: none; background: none; cursor: pointer;
    color: #64748b; font-size: 12px; font-family: inherit;
    transition: background .12s;
    text-align: left;
  }
  .sb-poc-item:hover { background: #1e293b; color: #cbd5e1; }
  .sb-poc-item.active { background: #1e293b; color: #cbd5e1; }
  .sb-poc-avatar {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .sb-poc-name { flex: 1; }
  .sb-poc-count { font-size: 11px; color: #334155; }

  .sb-footer {
    margin-top: auto;
    padding: 12px 16px;
    border-top: 1px solid #1e293b;
    font-size: 10px; color: #334155;
    display: flex; align-items: center; gap: 6px;
  }
  .sb-footer-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e; flex-shrink: 0;
  }

  /* ── Main ─────────────────────────────────────────────────────── */
  .kol-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .kol-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 11px 24px;
    background: #fff; border-bottom: 1px solid #e2e8f0;
    position: sticky; top: 0; z-index: 10;
  }
  .kh-left { display: flex; align-items: center; gap: 8px; }
  .kh-breadcrumb { font-size: 13px; color: #64748b; }
  .kh-page { font-size: 13px; font-weight: 600; color: #0f172a; }
  .kh-right { display: flex; align-items: center; gap: 8px; }
  .kh-campaign-badge {
    display: flex; align-items: center; gap: 6px;
    background: #f0fdf4; border: 1px solid #bbf7d0;
    padding: 4px 10px; border-radius: 20px;
    font-size: 12px; color: #15803d; font-weight: 500;
  }
  .kh-poc-tag {
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
  }
  .kol-body { padding: 20px 24px; flex: 1; overflow: auto; }

  /* ── KPI Cards ────────────────────────────────────────────────── */
  .kpi-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
  .kpi-card {
    flex: 1; min-width: 120px;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 14px 16px; position: relative; overflow: hidden;
  }
  .kpi-accent {
    position: absolute; top: 0; left: 0; right: 0;
    height: 3px;
  }
  .kpi-label { font-size: 11px; color: #64748b; margin-bottom: 6px; font-weight: 500; }
  .kpi-value { font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .kpi-sub { font-size: 11px; color: #94a3b8; }

  /* ── Overview ─────────────────────────────────────────────────── */
  .tab-overview {}
  .overview-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .ov-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 16px 18px;
  }
  .ov-card-title { font-weight: 600; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 14px; }

  .funnel-list { display: flex; flex-direction: column; gap: 9px; }
  .funnel-row { display: flex; align-items: center; gap: 10px; }
  .funnel-stage { width: 110px; font-size: 11px; font-weight: 600; flex-shrink: 0; }
  .funnel-bar-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
  .funnel-bar-fill { height: 100%; border-radius: 3px; transition: width .3s; }
  .funnel-cnt { width: 20px; text-align: right; font-size: 12px; font-weight: 700; color: #334155; }

  .team-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .team-avatar { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .team-name { width: 52px; font-weight: 600; font-size: 12px; }
  .team-bar-track { flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
  .team-bar-fill { height: 100%; border-radius: 3px; transition: width .4s; }
  .team-ratio { width: 32px; text-align: right; font-size: 11px; color: #64748b; }

  .top-list { display: flex; flex-direction: column; gap: 2px; }
  .top-item {
    display: flex; align-items: center; gap: 10px;
    padding: 6px 8px; border-radius: 8px;
    border: none; background: none; cursor: pointer; width: 100%;
    transition: background .12s;
  }
  .top-item:hover { background: #f8fafc; }
  .top-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .top-info { text-align: left; flex: 1; }
  .top-name { font-size: 12px; font-weight: 600; color: #1e293b; }
  .top-meta { font-size: 11px; color: #94a3b8; }
  .top-bar-wrap { width: 60px; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden; }
  .top-bar { height: 100%; background: #3b82f6; border-radius: 2px; }

  /* ── Pipeline / Kanban ────────────────────────────────────────── */
  .tab-pipeline {}
  .poc-taskbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .poc-task-card {
    display: flex; align-items: center; gap: 10px;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 10px 14px; flex: 1; min-width: 160px;
  }
  .poc-task-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .poc-task-info { flex: 1; }
  .poc-task-name { font-weight: 600; font-size: 13px; }
  .poc-task-meta { font-size: 11px; color: #64748b; margin-top: 1px; }
  .poc-task-progress { width: 50px; height: 5px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }

  .kanban-board {
    display: flex; gap: 10px;
    overflow-x: auto; padding-bottom: 20px;
    min-height: 65vh;
    align-items: flex-start;
  }
  .kanban-col {
    width: 192px; flex-shrink: 0;
    background: #f8fafc; border-radius: 10px;
    border: 2px solid transparent;
    transition: border-color .15s;
  }
  .kanban-col.drag-over { border-color: #3b82f6; background: #eff6ff; }
  .kc-col-head {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 12px 9px;
  }
  .kc-col-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .kc-col-name { flex: 1; font-size: 11px; font-weight: 700; color: #334155; }
  .kc-col-count {
    padding: 1px 7px; border-radius: 10px;
    font-size: 10px; font-weight: 700;
  }
  .kc-cards { display: flex; flex-direction: column; gap: 7px; padding: 4px 8px 10px; }
  .kc-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 9px;
    padding: 10px 11px; cursor: pointer;
    transition: box-shadow .15s, transform .1s;
  }
  .kc-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,.09); transform: translateY(-1px); }
  .kc-card:active { cursor: grabbing; }
  .kc-card-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 7px; }
  .kc-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .kc-card-info { flex: 1; min-width: 0; }
  .kc-card-name { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kc-card-handle { font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .kc-poc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .kc-card-meta { display: flex; gap: 6px; align-items: center; font-size: 10px; color: #64748b; flex-wrap: wrap; }
  .kc-er { color: #22c55e; font-weight: 600; }
  .kc-price { margin-left: auto; font-weight: 700; color: #0f172a; font-size: 11px; }
  .kc-fu { margin-top: 5px; display: inline-block; background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 600; padding: 1px 7px; border-radius: 8px; }
  .kc-date { margin-top: 4px; font-size: 10px; color: #94a3b8; }
  .kc-empty { text-align: center; color: #cbd5e1; font-size: 11px; padding: 20px 8px; border: 1.5px dashed #e2e8f0; border-radius: 8px; }

  /* ── Outreach ─────────────────────────────────────────────────── */
  .tab-outreach { display: flex; flex-direction: column; gap: 20px; }
  .ot-notice {
    display: flex; align-items: center; gap: 8px;
    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 9px;
    padding: 10px 14px; font-size: 12px; color: #1e40af;
  }

  /* ── Content ──────────────────────────────────────────────────── */
  .tab-content { display: flex; flex-direction: column; gap: 20px; }
  .cal-strip { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; }
  .cal-day { flex-shrink: 0; min-width: 150px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
  .cal-day-label { font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
  .cal-event {
    display: block; width: 100%;
    background: #f8fafc; border: none; border-left: 3px solid; border-radius: 0 6px 6px 0;
    padding: 6px 8px; cursor: pointer; text-align: left; margin-bottom: 5px;
    transition: background .12s;
  }
  .cal-event:hover { background: #f1f5f9; }
  .cal-event-name { font-size: 11px; font-weight: 600; color: #1e293b; }
  .cal-event-type { font-size: 10px; color: #94a3b8; margin-top: 1px; }

  /* ── Payment ──────────────────────────────────────────────────── */
  .tab-payment { display: flex; flex-direction: column; gap: 20px; }
  .pay-summary { display: flex; gap: 12px; }
  .pay-sum-card { flex: 1; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; }
  .psc-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .psc-value { font-size: 24px; font-weight: 800; margin-bottom: 2px; }
  .psc-count { font-size: 11px; color: #94a3b8; }
  .pay-sum-card.paid .psc-value { color: #16a34a; }
  .pay-sum-card.invoiced .psc-value { color: #d97706; }
  .pay-sum-card.pending .psc-value { color: #94a3b8; }

  /* ── Report ───────────────────────────────────────────────────── */
  .tab-report { display: flex; flex-direction: column; gap: 20px; }
  .report-insights { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px 20px; }
  .ri-header { display: flex; align-items: center; gap: 7px; font-weight: 700; font-size: 13px; color: #92400e; margin-bottom: 12px; }
  .ri-list { display: flex; flex-direction: column; gap: 8px; }
  .ri-item { font-size: 13px; color: #78350f; line-height: 1.55; display: flex; gap: 10px; align-items: flex-start; }
  .ri-num { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; background: #f59e0b; color: #fff; border-radius: 50%; font-size: 10px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  .performers-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .performer-card {
    flex: 1; min-width: 140px;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 16px; cursor: pointer; text-align: center; border: none;
    transition: box-shadow .15s, transform .1s;
    border: 1px solid #e2e8f0;
  }
  .performer-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1); transform: translateY(-2px); }
  .pc-rank { font-size: 18px; font-weight: 800; color: #e2e8f0; margin-bottom: 8px; }
  .pc-avatar { width: 40px; height: 40px; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 700; }
  .pc-name { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
  .pc-handle { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
  .pc-score { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .pc-stats { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: #64748b; }

  .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #64748b; margin-bottom: 10px; }

  /* ── Partners ─────────────────────────────────────────────────── */
  .tab-partners {}
  .partners-grid { display: flex; flex-wrap: wrap; gap: 12px; }
  .partner-card {
    width: 200px; background: #fff; border: 1px solid #e2e8f0;
    border-radius: 12px; padding: 16px; cursor: pointer;
    text-align: center; transition: box-shadow .15s, transform .1s;
    border: none; border: 1px solid #e2e8f0;
  }
  .partner-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1); transform: translateY(-2px); }
  .ptc-avatar { width: 44px; height: 44px; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; font-weight: 700; }
  .ptc-name { font-weight: 700; font-size: 14px; margin-bottom: 2px; }
  .ptc-handle { font-size: 11px; color: #94a3b8; margin-bottom: 8px; }
  .ptc-stats { display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #64748b; margin-bottom: 10px; }
  .ptc-footer { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }

  /* ── Shared Table ─────────────────────────────────────────────── */
  .data-table {
    width: 100%; border-collapse: collapse;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
    overflow: hidden; font-size: 12px;
  }
  .data-table th {
    background: #f8fafc; padding: 9px 14px;
    text-align: left; font-weight: 600; font-size: 11px; color: #64748b;
    border-bottom: 1px solid #e2e8f0; white-space: nowrap;
    text-transform: uppercase; letter-spacing: .05em;
  }
  .data-table td {
    padding: 9px 14px; border-bottom: 1px solid #f1f5f9;
    color: #334155; vertical-align: middle;
  }
  .data-table tr:last-child td { border-bottom: none; }
  .clickable-row { cursor: pointer; }
  .clickable-row:hover td { background: #f8fafc; }
  .empty-row { text-align: center; color: #94a3b8; padding: 24px !important; }

  .td-creator { display: flex; align-items: center; gap: 9px; }
  .td-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .td-name { font-weight: 600; font-size: 12px; color: #0f172a; }
  .td-handle { font-size: 11px; color: #94a3b8; }
  .td-mono { font-variant-numeric: tabular-nums; }
  .td-muted { color: #94a3b8; }
  .td-link { color: #3b82f6; text-decoration: none; }
  .td-link:hover { text-decoration: underline; }
  .td-notes { color: #64748b; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

  .section-block { display: flex; flex-direction: column; gap: 8px; }
  .sb-title { font-weight: 700; font-size: 13px; color: #1e293b; }

  /* ── Pills & badges ───────────────────────────────────────────── */
  .poc-pill { padding: 2px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .stage-chip { padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .fu-chip { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .pay-pill { padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .pay-pill.paid { background: #dcfce7; color: #15803d; }
  .pay-pill.invoiced { background: #fef3c7; color: #92400e; }
  .pay-pill.pending { background: #f1f5f9; color: #64748b; }
  .warn-text { color: #dc2626; font-weight: 600; }

  .cycle-btn {
    padding: 4px 12px; background: #3b82f6; color: #fff;
    border: none; border-radius: 7px; cursor: pointer; font-size: 12px;
    font-family: inherit;
    transition: background .12s;
  }
  .cycle-btn:hover { background: #2563eb; }

  /* ── Creator Drawer ───────────────────────────────────────────── */
  .drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.4);
    z-index: 40;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  .creator-drawer {
    position: fixed; top: 0; right: 0;
    width: 380px; height: 100vh;
    background: #fff;
    box-shadow: -8px 0 40px rgba(0,0,0,.15);
    z-index: 50;
    overflow-y: auto;
    display: flex; flex-direction: column;
    animation: drawerIn .2s ease-out;
  }
  @keyframes drawerIn {
    from { transform: translateX(30px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }

  .cd-header {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 20px 18px 16px;
    border-bottom: 1px solid #f1f5f9;
    position: sticky; top: 0; background: #fff; z-index: 2;
  }
  .cd-avatar {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 16px; font-weight: 800; flex-shrink: 0;
  }
  .cd-identity { flex: 1; min-width: 0; }
  .cd-name { font-size: 15px; font-weight: 700; color: #0f172a; }
  .cd-handle { font-size: 12px; color: #64748b; margin-top: 1px; margin-bottom: 6px; }
  .cd-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .cd-tag-niche { background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
  .cd-tag-type  { background: #eff6ff; color: #2563eb; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 500; }
  .cd-close {
    width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid #e2e8f0; background: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #94a3b8; flex-shrink: 0;
    transition: background .12s, color .12s;
  }
  .cd-close:hover { background: #f8fafc; color: #475569; }

  .cd-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid #f1f5f9;
  }
  .cd-stat {
    padding: 12px 0 12px 14px; border-right: 1px solid #f1f5f9;
  }
  .cd-stat:last-child { border-right: none; }
  .cd-stat-val { font-size: 16px; font-weight: 800; color: #0f172a; }
  .cd-stat-lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }

  .cd-section { padding: 14px 18px; border-bottom: 1px solid #f8fafc; }
  .cd-section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; margin-bottom: 10px; }

  .cd-stage-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .cd-stage-btn {
    padding: 4px 11px; border-radius: 7px;
    border: 1px solid #e2e8f0; background: #f8fafc; cursor: pointer;
    font-size: 11px; font-weight: 500; color: #475569;
    font-family: inherit;
    transition: all .12s;
  }
  .cd-stage-btn:hover { border-color: #cbd5e1; background: #fff; }
  .cd-stage-btn.active { font-weight: 700; }

  .cd-row { display: flex; align-items: center; gap: 10px; }
  .cd-muted { font-size: 12px; color: #94a3b8; }
  .cd-poc-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }

  .cd-info-rows { display: flex; flex-direction: column; gap: 8px; }
  .cd-info-row { display: flex; align-items: flex-start; gap: 8px; }
  .cd-info-lbl { width: 100px; font-size: 12px; color: #94a3b8; flex-shrink: 0; }
  .cd-info-val { font-size: 12px; color: #334155; }
  .cd-info-link { font-size: 12px; color: #3b82f6; text-decoration: none; }
  .cd-info-link:hover { text-decoration: underline; }
  .cd-days { font-size: 11px; }
  .cd-days.warn { color: #dc2626; font-weight: 600; }
  .cd-fu-badge { background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; }
  .cd-bool.yes { color: #16a34a; font-size: 12px; font-weight: 600; }
  .cd-bool.no  { color: #94a3b8; font-size: 12px; }

  .cd-perf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cd-perf-item { background: #f8fafc; border-radius: 8px; padding: 10px 12px; }
  .cd-perf-val { font-size: 16px; font-weight: 800; color: #0f172a; }
  .cd-perf-lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }

  .cd-cycle-btn {
    padding: 4px 12px; background: #f1f5f9; color: #475569;
    border: 1px solid #e2e8f0; border-radius: 7px; cursor: pointer;
    font-size: 11px; font-family: inherit;
    transition: all .12s;
  }
  .cd-cycle-btn:hover { background: #e2e8f0; }

  .cd-section-notes { flex: 1; }
  .cd-notes {
    width: 100%; padding: 10px 12px;
    border: 1px solid #e2e8f0; border-radius: 8px;
    font-size: 12px; font-family: inherit; color: #334155;
    resize: vertical; min-height: 80px;
    outline: none; line-height: 1.5;
  }
  .cd-notes:focus { border-color: #3b82f6; }
`;
