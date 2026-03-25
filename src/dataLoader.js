import Papa from "papaparse";
import { SHEET_CSV_URL, REVENUE_OVERRIDES } from "./config.js";

function num(v) {
  if (v === null || v === undefined || v === "") return null;
  let s = String(v).replace(/[£,\s\t]/g, "").trim();
  if (s === "" || s.toLowerCase() === "none" || s.toLowerCase() === "nan" || s.startsWith("check")) return null;
  // Handle percentage format: "53.03%" -> 0.5303
  const isPct = s.endsWith("%");
  if (isPct) s = s.slice(0, -1);
  const n = Number(s);
  if (isNaN(n)) return null;
  return isPct ? n / 100 : n;
}

function findCol(headers, ...candidates) {
  for (const c of candidates) {
    const l = c.toLowerCase().trim();
    const exact = headers.find(h => h.toLowerCase().trim() === l);
    if (exact) return exact;
  }
  for (const c of candidates) {
    const l = c.toLowerCase().trim();
    const partial = headers.find(h => h.toLowerCase().trim().includes(l));
    if (partial) return partial;
  }
  return null;
}

export async function fetchDashboardData() {
  const resp = await fetch(SHEET_CSV_URL);
  const text = await resp.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  const H = parsed.meta.fields || [];

  console.log("CSV headers:", H);

  const COL = {
    year: findCol(H, "YEAR"),
    project: findCol(H, "PROJECT"),
    margin: findCol(H, "MARGIN"),
    margin2122: findCol(H, "MARGIN 2021-2022", "MARGIN 2021-22"),
    budget: findCol(H, "FINAL BUDGET GBP", "FINAL BUDGET GBP "),
    freelance: findCol(H, "Freelance Spend"),
    creativeAlignment: findCol(H, "Creative Alignment Score"),
    creativeQuality: findCol(H, "Creative Quality Score"),
    executionFit: findCol(H, "Execution Fit Score"),
    creativeScore: findCol(H, "Creative Score"),
    commercialPerf: findCol(H, "Commercial Performance Score"),
    strategicValue: findCol(H, "Strategic Value Score"),
    budgetScore: findCol(H, "Budget Score"),
    commercialScore: findCol(H, "Commerical Score", "Commercial Score"),
    overallFD: findCol(H, "Overall FD Score"),
  };

  // Team Enjoyment has two columns in the sheet - we want the numeric score one
  // In CSV it might appear as duplicate headers or with a suffix
  const teMatches = H.filter(h => h.toLowerCase().includes("team enjoyment"));
  // The score column is the second occurrence, or the one with ".1"
  COL.teamEnjoyment = teMatches.length > 1 ? teMatches[1] : teMatches[0] || null;

  // Client column - 5th column (index 4) or one containing "client"/"agency"
  const clientByName = H.find(h => h.toLowerCase().includes("client") && !h.toLowerCase().includes("score"));
  COL.client = clientByName || H[4] || null;

  console.log("Column mapping:", COL);

  const projects = rows
    .map((r) => {
      const year = num(r[COL.year]);
      if (!year || year < 2015) return null;

      const marginRaw = num(r[COL.margin]);
      const margin2122 = COL.margin2122 ? num(r[COL.margin2122]) : null;
      const margin = (year === 2021 || year === 2022) && margin2122 !== null ? margin2122 : marginRaw;

      return {
        year,
        project: (r[COL.project] || "").replace(/\t/g, "").trim(),
        client: (r[COL.client] || "").replace(/\t/g, "").trim(),
        margin,
        budget: num(r[COL.budget]),
        freelanceSpend: num(r[COL.freelance]),
        teamEnjoyment: num(r[COL.teamEnjoyment]),
        creativeAlignment: num(r[COL.creativeAlignment]),
        creativeQuality: num(r[COL.creativeQuality]),
        executionFit: num(r[COL.executionFit]),
        creativeScore: num(r[COL.creativeScore]),
        commercialPerf: num(r[COL.commercialPerf]),
        strategicValue: num(r[COL.strategicValue]),
        budgetScore: num(r[COL.budgetScore]),
        commercialScore: num(r[COL.commercialScore]),
        overallFD: num(r[COL.overallFD]),
      };
    })
    .filter(Boolean);

  console.log(`Parsed ${projects.length} projects`);

  // Log a sample to verify data is coming through
  if (projects.length > 0) {
    const sample = projects[0];
    console.log("Sample project:", sample);
  }

  const activeYears = [...new Set(projects.map((p) => p.year))]
    .filter((y) => y >= 2021)
    .sort();

  const yearData = {};

  for (const yr of activeYears) {
    const yp = projects.filter((p) => p.year === yr);
    const n = yp.length;
    const scored = yp.filter((p) => p.creativeScore !== null);
    const withMargin = yp.filter((p) => p.margin !== null);

    const avg = (arr, key) => {
      const vals = arr.map((p) => p[key]).filter((v) => v !== null);
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    };

    const revenue = REVENUE_OVERRIDES[yr] || yp.reduce((s, p) => s + (p.budget || 0), 0);
    const avgMargin = avg(withMargin, "margin");
    const avgCreative = avg(scored, "creativeScore");
    const avgCommercial = avg(scored, "commercialScore");
    const highCreative = scored.filter((p) => p.creativeScore >= 3.5).length;
    const highCommercial = scored.filter((p) => p.commercialScore >= 3.5).length;
    const bothHigh = scored.filter((p) => p.creativeScore >= 3.5 && p.commercialScore >= 3.5).length;
    const negMargin = withMargin.filter((p) => p.margin < 0).length;

    const budgetWeighted = scored.filter((p) => p.budget > 0);
    const rwCreative = budgetWeighted.length > 0
      ? budgetWeighted.reduce((s, p) => s + p.creativeScore * p.budget, 0) /
        budgetWeighted.reduce((s, p) => s + p.budget, 0)
      : 0;

    const tiers = [
      { label: "<£25k", min: 0, max: 25000 },
      { label: "£25-75k", min: 25000, max: 75000 },
      { label: "£75-200k", min: 75000, max: 200000 },
      { label: "£200k+", min: 200000, max: Infinity },
    ].map((t) => {
      const tp = scored.filter((p) => p.budget > t.min && p.budget <= t.max);
      return {
        label: t.label,
        count: tp.length,
        avgCreative: avg(tp, "creativeScore"),
        avgMargin: avg(tp.filter((p) => p.margin !== null), "margin"),
      };
    });

    const topCreative = [...scored].sort((a, b) => b.creativeScore - a.creativeScore).slice(0, 3);
    const bestOverall = [...scored].filter((p) => p.overallFD !== null).sort((a, b) => b.overallFD - a.overallFD).slice(0, 3);
    const worstCommercial = [...scored].filter((p) => p.commercialScore !== null).sort((a, b) => a.commercialScore - b.commercialScore).slice(0, 3);

    yearData[yr] = {
      year: yr, n, revenue,
      revPerProject: Math.round(revenue / n),
      avgMargin: Math.round(avgMargin * 1000) / 10,
      avgCreative: Math.round(avgCreative * 100) / 100,
      avgCommercial: Math.round(avgCommercial * 100) / 100,
      teamEnjoyment: Math.round(avg(scored, "teamEnjoyment") * 100) / 100,
      creativeAlignment: Math.round(avg(scored, "creativeAlignment") * 100) / 100,
      creativeQuality: Math.round(avg(scored, "creativeQuality") * 100) / 100,
      executionFit: Math.round(avg(scored, "executionFit") * 100) / 100,
      highCreative: n > 0 ? Math.round((highCreative / n) * 100) : 0,
      highCommercial: n > 0 ? Math.round((highCommercial / n) * 100) : 0,
      bothHigh: n > 0 ? Math.round((bothHigh / n) * 100) : 0,
      negMargin: withMargin.length ? Math.round((negMargin / withMargin.length) * 100) : 0,
      rwCreative: Math.round(rwCreative * 100) / 100,
      tiers, topCreative, bestOverall, worstCommercial,
    };
  }

  return { activeYears, yearData };
}
