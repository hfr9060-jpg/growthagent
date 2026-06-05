"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type TabKey = "runs" | "topics" | "reviews" | "campaigns";
type AgentKey = "agent1" | "agent2" | "agent3" | "agent4" | "agent5" | "agent6" | "agent7" | "agent8";
type AnyRecord = Record<string, unknown>;

type FetchState = {
  runs: AnyRecord[];
  topics: AnyRecord[];
  reviews: AnyRecord[];
  campaigns: AnyRecord[];
  health: AnyRecord | null;
  ephemeralStatus: AnyRecord | null;
};

type RunStatus = {
  running?: boolean;
  last_result?: AnyRecord | null;
};

type Selection = {
  tab: TabKey;
  item: AnyRecord | null;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "runs", label: "Runs" },
  { key: "topics", label: "Topics" },
  { key: "reviews", label: "Reviews" },
  { key: "campaigns", label: "Campaigns" }
];

const agents: Array<{ key: AgentKey; label: string; short: string; layer: string; defaultTab: TabKey }> = [
  { key: "agent1", label: "Research Desk", short: "A1", layer: "Signals", defaultTab: "topics" },
  { key: "agent2", label: "Content Studio", short: "A2", layer: "Reviews", defaultTab: "reviews" },
  { key: "agent3", label: "Distribution", short: "A3", layer: "Campaigns", defaultTab: "campaigns" },
  { key: "agent4", label: "Attribution", short: "A4", layer: "Events", defaultTab: "campaigns" },
  { key: "agent5", label: "Analysis", short: "A5", layer: "Quality", defaultTab: "runs" },
  { key: "agent6", label: "Experiments", short: "A6", layer: "Lab", defaultTab: "runs" },
  { key: "agent7", label: "Market Intel", short: "A7", layer: "Radar", defaultTab: "topics" },
  { key: "agent8", label: "Segments", short: "A8", layer: "Audience", defaultTab: "runs" }
];

export default function RadarPage() {
  const [activeAgent, setActiveAgent] = useState<AgentKey>("agent1");
  const [activeTab, setActiveTab] = useState<TabKey>("topics");
  const [state, setState] = useState<FetchState>({
    runs: [],
    topics: [],
    reviews: [],
    campaigns: [],
    health: null,
    ephemeralStatus: null
  });
  const [selection, setSelection] = useState<Selection>({ tab: "topics", item: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brief, setBrief] = useState("");
  const [runMessage, setRunMessage] = useState("");
  const [runningAgent, setRunningAgent] = useState<"agent1" | "agent2" | null>(null);

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const items = visibleItems(activeTab, activeAgent, state);
    setSelection((current) => {
      if (current.tab === activeTab && current.item && items.includes(current.item)) return current;
      return { tab: activeTab, item: items[0] || null };
    });
  }, [activeTab, activeAgent, state]);

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      const [health, runs, topics, reviews, campaigns] = await Promise.all([
        apiGetSafe("/api/system/health", {}),
        apiGetSafe("/api/runs?limit=60", { runs: [], ephemeral_status: null }),
        apiGetSafe("/api/topics?limit=60", { topics: [] }),
        apiGetSafe("/api/reviews?status=all&limit=60", { reviews: [] }),
        apiGetSafe("/api/campaigns?limit=60", { campaigns: [] })
      ]);
      setState({
        health,
        runs: asArray(runs.runs),
        topics: asArray(topics.topics),
        reviews: asArray(reviews.reviews),
        campaigns: asArray(campaigns.campaigns),
        ephemeralStatus: asRecord(runs.ephemeral_status)
      });
    } catch (exc) {
      setError(messageFromError(exc));
    } finally {
      setLoading(false);
    }
  }

  function chooseAgent(agent: AgentKey) {
    setActiveAgent(agent);
    const config = agents.find((item) => item.key === agent);
    if (config) setActiveTab(config.defaultTab);
  }

  async function triggerAgent(agent: "agent1" | "agent2", event: FormEvent) {
    event.preventDefault();
    setRunMessage("");
    setError("");
    setRunningAgent(agent);
    try {
      const path = agent === "agent1" ? "/api/agent1/run" : "/api/agent2/run";
      const payload = agent === "agent1" ? { brands: brief ? [brief] : null } : { brief, source: "auto" };
      const result = await apiPost(path, payload);
      setRunMessage(`${agent.toUpperCase()} ${String(result.status || "started")} - run_id ${String(result.run_id || "unknown")}`);
      await pollAgentStatus(agent);
      await refreshAll();
    } catch (exc) {
      setError(messageFromError(exc));
    } finally {
      setRunningAgent(null);
    }
  }

  async function pollAgentStatus(agent: "agent1" | "agent2") {
    const path = agent === "agent1" ? "/api/agent1/status" : "/api/agent2/status";
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const status = await apiGet(path) as RunStatus;
      const last = asRecord(status.last_result);
      const stateValue = String(last.status || (status.running ? "running" : "unknown"));
      const runId = String(last.run_id || "unknown");
      if (status.running) {
        setRunMessage(`${agent.toUpperCase()} running - run_id ${runId}`);
      } else if (stateValue === "completed") {
        setRunMessage(`${agent.toUpperCase()} completed - run_id ${runId}`);
        return;
      } else if (stateValue === "failed") {
        throw new Error(`${agent.toUpperCase()} failed: ${String(last.error || "Unknown error")}`);
      } else {
        setRunMessage(`${agent.toUpperCase()} ${stateValue} - run_id ${runId}`);
        return;
      }
      await delay(3000);
    }
    throw new Error(`${agent.toUpperCase()} is still running after 270 seconds. Check Runs/Status for the final result.`);
  }

  const activeAgentConfig = agents.find((agent) => agent.key === activeAgent) || agents[0];
  const listItems = visibleItems(activeTab, activeAgent, state);
  const counts = useMemo(() => ({
    runs: visibleItems("runs", activeAgent, state).length,
    topics: visibleItems("topics", activeAgent, state).length,
    reviews: visibleItems("reviews", activeAgent, state).length,
    campaigns: visibleItems("campaigns", activeAgent, state).length
  }), [activeAgent, state]);
  const stats = overviewStats(state);

  return (
    <main className="radar-shell">
      <AgentRail activeAgent={activeAgent} onSelect={chooseAgent} state={state} />

      <section className="radar-main">
        <header className="topbar">
          <div className="identity">
            <span className="logo-mark" />
            <div>
              <strong>GTM Intelligence Radar</strong>
              <span>{activeAgentConfig.short} / {activeAgentConfig.label}</span>
            </div>
          </div>
          <div className="mode-pills">
            <span>Viewer</span>
            <span>Read-only public radar</span>
          </div>
        </header>

        <section className="operator-panel">
          <div className="operator-title">
            <span>Operator Command</span>
            <strong>{activeAgentConfig.layer}</strong>
          </div>
          <form className="run-form">
            <input
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Market, product, channel, or Agent2 brief"
              aria-label="Run brief"
            />
            <button disabled={runningAgent !== null} onClick={(event) => triggerAgent("agent1", event)} type="submit">
              {runningAgent === "agent1" ? "Running Agent1" : "Run Agent1"}
            </button>
            <button disabled={runningAgent !== null} onClick={(event) => triggerAgent("agent2", event)} type="submit">
              {runningAgent === "agent2" ? "Running Agent2" : "Run Agent2"}
            </button>
          </form>
          <div className="health-strip">
            <HealthPill label="Supabase" value={booleanLabel(state.health?.supabase)} />
            <HealthPill label="LLM" value={booleanLabel(state.health?.llm)} />
            <HealthPill label="Provider" value={textValue(state.health?.llm_provider) || "unknown"} />
          </div>
        </section>

        {(error || runMessage) && (
          <section className={error ? "system-alert error" : "system-alert"}>
            {error || runMessage}
          </section>
        )}

        <section className="hero-card">
          <div>
            <div className="section-kicker">GTM Operating Layer</div>
            <h1>GTM Intelligence Radar.</h1>
            <p>
              Signals from social VOC, market research, content production, distribution readiness,
              attribution quality, experiments, and high-intent users are synthesized into one operating surface.
            </p>
          </div>
          <div className="hero-metrics">
            <Metric label="Signals" value={String(state.topics.length)} />
            <Metric label="Reviews" value={String(state.reviews.length)} />
            <Metric label="Pending" value={String(stats.pending)} />
            <Metric label="Packages" value={String(state.campaigns.length)} />
          </div>
        </section>

        <section className="radar-workspace">
          <aside className="master-pane">
            <nav className="tabs" aria-label="Radar lists">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={activeTab === tab.key ? "active" : ""}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span>{tab.label}</span>
                  <strong>{counts[tab.key]}</strong>
                </button>
              ))}
            </nav>
            <div className="list-header">
              <div>
                <span>{activeAgentConfig.label}</span>
                <strong>{loading ? "Loading" : `${listItems.length} ${activeTab}`}</strong>
              </div>
              <button className="ghost-button" onClick={refreshAll}>Refresh</button>
            </div>
            <div className="master-list">
              {listItems.length === 0 && !loading ? (
                <EmptyState tab={activeTab} agent={activeAgentConfig.label} />
              ) : (
                listItems.map((item, index) => (
                  <ListCard
                    key={String(item.id || item.content_id || item.agent_run_id || index)}
                    tab={activeTab}
                    item={item}
                    active={selection.item === item}
                    onClick={() => setSelection({ tab: activeTab, item })}
                  />
                ))
              )}
            </div>
          </aside>
          <DetailPanel selection={selection} activeAgent={activeAgentConfig} state={state} />
        </section>
      </section>
    </main>
  );
}

function AgentRail({ activeAgent, onSelect, state }: { activeAgent: AgentKey; onSelect: (agent: AgentKey) => void; state: FetchState }) {
  return (
    <aside className="agent-rail" aria-label="Agents">
      <div className="rail-orb">G</div>
      <nav>
        {agents.map((agent) => (
          <button
            key={agent.key}
            className={activeAgent === agent.key ? "active" : ""}
            onClick={() => onSelect(agent.key)}
            title={`${agent.short} ${agent.label}`}
          >
            <span>{agent.short}</span>
            <small>{agent.layer}</small>
            <em>{countForAgent(agent.key, state)}</em>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function ListCard({ tab, item, active, onClick }: { tab: TabKey; item: AnyRecord; active: boolean; onClick: () => void }) {
  const title = titleFor(tab, item);
  const meta = metaFor(tab, item);
  const status = statusFor(tab, item);
  return (
    <button className={`list-card ${active ? "active" : ""}`} onClick={onClick}>
      <div className="card-topline">
        <StatusBadge value={status} />
        <span>{timeValue(item.created_at || item.started_at || item.updated_at)}</span>
      </div>
      <h2>{title}</h2>
      <p>{meta}</p>
      {tab === "topics" && (
        <div className="evidence-row">
          <span>{sourceUrl(item) || "source missing"}</span>
          <strong>{textValue(item.heat_score || item.opportunity_score) || "no score"}</strong>
        </div>
      )}
    </button>
  );
}

function DetailPanel({ selection, activeAgent, state }: { selection: Selection; activeAgent: { label: string; layer: string }; state: FetchState }) {
  if (!selection.item) {
    return (
      <section className="detail-pane">
        <OverviewDetail activeAgent={activeAgent} state={state} />
      </section>
    );
  }
  return (
    <section className="detail-pane">
      {selection.tab === "runs" && <RunDetail item={selection.item} />}
      {selection.tab === "topics" && <TopicDetail item={selection.item} />}
      {selection.tab === "reviews" && <ReviewDetail item={selection.item} />}
      {selection.tab === "campaigns" && <CampaignDetail item={selection.item} />}
    </section>
  );
}

function OverviewDetail({ activeAgent, state }: { activeAgent: { label: string; layer: string }; state: FetchState }) {
  const stats = overviewStats(state);
  return (
    <article className="detail-card overview-detail">
      <DetailHeader label={activeAgent.layer} title={activeAgent.label} status="read-only" />
      <div className="signal-map">
        <div className="bubble one">Topics</div>
        <div className="bubble two">Reviews</div>
        <div className="bubble three">Campaigns</div>
        <div className="bubble four">Runs</div>
        <div className="map-label">Market / Product / Channel</div>
      </div>
      <div className="metric-grid">
        <Metric label="Failed runs" value={String(stats.failed)} />
        <Metric label="Pending review" value={String(stats.pending)} />
        <Metric label="Approved" value={String(stats.approved)} />
      </div>
      <FieldRow label="Operating mode" value="Read-only public view. Login is required to operate agents and write to Supabase." />
      <FieldRow label="Source policy" value="This UI only shows records returned by FastAPI/Supabase endpoints. Local output JSON files are not read." />
    </article>
  );
}

function TopicDetail({ item }: { item: AnyRecord }) {
  const brief = asRecord(item.content_brief);
  const rationale = asRecord(item.rationale);
  const evidence = evidenceItems(item);
  const llmUsed = item.llm_used ?? brief.llm_used ?? rationale.llm_used;
  return (
    <article className="detail-card">
      <DetailHeader label="Topic Opportunity" title={titleFor("topics", item)} status={statusFor("topics", item)} />
      <div className="metric-grid">
        <Metric label="Heat" value={textValue(item.heat_score)} />
        <Metric label="Opportunity" value={textValue(item.opportunity_score)} />
        <Metric label="Stage" value={textValue(item.intent_stage || item.stage)} />
      </div>
      <FieldRow label="Source URL" value={sourceUrl(item) || "Missing"} />
      <FieldRow label="Raw evidence" value={evidence.length ? "" : "Missing"} />
      {evidence.length > 0 && <JsonBlock value={evidence} />}
      <FieldRow label="why_now" value={whyNow(item)} />
      <FieldRow label="creator_insight" value={textValue(item.creator_insight || brief.creator_insight || rationale.creator_insight)} />
      <FieldRow label="audience_tension" value={textValue(item.audience_tension || brief.audience_tension || rationale.audience_tension)} />
      <FieldRow label="llm_used" value={llmUsed === undefined ? "Missing" : String(llmUsed)} />
      <FieldRow label="gate status" value={textValue(item.status || item.stage || "Missing")} />
      <JsonBlock title="content_brief" value={brief} />
      <JsonBlock title="rationale" value={rationale} />
    </article>
  );
}

function ReviewDetail({ item }: { item: AnyRecord }) {
  const payload = asRecord(item.structured_payload);
  return (
    <article className="detail-card">
      <DetailHeader label="Content Review" title={titleFor("reviews", item)} status={statusFor("reviews", item)} />
      <div className="metric-grid">
        <Metric label="Platform" value={textValue(item.platform)} />
        <Metric label="Score" value={textValue(item.score_overall)} />
        <Metric label="Run" value={textValue(item.agent_run_id)} />
      </div>
      <FieldRow label="Hook" value={textValue(item.hook || payload.hook)} />
      <FieldRow label="Caption" value={textValue(item.caption || payload.caption)} />
      <FieldRow label="Script" value={textValue(item.script || payload.script)} />
      <FieldRow label="Image prompt" value={textValue(item.image_prompt || item.recraft_prompt || payload.image_prompt)} />
      <FieldRow label="Video prompt" value={textValue(item.video_prompt || item.pixverse_prompt || payload.video_prompt)} />
      <FieldRow label="Negative prompt" value={textValue(item.negative_prompt || payload.negative_prompt)} />
      <JsonBlock title="structured_payload" value={payload} />
    </article>
  );
}

function RunDetail({ item }: { item: AnyRecord }) {
  const failed = String(item.status || "").toLowerCase() === "failed" || Boolean(item.error);
  return (
    <article className="detail-card">
      <DetailHeader label="Agent Run" title={titleFor("runs", item)} status={statusFor("runs", item)} />
      {failed && <div className="failure-box">Error: {textValue(item.error || "Run failed without an error message")}</div>}
      <div className="metric-grid">
        <Metric label="Agent" value={textValue(item.agent_name)} />
        <Metric label="Started" value={timeValue(item.started_at)} />
        <Metric label="Finished" value={timeValue(item.finished_at)} />
      </div>
      <JsonBlock title="input" value={asRecord(item.input)} />
      <JsonBlock title="output_summary" value={asRecord(item.output_summary)} />
    </article>
  );
}

function CampaignDetail({ item }: { item: AnyRecord }) {
  return (
    <article className="detail-card">
      <DetailHeader label="Campaign" title={titleFor("campaigns", item)} status={statusFor("campaigns", item)} />
      <div className="metric-grid">
        <Metric label="Platform" value={textValue(item.platform)} />
        <Metric label="State" value={textValue(item.state || item.status)} />
        <Metric label="Budget" value={textValue(item.budget_status)} />
      </div>
      <FieldRow label="Approval required" value={textValue(item.approval_required)} />
      <FieldRow label="Scheduled" value={timeValue(item.scheduled_at)} />
      <FieldRow label="Published" value={timeValue(item.published_at)} />
      <JsonBlock title="campaign payload" value={item} />
    </article>
  );
}

function DetailHeader({ label, title, status }: { label: string; title: string; status: string }) {
  return (
    <header className="detail-header">
      <div>
        <div className="section-kicker">{label}</div>
        <h2>{title}</h2>
      </div>
      <StatusBadge value={status} />
    </header>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="field-row">
      <span>{label}</span>
      <p>{value || "Missing"}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value || "Missing"}</strong>
    </div>
  );
}

function JsonBlock({ title, value }: { title?: string; value: unknown }) {
  return (
    <div className="json-block">
      {title && <span>{title}</span>}
      <pre>{JSON.stringify(value || {}, null, 2)}</pre>
    </div>
  );
}

function HealthPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="health-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized.includes("fail") || normalized.includes("error")
    ? "bad"
    : normalized.includes("approved") || normalized.includes("complete") || normalized.includes("ready")
      ? "good"
      : "neutral";
  return <span className={`status-badge ${tone}`}>{value || "unknown"}</span>;
}

function EmptyState({ tab, agent }: { tab: TabKey; agent: string }) {
  return (
    <div className="empty-state">
      <strong>No {tab} found</strong>
      <span>{agent} has no API-backed records in this view.</span>
    </div>
  );
}

async function apiGet(path: string): Promise<AnyRecord> {
  const response = await fetch(`${API_BASE}${path}`, { headers: apiHeaders(), cache: "no-store" });
  return readResponse(response);
}

async function apiGetSafe(path: string, fallback: AnyRecord): Promise<AnyRecord> {
  try {
    return await apiGet(path);
  } catch {
    return fallback;
  }
}

async function apiPost(path: string, payload: AnyRecord): Promise<AnyRecord> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { ...apiHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return readResponse(response);
}

async function readResponse(response: Response): Promise<AnyRecord> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const detail = data.detail || data.message || response.statusText;
    throw new Error(`${response.status} ${detail}`);
  }
  return data;
}

function apiHeaders(): Record<string, string> {
  return API_KEY ? { "x-api-key": API_KEY } : {};
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function visibleItems(tab: TabKey, agent: AgentKey, state: FetchState) {
  const items = state[tab];
  if (tab === "runs") {
    return items.filter((item) => !item.agent_name || String(item.agent_name).toLowerCase().replace(/[_\s-]/g, "").includes(agent));
  }
  if (agent === "agent1" && tab !== "topics") return [];
  if (agent === "agent2" && tab !== "reviews" && tab !== "topics") return [];
  if (agent === "agent3" && tab !== "campaigns" && tab !== "reviews") return [];
  if (agent === "agent7" && tab !== "topics") return [];
  if (agent === "agent4" || agent === "agent5" || agent === "agent6" || agent === "agent8") {
    return [];
  }
  return items;
}

function countForAgent(agent: AgentKey, state: FetchState) {
  if (agent === "agent1") return state.topics.length;
  if (agent === "agent2") return state.reviews.length;
  if (agent === "agent3") return state.campaigns.length;
  if (agent === "agent7") return state.topics.length;
  return state.runs.filter((item) => textValue(item.agent_name).toLowerCase().replace(/[_\s-]/g, "").includes(agent)).length;
}

function overviewStats(state: FetchState) {
  const failed = state.runs.filter((run) => String(run.status || "").toLowerCase() === "failed" || run.error).length;
  const pending = state.reviews.filter((review) => String(review.review_status || review.status || "").toLowerCase() === "pending").length;
  const approved = state.reviews.filter((review) => String(review.review_status || review.status || "").toLowerCase() === "approved").length;
  return { failed, pending, approved };
}

function titleFor(tab: TabKey, item: AnyRecord) {
  if (tab === "runs") return `${textValue(item.agent_name) || "agent"} / ${textValue(item.status) || "unknown"}`;
  if (tab === "topics") return textValue(item.topic_name || item.topic || "Untitled topic");
  if (tab === "reviews") return textValue(item.topic || item.hook || item.content_id || "Untitled review");
  return textValue(item.title || item.campaign_name || item.id || "Untitled campaign");
}

function metaFor(tab: TabKey, item: AnyRecord) {
  if (tab === "runs") return textValue(item.error || item.output_summary || item.input);
  if (tab === "topics") return textValue(item.why_hot || item.description || item.rationale);
  if (tab === "reviews") return textValue(item.platform || item.review_comment || item.caption);
  return textValue(item.platform || item.state || item.status);
}

function statusFor(tab: TabKey, item: AnyRecord) {
  if (tab === "topics") return textValue(item.status || item.stage || item.intent_stage || "unknown");
  if (tab === "reviews") return textValue(item.review_status || item.status || "unknown");
  if (tab === "campaigns") return textValue(item.state || item.status || "unknown");
  return textValue(item.status || "unknown");
}

function evidenceItems(item: AnyRecord) {
  const brief = asRecord(item.content_brief);
  const rationale = asRecord(item.rationale);
  const candidates = [
    item.raw_evidence,
    item.source_evidence,
    item.source_evidence_items,
    brief.raw_evidence,
    brief.source_evidence,
    rationale.raw_evidence,
    rationale.source_evidence,
    asRecord(rationale.agent1_topic).posts
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  }
  return [];
}

function sourceUrl(item: AnyRecord) {
  const brief = asRecord(item.content_brief);
  const rationale = asRecord(item.rationale);
  const evidence = evidenceItems(item);
  const firstEvidence = asRecord(evidence[0]);
  return textValue(
    item.source_url ||
    item.url ||
    brief.source_url ||
    rationale.source_url ||
    firstEvidence.url ||
    firstEvidence.source_url ||
    firstEvidence.permalink
  );
}

function whyNow(item: AnyRecord) {
  const brief = asRecord(item.content_brief);
  const rationale = asRecord(item.rationale);
  return textValue(item.why_now || item.why_hot || brief.why_now || brief.why_hot || rationale.why_now || rationale.why_hot);
}

function asArray(value: unknown): AnyRecord[] {
  return Array.isArray(value) ? value.filter((item): item is AnyRecord => typeof item === "object" && item !== null) : [];
}

function asRecord(value: unknown): AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as AnyRecord : {};
}

function textValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function booleanLabel(value: unknown): string {
  if (value === true) return "on";
  if (value === false) return "off";
  return "unknown";
}

function timeValue(value: unknown): string {
  if (!value) return "Missing";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function messageFromError(exc: unknown): string {
  return exc instanceof Error ? exc.message : String(exc);
}
