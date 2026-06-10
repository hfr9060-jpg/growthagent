"use client";
import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type POC = "Jenny" | "Doris" | "Jialin" | "Falida";
type Stage =
  | "Sourced" | "Contacted" | "Negotiating" | "Brief Sent"
  | "Script Review" | "In Production" | "Published" | "Completed";
type NavTab =
  | "Overview" | "Pipeline" | "Outreach" | "Content" | "Payment" | "Report" | "Partners";

interface Creator {
  id: string;
  handle: string;
  name: string;
  followers: number;
  er: number;
  avg_views: number;
  niche: string;
  stage: Stage;
  poc: POC;
  price: number;
  content_type: string;
  post_date: string;
  views_24h: number;
  signups: number;
  score: number;
  outreach_sent: boolean;
  fu_count: number;
  last_contact: string;
  email: string;
  notes: string;
  payment_status: "Pending" | "Invoiced" | "Paid";
}

// ─── Constants ────────────────────────────────────────────────────────────────
const POC_COLORS: Record<POC, string> = {
  Jenny: "#f59e0b",
  Doris: "#3b82f6",
  Jialin: "#ec4899",
  Falida: "#22c55e",
};

const STAGE_COLORS: Record<Stage, string> = {
  "Sourced":        "#94a3b8",
  "Contacted":      "#60a5fa",
  "Negotiating":    "#f59e0b",
  "Brief Sent":     "#f97316",
  "Script Review":  "#a855f7",
  "In Production":  "#22c55e",
  "Published":      "#06b6d4",
  "Completed":      "#1d4ed8",
};

const STAGES: Stage[] = [
  "Sourced", "Contacted", "Negotiating", "Brief Sent",
  "Script Review", "In Production", "Published", "Completed",
];

const NAV_TABS: NavTab[] = [
  "Overview", "Pipeline", "Outreach", "Content", "Payment", "Report", "Partners",
];

const NAV_ICONS: Record<NavTab, string> = {
  Overview: "◎", Pipeline: "⬡", Outreach: "✉", Content: "▤",
  Payment: "💳", Report: "📊", Partners: "🤝",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_CREATORS: Creator[] = [
  { id:"c01", handle:"@marcuswebb", name:"Marcus Webb",       followers:245000, er:4.2, avg_views:38000, niche:"Career",    stage:"Published",      poc:"Jenny",  price:1850, content_type:"AI Tool Review",    post_date:"2026-06-01", views_24h:52000, signups:218, score:100, outreach_sent:true,  fu_count:0, last_contact:"2026-05-10", email:"marcus@webb.co",         notes:"Top performer",          payment_status:"Paid" },
  { id:"c02", handle:"@sophialin",  name:"Sophia Lin",        followers:189000, er:5.1, avg_views:29000, niche:"Jobs",      stage:"Published",      poc:"Doris",  price:1400, content_type:"Job Search Hack",   post_date:"2026-06-03", views_24h:41000, signups:187, score:92,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-12", email:"sophia@linmedia.com",    notes:"Great retention",        payment_status:"Paid" },
  { id:"c03", handle:"@alexchang",  name:"Alex Chang",        followers:312000, er:3.3, avg_views:55000, niche:"Tech",      stage:"Published",      poc:"Jenny",  price:2800, content_type:"Tool Comparison",   post_date:"2026-06-05", views_24h:63000, signups:241, score:89,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-08", email:"alex@changtech.io",      notes:"Needs FU on invoice",    payment_status:"Invoiced" },
  { id:"c04", handle:"@priyapatel", name:"Priya Patel",       followers:98000,  er:6.8, avg_views:18000, niche:"Career",    stage:"In Production",  poc:"Jialin", price:780,  content_type:"Resume Review",     post_date:"2026-06-12", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:1, last_contact:"2026-05-20", email:"priya@patelcreates.com", notes:"Script v2 approved",     payment_status:"Pending" },
  { id:"c05", handle:"@tomrivera",  name:"Tom Rivera",        followers:421000, er:2.8, avg_views:72000, niche:"Lifestyle", stage:"Script Review",  poc:"Falida", price:3600, content_type:"Career Tip",        post_date:"2026-06-15", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-18", email:"tom@riveracontent.com",  notes:"Waiting on v2",          payment_status:"Pending" },
  { id:"c06", handle:"@emmachen",   name:"Emma Chen",         followers:67000,  er:7.2, avg_views:12000, niche:"Jobs",      stage:"Brief Sent",     poc:"Jenny",  price:520,  content_type:"Job Search Hack",   post_date:"2026-06-18", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:1, last_contact:"2026-05-22", email:"emma@chencreates.co",    notes:"Confirmed brief",        payment_status:"Pending" },
  { id:"c07", handle:"@jakemorris", name:"Jake Morris",       followers:156000, er:4.5, avg_views:27000, niche:"Tech",      stage:"In Production",  poc:"Doris",  price:1200, content_type:"AI Tool Review",    post_date:"2026-06-14", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-19", email:"jake@jakemorris.tv",     notes:"Shooting this week",     payment_status:"Pending" },
  { id:"c08", handle:"@lilykim",    name:"Lily Kim",          followers:234000, er:3.9, avg_views:41000, niche:"Career",    stage:"Negotiating",    poc:"Jialin", price:1700, content_type:"Career Tip",        post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:2, last_contact:"2026-05-23", email:"lily@kimvision.com",     notes:"Counter offer $2000",    payment_status:"Pending" },
  { id:"c09", handle:"@davidpark",  name:"David Park",        followers:89000,  er:5.6, avg_views:16000, niche:"Finance",   stage:"Contacted",      poc:"Falida", price:700,  content_type:"Tool Comparison",   post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:1, last_contact:"2026-05-25", email:"david@parkfinance.io",   notes:"No reply yet",           payment_status:"Pending" },
  { id:"c10", handle:"@rachelyu",   name:"Rachel Yu",         followers:178000, er:4.1, avg_views:31000, niche:"Career",    stage:"Published",      poc:"Jenny",  price:1350, content_type:"Resume Review",     post_date:"2026-06-04", views_24h:38000, signups:154, score:85,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-11", email:"rachel@rayu.co",         notes:"Good ER uplift",         payment_status:"Paid" },
  { id:"c11", handle:"@miketan",    name:"Mike Tan",          followers:52000,  er:8.1, avg_views:9500,  niche:"Jobs",      stage:"Sourced",        poc:"Doris",  price:400,  content_type:"Job Search Hack",   post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:false, fu_count:0, last_contact:"",           email:"mike@miketan.me",        notes:"Found via NanoInf",      payment_status:"Pending" },
  { id:"c12", handle:"@annafield",  name:"Anna Field",        followers:310000, er:3.0, avg_views:49000, niche:"Lifestyle", stage:"Completed",      poc:"Jialin", price:2400, content_type:"AI Tool Review",    post_date:"2026-05-28", views_24h:58000, signups:203, score:87,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-05", email:"anna@fieldmedia.com",    notes:"Long-term candidate",    payment_status:"Paid" },
  { id:"c13", handle:"@benhuang",   name:"Ben Huang",         followers:134000, er:4.8, avg_views:22000, niche:"Tech",      stage:"Script Review",  poc:"Falida", price:1050, content_type:"Tool Comparison",   post_date:"2026-06-16", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-21", email:"ben@benhtech.com",       notes:"Script sent",            payment_status:"Pending" },
  { id:"c14", handle:"@claraosborne",name:"Clara Osborne",    followers:76000,  er:6.3, avg_views:13500, niche:"Career",    stage:"Brief Sent",     poc:"Jenny",  price:580,  content_type:"Career Tip",        post_date:"2026-06-19", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-24", email:"clara@claraosborne.co",  notes:"Enthusiastic",           payment_status:"Pending" },
  { id:"c15", handle:"@seanwu",     name:"Sean Wu",           followers:201000, er:3.7, avg_views:35000, niche:"Finance",   stage:"In Production",  poc:"Doris",  price:1580, content_type:"AI Tool Review",    post_date:"2026-06-13", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-20", email:"sean@seanwumedia.io",    notes:"Delivery on time",       payment_status:"Pending" },
  { id:"c16", handle:"@nataliereyes",name:"Natalie Reyes",    followers:445000, er:2.6, avg_views:78000, niche:"Career",    stage:"Published",      poc:"Jialin", price:3900, content_type:"Resume Review",     post_date:"2026-06-02", views_24h:89000, signups:312, score:96,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-09", email:"natalie@reyes.media",    notes:"Top 3 performer",        payment_status:"Paid" },
  { id:"c17", handle:"@oliverchen", name:"Oliver Chen",       followers:88000,  er:5.4, avg_views:15000, niche:"Jobs",      stage:"Contacted",      poc:"Falida", price:680,  content_type:"Job Search Hack",   post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:2, last_contact:"2026-05-26", email:"oliver@olcreates.co",    notes:"FU#2 sent",              payment_status:"Pending" },
  { id:"c18", handle:"@hannahmay",  name:"Hannah May",        followers:122000, er:4.6, avg_views:21000, niche:"Lifestyle", stage:"Negotiating",    poc:"Jenny",  price:950,  content_type:"Career Tip",        post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:1, last_contact:"2026-05-25", email:"hannah@hannahmaytv.com", notes:"Rate discussion",        payment_status:"Pending" },
  { id:"c19", handle:"@ryanleung",  name:"Ryan Leung",        followers:267000, er:3.5, avg_views:46000, niche:"Tech",      stage:"Completed",      poc:"Doris",  price:2100, content_type:"Tool Comparison",   post_date:"2026-05-25", views_24h:54000, signups:189, score:83,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-03", email:"ryan@ryleung.io",        notes:"Good ROI",               payment_status:"Paid" },
  { id:"c20", handle:"@isabellawood",name:"Isabella Wood",    followers:55000,  er:7.8, avg_views:10000, niche:"Career",    stage:"Sourced",        poc:"Jialin", price:430,  content_type:"Resume Review",     post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:false, fu_count:0, last_contact:"",           email:"issy@isabellawood.co",   notes:"Via NanoInfluencer",     payment_status:"Pending" },
  { id:"c21", handle:"@matthewlam", name:"Matthew Lam",       followers:189000, er:4.0, avg_views:33000, niche:"Finance",   stage:"Brief Sent",     poc:"Falida", price:1450, content_type:"AI Tool Review",    post_date:"2026-06-20", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-23", email:"matt@mlam.tv",           notes:"Brief confirmed",        payment_status:"Pending" },
  { id:"c22", handle:"@zoegrant",   name:"Zoe Grant",         followers:334000, er:3.1, avg_views:58000, niche:"Lifestyle", stage:"Published",      poc:"Jenny",  price:2650, content_type:"Career Tip",        post_date:"2026-06-06", views_24h:71000, signups:267, score:91,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-13", email:"zoe@zoegrant.media",     notes:"Strong delivery",        payment_status:"Invoiced" },
  { id:"c23", handle:"@aaronmoss",  name:"Aaron Moss",        followers:71000,  er:6.1, avg_views:12500, niche:"Jobs",      stage:"Script Review",  poc:"Doris",  price:550,  content_type:"Job Search Hack",   post_date:"2026-06-17", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-22", email:"aaron@aaronmoss.co",     notes:"v1 feedback sent",       payment_status:"Pending" },
  { id:"c24", handle:"@chloe_james",name:"Chloe James",       followers:146000, er:4.4, avg_views:25000, niche:"Career",    stage:"In Production",  poc:"Jialin", price:1150, content_type:"Resume Review",     post_date:"2026-06-11", views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-19", email:"chloe@chloejames.tv",    notes:"Filming done",           payment_status:"Pending" },
  { id:"c25", handle:"@ethanroberts",name:"Ethan Roberts",   followers:502000, er:2.4, avg_views:88000, niche:"Tech",      stage:"Published",      poc:"Falida", price:4200, content_type:"AI Tool Review",    post_date:"2026-06-07", views_24h:102000, signups:389, score:94, outreach_sent:true,  fu_count:0, last_contact:"2026-05-10", email:"ethan@eroberts.io",      notes:"Top 5 all-time",         payment_status:"Invoiced" },
  { id:"c26", handle:"@misakitanaka",name:"Misaki Tanaka",   followers:93000,  er:5.9, avg_views:17000, niche:"Career",    stage:"Contacted",      poc:"Jenny",  price:720,  content_type:"Career Tip",        post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:0, last_contact:"2026-05-27", email:"misaki@msakitv.com",     notes:"Replied positively",     payment_status:"Pending" },
  { id:"c27", handle:"@lucasevans",  name:"Lucas Evans",      followers:212000, er:3.8, avg_views:37000, niche:"Finance",   stage:"Completed",      poc:"Doris",  price:1680, content_type:"Tool Comparison",   post_date:"2026-05-22", views_24h:45000, signups:162, score:79,  outreach_sent:true,  fu_count:0, last_contact:"2026-04-30", email:"lucas@lucasevans.co",    notes:"Repeat candidate",       payment_status:"Paid" },
  { id:"c28", handle:"@amberli",     name:"Amber Li",         followers:118000, er:4.9, avg_views:20000, niche:"Jobs",      stage:"Negotiating",    poc:"Jialin", price:920,  content_type:"Job Search Hack",   post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:true,  fu_count:1, last_contact:"2026-05-26", email:"amber@amberli.media",    notes:"Wants 15% affiliate",    payment_status:"Pending" },
  { id:"c29", handle:"@jacksonwang", name:"Jackson Wang",     followers:387000, er:2.9, avg_views:65000, niche:"Lifestyle", stage:"Published",      poc:"Falida", price:3100, content_type:"Career Tip",        post_date:"2026-06-08", views_24h:78000, signups:298, score:88,  outreach_sent:true,  fu_count:0, last_contact:"2026-05-14", email:"jackson@jacksonwang.tv", notes:"Solid delivery",         payment_status:"Invoiced" },
  { id:"c30", handle:"@grace_ho",    name:"Grace Ho",         followers:61000,  er:7.0, avg_views:11000, niche:"Career",    stage:"Sourced",        poc:"Jenny",  price:480,  content_type:"Resume Review",     post_date:"",           views_24h:0,     signups:0,   score:0,   outreach_sent:false, fu_count:0, last_contact:"",           email:"grace@graceho.co",       notes:"NanoInf export",         payment_status:"Pending" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KolPage() {
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [activeTab, setActiveTab] = useState<NavTab>("Pipeline");
  const [activePOC, setActivePOC] = useState<POC | "All">("All");
  const [campaign, setCampaign] = useState("Demo June");

  const filtered = activePOC === "All"
    ? creators
    : creators.filter(c => c.poc === activePOC);

  function moveStage(id: string, stage: Stage) {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, stage } : c));
  }

  return (
    <div className="kol-shell">
      <style>{CSS}</style>

      {/* ── Sidebar ── */}
      <aside className="kol-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">K</span>
          <div>
            <div className="sidebar-title">KOL Pipeline</div>
            <div className="sidebar-sub">Influencer OS</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_TABS.map(tab => (
            <button
              key={tab}
              className={`sidebar-item ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="sidebar-icon">{NAV_ICONS[tab]}</span>
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-filters">
          <div className="filter-label">FILTERS</div>
          <select className="filter-select" value={campaign} onChange={e => setCampaign(e.target.value)}>
            <option>Demo June</option>
            <option>Demo May</option>
            <option>Q3 2026</option>
          </select>
          <div className="poc-dots">
            <button
              className={`poc-dot ${activePOC === "All" ? "active" : ""}`}
              style={{ background: "#64748b" }}
              onClick={() => setActivePOC("All")}
              title="All"
            >All</button>
            {(Object.keys(POC_COLORS) as POC[]).map(p => (
              <button
                key={p}
                className={`poc-dot ${activePOC === p ? "active" : ""}`}
                style={{ background: POC_COLORS[p] }}
                onClick={() => setActivePOC(p === activePOC ? "All" : p)}
                title={p}
              >{p[0]}</button>
            ))}
          </div>
        </div>

        <div className="sidebar-watermark">
          GitHub Pages · Next.js 16<br />
          Google Sheets · Railway
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="kol-main">
        <header className="kol-topbar">
          <div className="topbar-left">
            <span className="topbar-tab">{activeTab}</span>
            <span className="topbar-campaign">{campaign}</span>
          </div>
          <div className="topbar-right">
            {(Object.keys(POC_COLORS) as POC[]).map(p => (
              <span key={p} className="poc-badge" style={{ background: POC_COLORS[p] }}>{p}</span>
            ))}
          </div>
        </header>

        <div className="kol-body">
          {activeTab === "Overview"  && <OverviewTab  creators={filtered} />}
          {activeTab === "Pipeline"  && <PipelineTab  creators={filtered} onMove={moveStage} />}
          {activeTab === "Outreach"  && <OutreachTab  creators={filtered} />}
          {activeTab === "Content"   && <ContentTab   creators={filtered} />}
          {activeTab === "Payment"   && <PaymentTab   creators={filtered} setCreators={setCreators} />}
          {activeTab === "Report"    && <ReportTab    creators={filtered} />}
          {activeTab === "Partners"  && <PartnersTab  creators={filtered} />}
        </div>
      </main>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ creators }: { creators: Creator[] }) {
  const published  = creators.filter(c => c.stage === "Published" || c.stage === "Completed");
  const totalSpend = creators.reduce((s, c) => s + c.price, 0);
  const totalViews = published.reduce((s, c) => s + c.views_24h, 0);
  const totalSigns = published.reduce((s, c) => s + c.signups, 0);
  const avgCPM     = published.length
    ? published.reduce((s, c) => s + (c.price / (c.views_24h || 1) * 1000), 0) / published.length
    : 0;
  const avgCPA     = totalSigns ? totalSpend / totalSigns : 0;

  const stageCounts = STAGES.map(s => ({ stage: s, count: creators.filter(c => c.stage === s).length }));
  const funnelTotal = creators.length;

  return (
    <div className="overview-grid">
      {/* Metric Cards */}
      <div className="metric-strip">
        <MetricCard label="Total Creators" value={String(creators.length)} sub="this campaign" />
        <MetricCard label="Total Spend" value={`$${totalSpend.toLocaleString()}`} sub="committed" />
        <MetricCard label="Published" value={String(published.length)} sub="videos live" />
        <MetricCard label="Total Signups" value={String(totalSigns)} sub="attributed" />
        <MetricCard label="Avg CPM" value={`$${avgCPM.toFixed(2)}`} sub="vs $20 TK baseline" />
        <MetricCard label="Avg CPA" value={`$${avgCPA.toFixed(2)}`} sub="per signup" />
      </div>

      {/* Pipeline Funnel */}
      <div className="overview-card">
        <div className="card-title">Sourcing Funnel</div>
        <div className="funnel-bars">
          {stageCounts.map(({ stage, count }) => (
            <div key={stage} className="funnel-row">
              <div className="funnel-label">{stage}</div>
              <div className="funnel-track">
                <div
                  className="funnel-fill"
                  style={{
                    width: `${funnelTotal ? (count / funnelTotal) * 100 : 0}%`,
                    background: STAGE_COLORS[stage],
                  }}
                />
              </div>
              <div className="funnel-count">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="overview-card">
        <div className="card-title">Campaign Execution</div>
        <div className="exec-rows">
          {(["Jenny","Doris","Jialin","Falida"] as POC[]).map(poc => {
            const poc_cs  = creators.filter(c => c.poc === poc);
            const done    = poc_cs.filter(c => c.stage === "Published" || c.stage === "Completed").length;
            const total   = poc_cs.length;
            return (
              <div key={poc} className="exec-row">
                <span className="exec-poc" style={{ color: POC_COLORS[poc] }}>● {poc}</span>
                <div className="exec-track">
                  <div className="exec-fill" style={{ width: `${total ? (done/total)*100 : 0}%`, background: POC_COLORS[poc] }} />
                </div>
                <span className="exec-count">{done}/{total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Type Breakdown */}
      <div className="overview-card">
        <div className="card-title">Content Type Mix</div>
        <div className="type-list">
          {["AI Tool Review","Job Search Hack","Resume Review","Career Tip","Tool Comparison"].map(type => {
            const count = creators.filter(c => c.content_type === type).length;
            return (
              <div key={type} className="type-row">
                <span className="type-name">{type}</span>
                <span className="type-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="metric-card">
      <div className="mc-label">{label}</div>
      <div className="mc-value">{value}</div>
      <div className="mc-sub">{sub}</div>
    </div>
  );
}

// ─── Pipeline / Kanban Tab ────────────────────────────────────────────────────
function PipelineTab({ creators, onMove }: { creators: Creator[]; onMove: (id: string, stage: Stage) => void }) {
  const dragId = useRef<string | null>(null);

  function handleDragStart(id: string) { dragId.current = id; }
  function handleDrop(stage: Stage) {
    if (dragId.current) { onMove(dragId.current, stage); dragId.current = null; }
  }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }

  // POC task summary
  const pocs = ["Jenny","Doris","Jialin","Falida"] as POC[];

  return (
    <div>
      {/* POC Summary */}
      <div className="poc-summary">
        {pocs.map(poc => {
          const cs = creators.filter(c => c.poc === poc);
          const overdue = cs.filter(c =>
            c.stage !== "Published" && c.stage !== "Completed" && c.stage !== "Sourced"
          ).length;
          return (
            <div key={poc} className="poc-summary-card">
              <span className="poc-dot-sm" style={{ background: POC_COLORS[poc] }}/>
              <span className="poc-name">{poc}</span>
              <span className="poc-stat">{cs.length} creators</span>
              {overdue > 0 && <span className="overdue-badge">{overdue} active</span>}
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {STAGES.map(stage => {
          const cards = creators.filter(c => c.stage === stage);
          return (
            <div
              key={stage}
              className="kanban-col"
              onDrop={() => handleDrop(stage)}
              onDragOver={handleDragOver}
            >
              <div className="kanban-col-header" style={{ borderTop: `3px solid ${STAGE_COLORS[stage]}` }}>
                <span className="kanban-col-name">{stage}</span>
                <span className="kanban-col-count">{cards.length}</span>
              </div>
              <div className="kanban-cards">
                {cards.map(c => (
                  <div
                    key={c.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => handleDragStart(c.id)}
                  >
                    <div className="kc-top">
                      <span className="kc-handle">{c.handle}</span>
                      <span className="kc-poc-dot" style={{ background: POC_COLORS[c.poc] }} title={c.poc}/>
                    </div>
                    <div className="kc-meta">
                      <span>{(c.followers / 1000).toFixed(0)}K · {c.er}% ER</span>
                    </div>
                    <div className="kc-price">${c.price.toLocaleString()}</div>
                    {c.post_date && <div className="kc-date">📅 {c.post_date}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Outreach Tab ─────────────────────────────────────────────────────────────
function OutreachTab({ creators }: { creators: Creator[] }) {
  const unsent  = creators.filter(c => !c.outreach_sent);
  const needsFU = creators.filter(c => c.outreach_sent && c.fu_count < 2 && c.stage === "Contacted");
  const all     = creators.filter(c => c.outreach_sent);

  return (
    <div className="outreach-wrap">
      <div className="outreach-auth">
        ✉ Authorized as <strong>jenny@jobright.ai</strong> · sending as POC Jenny
      </div>

      <div className="outreach-section">
        <div className="section-title">📤 Unsent Outreach ({unsent.length})</div>
        <table className="ot-table">
          <thead><tr><th>Handle</th><th>Name</th><th>POC</th><th>Followers</th><th>Price</th><th>Email</th></tr></thead>
          <tbody>
            {unsent.map(c => (
              <tr key={c.id}>
                <td>{c.handle}</td>
                <td>{c.name}</td>
                <td><span style={{ color: POC_COLORS[c.poc] }}>●</span> {c.poc}</td>
                <td>{(c.followers/1000).toFixed(0)}K</td>
                <td>${c.price.toLocaleString()}</td>
                <td><a href={`mailto:${c.email}`}>{c.email}</a></td>
              </tr>
            ))}
            {unsent.length === 0 && <tr><td colSpan={6} className="empty-row">All creators contacted ✓</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="outreach-section">
        <div className="section-title">🔁 Follow-ups Needed ({needsFU.length})</div>
        <table className="ot-table">
          <thead><tr><th>Handle</th><th>POC</th><th>Last Contact</th><th>FU #</th><th>Days Since</th></tr></thead>
          <tbody>
            {needsFU.map(c => {
              const days = c.last_contact
                ? Math.floor((Date.now() - new Date(c.last_contact).getTime()) / 86400000)
                : "—";
              return (
                <tr key={c.id}>
                  <td>{c.handle}</td>
                  <td><span style={{ color: POC_COLORS[c.poc] }}>●</span> {c.poc}</td>
                  <td>{c.last_contact || "—"}</td>
                  <td><span className="fu-badge">FU#{c.fu_count}</span></td>
                  <td className={Number(days) > 3 ? "overdue-text" : ""}>{days}d</td>
                </tr>
              );
            })}
            {needsFU.length === 0 && <tr><td colSpan={5} className="empty-row">No follow-ups pending ✓</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="outreach-section">
        <div className="section-title">📋 All Outreach ({all.length})</div>
        <table className="ot-table">
          <thead><tr><th>Handle</th><th>POC</th><th>Stage</th><th>FU#</th><th>Last Contact</th><th>Notes</th></tr></thead>
          <tbody>
            {all.map(c => (
              <tr key={c.id}>
                <td>{c.handle}</td>
                <td><span style={{ color: POC_COLORS[c.poc] }}>●</span> {c.poc}</td>
                <td><span className="stage-chip" style={{ background: STAGE_COLORS[c.stage] + "22", color: STAGE_COLORS[c.stage] }}>{c.stage}</span></td>
                <td>{c.fu_count}</td>
                <td>{c.last_contact || "—"}</td>
                <td className="notes-cell">{c.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab({ creators }: { creators: Creator[] }) {
  const published = creators.filter(c => c.post_date).sort((a, b) => a.post_date.localeCompare(b.post_date));
  const grouped: Record<string, Creator[]> = {};
  published.forEach(c => {
    if (!grouped[c.post_date]) grouped[c.post_date] = [];
    grouped[c.post_date].push(c);
  });

  return (
    <div className="content-wrap">
      <div className="content-calendar">
        {Object.entries(grouped).map(([date, cs]) => (
          <div key={date} className="cal-day">
            <div className="cal-date">{date}</div>
            {cs.map(c => (
              <div key={c.id} className="cal-item" style={{ borderLeft: `3px solid ${POC_COLORS[c.poc]}` }}>
                <span>{c.handle}</span>
                <span className="cal-type">{c.content_type}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <table className="ot-table content-table">
        <thead>
          <tr>
            <th>Handle</th><th>POC</th><th>Content Type</th><th>Post Date</th>
            <th>24h Views</th><th>Signups</th><th>Price</th><th>CPM</th><th>CPA</th>
          </tr>
        </thead>
        <tbody>
          {published.map(c => {
            const cpm = c.views_24h ? (c.price / c.views_24h * 1000).toFixed(2) : "—";
            const cpa = c.signups ? (c.price / c.signups).toFixed(2) : "—";
            return (
              <tr key={c.id}>
                <td>{c.handle}</td>
                <td><span style={{ color: POC_COLORS[c.poc] }}>●</span> {c.poc}</td>
                <td>{c.content_type}</td>
                <td>{c.post_date}</td>
                <td>{c.views_24h.toLocaleString()}</td>
                <td>{c.signups}</td>
                <td>${c.price.toLocaleString()}</td>
                <td>${cpm}</td>
                <td>${cpa}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────
function PaymentTab({ creators, setCreators }: { creators: Creator[]; setCreators: React.Dispatch<React.SetStateAction<Creator[]>> }) {
  function cycleStatus(id: string) {
    setCreators(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next: Creator["payment_status"] = c.payment_status === "Pending" ? "Invoiced" : c.payment_status === "Invoiced" ? "Paid" : "Pending";
      return { ...c, payment_status: next };
    }));
  }

  const totalPaid    = creators.filter(c => c.payment_status === "Paid").reduce((s, c) => s + c.price, 0);
  const totalInvoice = creators.filter(c => c.payment_status === "Invoiced").reduce((s, c) => s + c.price, 0);
  const totalPending = creators.filter(c => c.payment_status === "Pending").reduce((s, c) => s + c.price, 0);

  return (
    <div className="payment-wrap">
      <div className="payment-summary">
        <div className="ps-card paid"><div className="ps-label">Paid</div><div className="ps-val">${totalPaid.toLocaleString()}</div></div>
        <div className="ps-card invoiced"><div className="ps-label">Invoiced</div><div className="ps-val">${totalInvoice.toLocaleString()}</div></div>
        <div className="ps-card pending"><div className="ps-label">Pending</div><div className="ps-val">${totalPending.toLocaleString()}</div></div>
      </div>

      <table className="ot-table">
        <thead><tr><th>Handle</th><th>Name</th><th>POC</th><th>Price</th><th>Status</th><th>Toggle</th></tr></thead>
        <tbody>
          {creators.map(c => (
            <tr key={c.id}>
              <td>{c.handle}</td>
              <td>{c.name}</td>
              <td><span style={{ color: POC_COLORS[c.poc] }}>●</span> {c.poc}</td>
              <td>${c.price.toLocaleString()}</td>
              <td>
                <span className={`pay-badge ${c.payment_status.toLowerCase()}`}>{c.payment_status}</span>
              </td>
              <td>
                <button className="toggle-btn" onClick={() => cycleStatus(c.id)}>→</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Report Tab ───────────────────────────────────────────────────────────────
function ReportTab({ creators }: { creators: Creator[] }) {
  const published = creators.filter(c => c.score > 0).sort((a, b) => b.score - a.score);
  const totalSpend = creators.reduce((s, c) => s + c.price, 0);
  const totalSigns = published.reduce((s, c) => s + c.signups, 0);
  const avgCPA     = totalSigns ? (totalSpend / totalSigns).toFixed(2) : "—";
  const bestCPM    = published.length
    ? Math.min(...published.map(c => c.price / c.views_24h * 1000)).toFixed(2)
    : "—";

  return (
    <div className="report-wrap">
      <div className="report-takeaways">
        <div className="takeaways-title">✨ Key Takeaways (AI-generated)</div>
        <ul className="takeaways-list">
          <li>Resume Review content delivered <strong>+61% ER uplift</strong> vs baseline — highest of all content types.</li>
          <li>Mid-tier creators (100k–500k) achieved best CPM at <strong>${bestCPM}</strong>, outperforming micro and macro tiers.</li>
          <li>Average Cost/Signup this campaign: <strong>${avgCPA}</strong> vs industry average $354.89.</li>
          <li>New Grad / Intern audience segment generated <strong>+74.8% ER uplift</strong> — recommend targeting in Q3.</li>
          <li>Top 3 performers account for <strong>40% of total signups</strong> on 28% of total spend.</li>
        </ul>
      </div>

      <div className="report-section-title">🏆 Top Performers</div>
      <div className="top-performers">
        {published.slice(0, 5).map((c, i) => (
          <div key={c.id} className="performer-card">
            <div className="perf-rank">#{i + 1}</div>
            <div className="perf-name">{c.name}</div>
            <div className="perf-handle">{c.handle}</div>
            <div className="perf-score">Score <strong>{c.score}</strong></div>
            <div className="perf-metrics">
              <span>{c.views_24h.toLocaleString()} views</span>
              <span>{c.signups} signups</span>
              <span>${c.price.toLocaleString()}</span>
            </div>
            <div className="perf-type">{c.content_type}</div>
          </div>
        ))}
      </div>

      <div className="report-section-title">📋 All Videos by Score</div>
      <table className="ot-table">
        <thead>
          <tr><th>Rank</th><th>Handle</th><th>Content Type</th><th>Score</th><th>Views</th><th>Signups</th><th>CPM</th><th>CPA</th></tr>
        </thead>
        <tbody>
          {published.map((c, i) => (
            <tr key={c.id}>
              <td>#{i+1}</td>
              <td>{c.handle}</td>
              <td>{c.content_type}</td>
              <td><strong>{c.score}</strong></td>
              <td>{c.views_24h.toLocaleString()}</td>
              <td>{c.signups}</td>
              <td>${(c.price / c.views_24h * 1000).toFixed(2)}</td>
              <td>${(c.price / c.signups).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Partners Tab ─────────────────────────────────────────────────────────────
function PartnersTab({ creators }: { creators: Creator[] }) {
  const partners = creators.filter(c => c.score >= 80 || c.payment_status === "Paid");
  const totalSpend = partners.reduce((s, c) => s + c.price, 0);
  const avgScore = partners.length
    ? (partners.reduce((s, c) => s + c.score, 0) / partners.length).toFixed(1)
    : 0;

  return (
    <div className="partners-wrap">
      <div className="partners-metrics">
        <div className="pm-card"><div className="pm-label">Active Partners</div><div className="pm-val">{partners.length}</div></div>
        <div className="pm-card"><div className="pm-label">Total Spend</div><div className="pm-val">${totalSpend.toLocaleString()}</div></div>
        <div className="pm-card"><div className="pm-label">Avg Score</div><div className="pm-val">{avgScore}</div></div>
        <div className="pm-card"><div className="pm-label">Paid</div><div className="pm-val">{partners.filter(c => c.payment_status === "Paid").length}/{partners.length}</div></div>
      </div>

      <table className="ot-table">
        <thead>
          <tr><th>Handle</th><th>Name</th><th>Followers</th><th>ER</th><th>Score</th><th>Spend</th><th>Content Type</th><th>POC</th><th>Status</th></tr>
        </thead>
        <tbody>
          {partners.map(c => (
            <tr key={c.id}>
              <td>{c.handle}</td>
              <td>{c.name}</td>
              <td>{(c.followers/1000).toFixed(0)}K</td>
              <td>{c.er}%</td>
              <td><strong>{c.score || "—"}</strong></td>
              <td>${c.price.toLocaleString()}</td>
              <td>{c.content_type}</td>
              <td><span style={{ color: POC_COLORS[c.poc] }}>●</span> {c.poc}</td>
              <td><span className={`pay-badge ${c.payment_status.toLowerCase()}`}>{c.payment_status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  .kol-shell {
    display: flex;
    min-height: 100vh;
    background: #f1f5f9;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    font-size: 13px;
    color: #0f172a;
  }

  /* Sidebar */
  .kol-sidebar {
    width: 220px;
    min-height: 100vh;
    background: #fff;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    flex-shrink: 0;
  }
  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 16px 16px;
    border-bottom: 1px solid #f1f5f9;
  }
  .sidebar-logo {
    width: 32px; height: 32px;
    background: #3b82f6;
    color: #fff;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 16px;
  }
  .sidebar-title { font-weight: 600; font-size: 14px; }
  .sidebar-sub   { font-size: 11px; color: #94a3b8; }
  .sidebar-nav   { padding: 12px 8px; flex: 1; }
  .sidebar-item  {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 10px;
    border: none; background: none; cursor: pointer;
    border-radius: 6px; color: #475569;
    font-size: 13px; font-family: inherit;
    transition: background 0.15s;
  }
  .sidebar-item:hover { background: #f8fafc; }
  .sidebar-item.active {
    background: #eff6ff;
    color: #2563eb;
    border-left: 3px solid #3b82f6;
  }
  .sidebar-icon { font-size: 15px; width: 20px; text-align: center; }
  .sidebar-filters {
    padding: 12px 14px;
    border-top: 1px solid #f1f5f9;
  }
  .filter-label { font-size: 10px; letter-spacing: .1em; color: #94a3b8; margin-bottom: 8px; }
  .filter-select {
    width: 100%; padding: 6px 8px; border: 1px solid #e2e8f0;
    border-radius: 6px; font-size: 12px; color: #334155;
    background: #f8fafc; font-family: inherit; cursor: pointer;
  }
  .poc-dots { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
  .poc-dot  {
    width: 28px; height: 28px; border-radius: 50%;
    color: #fff; font-size: 10px; font-weight: 700;
    border: 2px solid transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .poc-dot.active { border-color: #0f172a; }
  .sidebar-watermark {
    padding: 12px 14px;
    font-size: 10px; color: #cbd5e1; line-height: 1.6;
    border-top: 1px solid #f1f5f9;
  }

  /* Main */
  .kol-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .kol-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px;
    background: #fff; border-bottom: 1px solid #e2e8f0;
    position: sticky; top: 0; z-index: 10;
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .topbar-tab  { font-weight: 600; font-size: 15px; }
  .topbar-campaign { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }
  .topbar-right { display: flex; gap: 8px; }
  .poc-badge {
    padding: 2px 10px; border-radius: 12px;
    color: #fff; font-size: 11px; font-weight: 600;
  }
  .kol-body { padding: 20px 24px; flex: 1; overflow: auto; }

  /* Metric Cards */
  .metric-strip { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .metric-card  {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 14px 18px; min-width: 140px; flex: 1;
  }
  .mc-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .mc-value { font-size: 22px; font-weight: 700; color: #0f172a; }
  .mc-sub   { font-size: 11px; color: #94a3b8; margin-top: 2px; }

  /* Overview */
  .overview-grid { display: flex; flex-direction: column; gap: 16px; }
  .overview-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; }
  .card-title    { font-weight: 600; font-size: 13px; margin-bottom: 12px; color: #1e293b; }
  .funnel-bars   { display: flex; flex-direction: column; gap: 8px; }
  .funnel-row    { display: flex; align-items: center; gap: 10px; }
  .funnel-label  { width: 130px; font-size: 12px; color: #475569; flex-shrink: 0; }
  .funnel-track  { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .funnel-fill   { height: 100%; border-radius: 4px; transition: width .3s; }
  .funnel-count  { width: 24px; text-align: right; font-size: 12px; font-weight: 600; color: #334155; }
  .exec-rows     { display: flex; flex-direction: column; gap: 10px; }
  .exec-row      { display: flex; align-items: center; gap: 10px; }
  .exec-poc      { width: 80px; font-size: 12px; font-weight: 600; flex-shrink: 0; }
  .exec-track    { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .exec-fill     { height: 100%; border-radius: 4px; }
  .exec-count    { width: 32px; font-size: 12px; color: #64748b; text-align: right; }
  .type-list     { display: flex; flex-direction: column; gap: 8px; }
  .type-row      { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #f8fafc; }
  .type-name     { color: #334155; }
  .type-count    { font-weight: 700; color: #3b82f6; }

  /* Pipeline / Kanban */
  .poc-summary {
    display: flex; gap: 10px; margin-bottom: 16px;
  }
  .poc-summary-card {
    display: flex; align-items: center; gap: 6px;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 8px 14px; font-size: 12px;
  }
  .poc-dot-sm { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .poc-name   { font-weight: 600; }
  .poc-stat   { color: #64748b; }
  .overdue-badge {
    background: #fef2f2; color: #dc2626;
    padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 600;
  }

  .kanban-board {
    display: flex; gap: 12px; overflow-x: auto;
    padding-bottom: 16px; min-height: 60vh;
  }
  .kanban-col {
    min-width: 200px; width: 200px; flex-shrink: 0;
    background: #f8fafc; border-radius: 10px; overflow: hidden;
  }
  .kanban-col-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px;
    background: #fff; border-bottom: 1px solid #e2e8f0;
  }
  .kanban-col-name  { font-weight: 600; font-size: 11px; color: #334155; }
  .kanban-col-count {
    background: #f1f5f9; color: #64748b;
    border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 600;
  }
  .kanban-cards { display: flex; flex-direction: column; gap: 8px; padding: 10px 8px; }
  .kanban-card  {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
    padding: 10px 12px; cursor: grab;
    transition: box-shadow .15s;
  }
  .kanban-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
  .kc-top    { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .kc-handle { font-weight: 600; font-size: 12px; }
  .kc-poc-dot{ width: 8px; height: 8px; border-radius: 50%; }
  .kc-meta   { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .kc-price  { font-size: 12px; font-weight: 700; color: #0f172a; }
  .kc-date   { font-size: 11px; color: #94a3b8; margin-top: 3px; }

  /* Outreach / Tables */
  .outreach-wrap, .content-wrap, .payment-wrap, .report-wrap, .partners-wrap {
    display: flex; flex-direction: column; gap: 20px;
  }
  .outreach-auth {
    background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
    padding: 10px 16px; font-size: 12px; color: #1e40af;
  }
  .outreach-section { display: flex; flex-direction: column; gap: 8px; }
  .section-title    { font-weight: 600; font-size: 13px; color: #1e293b; }

  .ot-table {
    width: 100%; border-collapse: collapse;
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    overflow: hidden; font-size: 12px;
  }
  .ot-table th {
    background: #f8fafc; padding: 8px 12px;
    text-align: left; font-weight: 600; color: #475569;
    border-bottom: 1px solid #e2e8f0; white-space: nowrap;
  }
  .ot-table td {
    padding: 8px 12px; border-bottom: 1px solid #f8fafc;
    color: #334155; vertical-align: middle;
  }
  .ot-table tr:last-child td { border-bottom: none; }
  .ot-table tr:hover td { background: #f8fafc; }
  .ot-table a { color: #3b82f6; text-decoration: none; }

  .empty-row   { text-align: center; color: #94a3b8; padding: 16px !important; }
  .fu-badge    { background: #fef3c7; color: #92400e; padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .overdue-text{ color: #dc2626; font-weight: 600; }
  .notes-cell  { max-width: 160px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stage-chip  { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }

  /* Content */
  .content-calendar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
  .cal-day  { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; min-width: 160px; }
  .cal-date { font-weight: 600; font-size: 11px; color: #64748b; margin-bottom: 8px; }
  .cal-item { padding: 5px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 4px; background: #f8fafc; display: flex; justify-content: space-between; gap: 6px; }
  .cal-type { color: #94a3b8; }
  .content-table { margin-top: 8px; }

  /* Payment */
  .payment-summary { display: flex; gap: 12px; }
  .ps-card  { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; flex: 1; }
  .ps-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .ps-val   { font-size: 22px; font-weight: 700; }
  .ps-card.paid     .ps-val { color: #16a34a; }
  .ps-card.invoiced .ps-val { color: #d97706; }
  .ps-card.pending  .ps-val { color: #94a3b8; }
  .pay-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
  .pay-badge.paid     { background: #dcfce7; color: #15803d; }
  .pay-badge.invoiced { background: #fef3c7; color: #92400e; }
  .pay-badge.pending  { background: #f1f5f9; color: #64748b; }
  .toggle-btn {
    padding: 4px 12px; background: #3b82f6; color: #fff;
    border: none; border-radius: 6px; cursor: pointer; font-size: 12px;
  }

  /* Report */
  .report-takeaways {
    background: #fefce8; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px;
  }
  .takeaways-title { font-weight: 700; font-size: 13px; color: #92400e; margin-bottom: 10px; }
  .takeaways-list  { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 6px; }
  .takeaways-list li { font-size: 13px; color: #78350f; line-height: 1.5; }
  .report-section-title { font-weight: 600; font-size: 14px; color: #1e293b; }
  .top-performers { display: flex; gap: 12px; flex-wrap: wrap; }
  .performer-card {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 14px 16px; min-width: 160px; flex: 1;
  }
  .perf-rank    { font-size: 20px; font-weight: 800; color: #3b82f6; margin-bottom: 4px; }
  .perf-name    { font-weight: 600; font-size: 13px; }
  .perf-handle  { font-size: 11px; color: #64748b; margin-bottom: 8px; }
  .perf-score   { font-size: 12px; margin-bottom: 6px; }
  .perf-metrics { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: #64748b; }
  .perf-type    { font-size: 11px; color: #3b82f6; margin-top: 6px; }

  /* Partners */
  .partners-metrics { display: flex; gap: 12px; margin-bottom: 8px; }
  .pm-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; flex: 1; }
  .pm-label{ font-size: 11px; color: #64748b; margin-bottom: 4px; }
  .pm-val  { font-size: 20px; font-weight: 700; color: #0f172a; }
`;
