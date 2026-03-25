import { useState, useEffect } from "react";
import { fetchDashboardData } from "./dataLoader.js";
import { TrendChart, BreakdownChart, HighScoreChart, NegMarginChart, RevCreativeChart, BubbleChart } from "./Charts.jsx";

function fmt(n) {
  if (n >= 1000000) return "£" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "£" + Math.round(n / 1000) + "k";
  return "£" + n;
}

function LegendItem({ color, label, dashed }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
      <span style={{ width: dashed ? 16 : 8, height: dashed ? 2 : 8, borderRadius: dashed ? 0 : 2, background: dashed ? "transparent" : color, borderTop: dashed ? `2px dashed ${color}` : "none", display: "inline-block" }} />
      {label}
    </span>
  );
}

function SectionLabel({ children, color = "rgba(255,255,255,0.4)" }) {
  return <div style={{ fontSize: 12, fontWeight: 500, color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>{children}</div>;
}

function StatCard({ label, value, sub, accent, warn }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: accent ? "#5DCAA5" : warn ? "#E24B4A" : "#fff" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ProjectTable({ projects, accent }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}33` }}>
            {["Project", "Client", "Creative", "Comm.", "Margin", "Budget"].map(h => (
              <th key={h} style={{ padding: "6px 8px", textAlign: h === "Project" || h === "Client" ? "left" : "right", color: accent, fontWeight: 500, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((p, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "5px 8px", color: "#e0e0e0", fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.project}</td>
              <td style={{ padding: "5px 8px", color: "rgba(255,255,255,0.4)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.client}</td>
              <td style={{ padding: "5px 8px", textAlign: "right", color: p.creativeScore >= 3.5 ? "#AFA9EC" : "rgba(255,255,255,0.5)" }}>{p.creativeScore?.toFixed(1) ?? "—"}</td>
              <td style={{ padding: "5px 8px", textAlign: "right", color: p.commercialScore >= 3.5 ? "#5DCAA5" : "rgba(255,255,255,0.5)" }}>{p.commercialScore?.toFixed(1) ?? "—"}</td>
              <td style={{ padding: "5px 8px", textAlign: "right", color: p.margin > 0.2 ? "#5DCAA5" : p.margin > 0 ? "#EF9F27" : "#E24B4A" }}>{p.margin !== null ? (p.margin * 100).toFixed(0) + "%" : "—"}</td>
              <td style={{ padding: "5px 8px", textAlign: "right", color: "rgba(255,255,255,0.5)" }}>{p.budget ? fmt(p.budget) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ["Overview", "Score breakdown", "Budget tiers", "Year recaps"];

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const result = await fetchDashboardData();
      setData(result);
      setSelectedYear(result.activeYears[result.activeYears.length - 1]);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ background: "#0c0c1a", color: "#e0e0e0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, color: "#D85A30", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>Loading from Google Sheets...</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Fetching and processing project data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#0c0c1a", color: "#e0e0e0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 32 }}>
        <div style={{ maxWidth: 500, background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#E24B4A", marginBottom: 8 }}>Connection error</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 16px" }}>
            Couldn't fetch data from Google Sheets. Check that:
          </p>
          <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
            <li>You've pasted your CSV URL in <code style={{ color: "#D85A30" }}>src/config.js</code></li>
            <li>The sheet is published (File → Share → Publish to web)</li>
            <li>You selected CSV format when publishing</li>
          </ul>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>Error: {error}</div>
          <button onClick={loadData} style={{ marginTop: 16, background: "rgba(216,90,48,0.2)", border: "1px solid rgba(216,90,48,0.4)", color: "#D85A30", padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Retry</button>
        </div>
      </div>
    );
  }

  const { activeYears, yearData } = data;
  const yd = activeYears.map(yr => yearData[yr]);

  return (
    <div style={{ background: "#0c0c1a", color: "#e0e0e0", minHeight: "100vh", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#D85A30", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>FutureDeluxe · {activeYears[0]}–{activeYears[activeYears.length - 1]}</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>Creative vs commercial analysis</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Live from Google Sheets · {activeYears.length} years · {yd.reduce((s, d) => s + d.n, 0)} projects</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button onClick={loadData} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>↻ Refresh</button>
            {lastUpdated && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>Updated {lastUpdated.toLocaleTimeString()}</div>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} style={{ background: "none", border: "none", borderBottom: tab === i ? "2px solid #D85A30" : "2px solid transparent", color: tab === i ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 500, padding: "8px 16px", cursor: "pointer", fontFamily: "inherit" }}>{t}</button>
          ))}
        </div>

        {tab === 0 && <OverviewTab years={activeYears} data={yd} />}
        {tab === 1 && <BreakdownTab years={activeYears} data={yd} />}
        {tab === 2 && <TierTab years={activeYears} data={yd} />}
        {tab === 3 && <RecapTab years={activeYears} data={yd} yearData={yearData} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />}
      </div>
    </div>
  );
}

function OverviewTab({ years, data }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))`, gap: 10, marginBottom: "2rem" }}>
        {years.map((yr, i) => {
          const d = data[i];
          const prev = i > 0 ? data[i - 1] : null;
          const growth = prev ? ((d.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) : null;
          return (
            <div key={yr} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" }}>{yr}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "4px 0 2px" }}>{fmt(d.revenue)}</div>
              <div style={{ fontSize: 11, color: growth > 0 ? "#5DCAA5" : growth < 0 ? "#E24B4A" : "rgba(255,255,255,0.3)" }}>
                {growth !== null ? `${growth > 0 ? "+" : ""}${growth}%` : `${d.n} projects`}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{d.n} proj · {fmt(d.revPerProject)} avg</div>
            </div>
          );
        })}
      </div>

      <SectionLabel>Creative vs commercial scores and margin</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
        <LegendItem color="#7F77DD" label="Creative score" />
        <LegendItem color="#1D9E75" label="Commercial score" />
        <LegendItem color="#D85A30" label="Margin %" dashed />
      </div>
      <TrendChart years={years} data={data} />

      <div style={{ height: 32 }} />
      <SectionLabel>% of projects hitting high scores (≥3.5)</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <LegendItem color="#7F77DD" label="High creative" />
        <LegendItem color="#1D9E75" label="High commercial" />
        <LegendItem color="#D4537E" label="Both high" />
      </div>
      <HighScoreChart years={years} data={data} />

      <div style={{ height: 32 }} />
      <SectionLabel>Negative margin rate vs revenue</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <LegendItem color="#E24B4A" label="% negative margin" />
        <LegendItem color="#1D9E75" label="Revenue (£M)" />
      </div>
      <NegMarginChart years={years} data={data} />

      <div style={{ height: 32 }} />
      <div style={{ background: "rgba(216,90,48,0.08)", border: "1px solid rgba(216,90,48,0.2)", borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#D85A30", marginBottom: 8 }}>Key findings</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
          <p style={{ margin: 0 }}><span style={{ color: "#AFA9EC", fontWeight: 500 }}>Creative scores have declined</span> — average creative score has dropped from {data[0]?.avgCreative.toFixed(2)} ({years[0]}) to {data[data.length - 1]?.avgCreative.toFixed(2)} ({years[years.length - 1]}), bottoming out at {Math.min(...data.map(d => d.avgCreative)).toFixed(2)} in {years[data.indexOf(data.reduce((a, b) => a.avgCreative < b.avgCreative ? a : b))]}. The drop is driven by Creative Alignment and Creative Quality. Execution Fit has remained consistently strong (~3.8+), meaning the team delivers well — the issue is the ambition of the briefs coming through the door.</p>
          <p style={{ margin: 0 }}><span style={{ color: "#EF9F27", fontWeight: 500 }}>Margin tells a story of recovery</span> — from {data[0]?.avgMargin.toFixed(1)}% ({years[0]}) through a low of {Math.min(...data.map(d => d.avgMargin)).toFixed(1)}% in {years[data.indexOf(data.reduce((a, b) => a.avgMargin < b.avgMargin ? a : b))]}, recovering to {data[data.length - 1]?.avgMargin.toFixed(1)}% in {years[years.length - 1]}. {(() => { const best = data.reduce((a, b) => a.avgMargin > b.avgMargin ? a : b); return `${years[data.indexOf(best)]} was the strongest margin year at ${best.avgMargin.toFixed(1)}%.`; })()} Loss-making projects peaked at {Math.max(...data.map(d => d.negMargin))}% and have since been brought under control at {data[data.length - 1]?.negMargin}%.</p>
          <p style={{ margin: 0 }}><span style={{ color: "#D4537E", fontWeight: 500 }}>The creative–commercial overlap is shrinking</span> — projects hitting both high creative (≥3.5) and high commercial (≥3.5) scores has dropped from {data[0]?.bothHigh}% ({years[0]}) to just {data[data.length - 1]?.bothHigh}% ({years[years.length - 1]}). Work is increasingly either creatively strong or commercially strong, rarely both. Closing this gap should be the central strategic priority.</p>
          <p style={{ margin: 0 }}><span style={{ color: "#5DCAA5", fontWeight: 500 }}>Larger projects are the sweet spot</span> — £200k+ projects consistently deliver both higher creative scores and better margins than smaller work. Revenue per project has grown from {fmt(data[0]?.revPerProject)} to {fmt(data[data.length - 1]?.revPerProject)}, showing the business is landing bigger briefs. The next step is ensuring those larger briefs are also the most creatively ambitious.</p>
          <p style={{ margin: 0 }}><span style={{ color: "#CECBF6", fontWeight: 500 }}>Freelance reliance varies significantly</span> — freelance spend as a percentage of budget has ranged from {Math.min(...data.map(d => d.flPctOfBudget)).toFixed(1)}% to {Math.max(...data.map(d => d.flPctOfBudget)).toFixed(1)}% across the period. {(() => { const highest = data.reduce((a, b) => a.flPctOfBudget > b.flPctOfBudget ? a : b); return `${years[data.indexOf(highest)]} had the highest freelance ratio at ${highest.flPctOfBudget.toFixed(1)}% of total budget (£${(highest.flTotal / 1000000).toFixed(1)}M).`; })()} Understanding how freelance spend impacts margin and creative output at a project level is key to optimising the resourcing mix.</p>
          <p style={{ margin: 0 }}><span style={{ color: "#D85A30", fontWeight: 500 }}>FuturePlay time is well below target</span> — against a goal of 2 days per month (24 days/year) per artist, actual FuturePlay time has never hit target. It peaked at 18 days in 2024, but dropped to just 10.3 days in 2025 (43% of target). Protecting this creative investment time is essential for maintaining the team's creative edge and growth.</p>
        </div>
      </div>
    </div>
  );
}

function BreakdownTab({ years, data }) {
  return (
    <div>
      <SectionLabel>Creative score breakdown — where the drop is</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
        <LegendItem color="#CECBF6" label="Team enjoyment" />
        <LegendItem color="#7F77DD" label="Creative alignment" />
        <LegendItem color="#534AB7" label="Creative quality" />
        <LegendItem color="#26215C" label="Execution fit" />
      </div>
      <BreakdownChart years={years} data={data} />

      <div style={{ height: 32 }} />
      <SectionLabel>Revenue per project vs revenue-weighted creative</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <LegendItem color="#1D9E75" label="Rev/project (£k)" />
        <LegendItem color="#7F77DD" label="Rev-weighted creative" />
      </div>
      <RevCreativeChart years={years} data={data} />

      <div style={{ height: 24 }} />
      <div style={{ background: "rgba(127,119,221,0.06)", border: "1px solid rgba(127,119,221,0.15)", borderRadius: 10, padding: "16px 20px" }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>
          Revenue per project has moved from {fmt(data[0]?.revPerProject)} to {fmt(data[data.length - 1]?.revPerProject)}, but rev-weighted creative has declined from {data[0]?.rwCreative.toFixed(2)} to {data[data.length - 1]?.rwCreative.toFixed(2)}. The biggest projects are pulling the creative average down.
        </p>
      </div>
    </div>
  );
}

function TierTab({ years, data }) {
  const tierLabels = ["<£25k", "£25–75k", "£75–200k", "£200k+"];
  const tierColors = ["#D85A30", "#EF9F27", "#7F77DD", "#1D9E75"];

  return (
    <div>
      <SectionLabel>Budget tier performance — creative score vs margin</SectionLabel>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {tierLabels.map((l, i) => <LegendItem key={l} color={tierColors[i]} label={l} />)}
      </div>
      <BubbleChart years={years} data={data} />

      <div style={{ height: 24 }} />
      <SectionLabel>Tier detail by year</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "2rem" }}>
        {tierLabels.map((tier, ti) => (
          <div key={tier} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "14px 18px", borderLeft: `3px solid ${tierColors[ti]}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: tierColors[ti], marginBottom: 10 }}>{tier}</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))`, gap: 8 }}>
              {years.map((yr, yi) => {
                const t = data[yi].tiers[ti];
                return (
                  <div key={yr} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{yr}</div>
                    <div>n={t.count}</div>
                    <div style={{ color: "#AFA9EC" }}>creative: {t.avgCreative.toFixed(2)}</div>
                    <div style={{ color: t.avgMargin > 0.2 ? "#5DCAA5" : t.avgMargin > 0 ? "#EF9F27" : "#E24B4A" }}>margin: {(t.avgMargin * 100).toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(29,158,117,0.06)", border: "1px solid rgba(29,158,117,0.15)", borderRadius: 10, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1D9E75", marginBottom: 6 }}>Strategic takeaway</div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>
          £200k+ projects consistently sit in the upper-right quadrant — higher creative AND better margins. Low-budget high-creative projects are not viable as a category. Cap at 2–3/year as creative investment and focus on landing larger briefs.
        </p>
      </div>
    </div>
  );
}

function RecapTab({ years, data, yearData, selectedYear, setSelectedYear }) {
  const yr = selectedYear || years[years.length - 1];
  const d = yearData[yr];
  if (!d) return null;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {years.map(y => (
          <button key={y} onClick={() => setSelectedYear(y)} style={{ background: yr === y ? "rgba(216,90,48,0.15)" : "rgba(255,255,255,0.03)", border: yr === y ? "1px solid rgba(216,90,48,0.4)" : "1px solid rgba(255,255,255,0.06)", color: yr === y ? "#D85A30" : "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 600, padding: "8px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>{y}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        <StatCard label="Revenue" value={fmt(d.revenue)} sub={`${d.n} projects`} />
        <StatCard label="Avg margin" value={`${d.avgMargin.toFixed(1)}%`} sub={`${d.negMargin}% negative`} accent={d.avgMargin > 25} />
        <StatCard label="Rev/project" value={fmt(d.revPerProject)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        <StatCard label="Avg creative" value={d.avgCreative.toFixed(2)} sub={`${d.highCreative}% high`} />
        <StatCard label="Avg commercial" value={d.avgCommercial.toFixed(2)} sub={`${d.highCommercial}% high`} />
        <StatCard label="Both high" value={`${d.bothHigh}%`} accent={d.bothHigh >= 15} warn={d.bothHigh < 10} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: "1.5rem" }}>
        <StatCard label="Freelance spend" value={fmt(d.flTotal)} sub={`${d.flProjects} projects used FL`} />
        <StatCard label="FL % of budget" value={`${d.flPctOfBudget.toFixed(1)}%`} warn={d.flPctOfBudget > 25} />
        <StatCard label="Execution fit" value={d.executionFit.toFixed(2)} sub="Delivery consistency" accent={d.executionFit >= 3.8} />
      </div>

      <SectionLabel color="#AFA9EC">Top creative</SectionLabel>
      <ProjectTable projects={d.topCreative} accent="#AFA9EC" />
      <div style={{ height: 16 }} />
      <SectionLabel color="#5DCAA5">Best overall</SectionLabel>
      <ProjectTable projects={d.bestOverall} accent="#5DCAA5" />
      <div style={{ height: 16 }} />
      <SectionLabel color="#E24B4A">Worst commercial</SectionLabel>
      <ProjectTable projects={d.worstCommercial} accent="#E24B4A" />
    </div>
  );
}
