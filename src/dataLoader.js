import Papa from "papaparse";
import { SHEET_CSV_URL, REVENUE_OVERRIDES } from "./config.js";

function num(v) {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).replace(/[£,\s\t]/g, "").trim();
  if (s === "" || s === "none" || s === "nan" || s === "NaN") return null;
  const n = Number(s);
  return isNaN(n) ? null : n;
}

export async function fetchDashboardData() {
  const resp = await fetch(SHEET_CSV_URL);
  const text = await resp.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  const projects = rows
    .map((r) => {
      const year = num(r["YEAR"]);
      if (!year || year < 2015) return null;

      const marginRaw = num(r["MARGIN"]);
      const margin2122 = num(r["MARGIN 2021-2022"]);
      const margin =
        (year === 2021 || year === 2022) && margin2122 !== null
          ? margin2122
          : marginRaw;

      return {
        year,
        code: r["PROJECT CODE"] || "",
        client: (r["Unnamed: 4"] || "").trim(),
        project: (r["PROJECT"] || "").trim(),
        margin,
        budget: num(r["FINAL BUDGET GBP "]) || num(r["FINAL BUDGET GBP"]),
        freelanceSpend: num(r["Freelance Spend"]),
        teamEnjoyment: num(r["Team Enjoyment.1"]),
        creativeAlignment: num(r["Creative Alignment Score"]),
        creativeQuality: num(r["Creative Quality Score"]),
        executionFit: num(r["Execution Fit Score"]),
        creativeScore: num(r["Creative Score"]),
        commercialPerf: num(r["Commercial Performance Score"]),
        strategicValue: num(r["Strategic Value Score"]),
        budgetScore: num(r["Budget Score"]),
        commercialScore: num(r["Commerical Score"]),
        overallFD: num(r["Overall FD Score"]),
      };
    })
    .filter(Boolean);

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
    const rwCreative =
      budgetWeighted.length > 0
        ? budgetWeighted.reduce((s, p) => s + p.creativeScore * p.budget, 0) /
          budgetWeighted.reduce((s, p) => s + p.budget, 0)
        : 0;

    const tiers = [
      { label: "<£25k", min: 0, max: 25000 },
      { label: "£25–75k", min: 25000, max: 75000 },
      { label: "£75–200k", min: 75000, max: 200000 },
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
      year: yr,
      n,
      revenue,
      revPerProject: Math.round(revenue / n),
      avgMargin: Math.round(avgMargin * 1000) / 10,
      avgCreative: Math.round(avgCreative * 100) / 100,
      avgCommercial: Math.round(avgCommercial * 100) / 100,
      teamEnjoyment: Math.round(avg(scored, "teamEnjoyment") * 100) / 100,
      creativeAlignment: Math.round(avg(scored, "creativeAlignment") * 100) / 100,
      creativeQuality: Math.round(avg(scored, "creativeQuality") * 100) / 100,
      executionFit: Math.round(avg(scored, "executionFit") * 100) / 100,
      highCreative: Math.round((highCreative / n) * 100),
      highCommercial: Math.round((highCommercial / n) * 100),
      bothHigh: Math.round((bothHigh / n) * 100),
      negMargin: withMargin.length ? Math.round((negMargin / withMargin.length) * 100) : 0,
      rwCreative: Math.round(rwCreative * 100) / 100,
      tiers,
      topCreative,
      bestOverall,
      worstCommercial,
    };
  }

  return { activeYears, yearData };
}
