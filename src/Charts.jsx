import { useEffect, useRef, useCallback } from "react";
import {
  Chart, LineController, BarController, BubbleController,
  LineElement, BarElement, PointElement,
  CategoryScale, LinearScale,
  Tooltip, Filler,
} from "chart.js";

Chart.register(
  LineController, BarController, BubbleController,
  LineElement, BarElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Filler
);

const grid = "rgba(255,255,255,0.07)";
const tick = "rgba(255,255,255,0.4)";
const tf = { size: 11, family: "'DM Sans', sans-serif" };

function useChart(buildConfig, deps) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const build = useCallback(buildConfig, deps);
  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, build());
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [build]);
  return canvasRef;
}

export function TrendChart({ years, data }) {
  const ref = useChart(() => ({
    type: "line",
    data: {
      labels: years.map(String),
      datasets: [
        { label: "Creative", data: data.map(d => d.avgCreative), borderColor: "#7F77DD", backgroundColor: "rgba(127,119,221,0.08)", fill: true, tension: 0.35, pointRadius: 6, pointBackgroundColor: "#7F77DD", borderWidth: 2.5, yAxisID: "y" },
        { label: "Commercial", data: data.map(d => d.avgCommercial), borderColor: "#1D9E75", backgroundColor: "rgba(29,158,117,0.08)", fill: true, tension: 0.35, pointRadius: 6, pointBackgroundColor: "#1D9E75", borderWidth: 2.5, yAxisID: "y" },
        { label: "Margin", data: data.map(d => d.avgMargin), borderColor: "#D85A30", backgroundColor: "transparent", borderDash: [6, 4], tension: 0.35, pointRadius: 6, pointBackgroundColor: "#D85A30", borderWidth: 2, yAxisID: "y1" },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.datasetIndex === 2 ? "Margin: " + ctx.raw.toFixed(1) + "%" : ctx.dataset.label + ": " + ctx.raw.toFixed(2) } } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: tick, font: tf } },
        y: { min: 2.2, max: 3.8, grid: { color: grid }, ticks: { color: tick, font: tf }, title: { display: true, text: "Score", color: tick, font: tf } },
        y1: { position: "right", min: 0, max: 45, grid: { display: false }, ticks: { color: "#D85A30", font: tf, callback: v => v + "%" }, title: { display: true, text: "Margin", color: "#D85A30", font: tf } },
      },
    },
  }), [years, data]);
  return <div style={{ position: "relative", width: "100%", height: 300 }}><canvas ref={ref} /></div>;
}

export function BreakdownChart({ years, data }) {
  const ref = useChart(() => ({
    type: "bar",
    data: {
      labels: years.map(String),
      datasets: [
        { label: "Team enjoyment", data: data.map(d => d.teamEnjoyment), backgroundColor: "rgba(206,203,246,0.75)", borderRadius: 3 },
        { label: "Creative alignment", data: data.map(d => d.creativeAlignment), backgroundColor: "rgba(127,119,221,0.75)", borderRadius: 3 },
        { label: "Creative quality", data: data.map(d => d.creativeQuality), backgroundColor: "rgba(83,52,183,0.85)", borderRadius: 3 },
        { label: "Execution fit", data: data.map(d => d.executionFit), backgroundColor: "rgba(38,33,92,0.95)", borderRadius: 3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: tick, font: tf } },
        y: { min: 2.0, max: 4.2, grid: { color: grid }, ticks: { color: tick, font: tf } },
      },
    },
  }), [years, data]);
  return <div style={{ position: "relative", width: "100%", height: 320 }}><canvas ref={ref} /></div>;
}

export function HighScoreChart({ years, data }) {
  const ref = useChart(() => ({
    type: "bar",
    data: {
      labels: years.map(String),
      datasets: [
        { label: "High creative", data: data.map(d => d.highCreative), backgroundColor: "rgba(127,119,221,0.7)", borderRadius: 3 },
        { label: "High commercial", data: data.map(d => d.highCommercial), backgroundColor: "rgba(29,158,117,0.7)", borderRadius: 3 },
        { label: "Both high", data: data.map(d => d.bothHigh), backgroundColor: "rgba(212,83,126,0.7)", borderRadius: 3 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: tick, font: tf } },
        y: { min: 0, max: 70, grid: { color: grid }, ticks: { color: tick, font: tf, callback: v => v + "%" } },
      },
    },
  }), [years, data]);
  return <div style={{ position: "relative", width: "100%", height: 300 }}><canvas ref={ref} /></div>;
}

export function NegMarginChart({ years, data }) {
  const ref = useChart(() => ({
    type: "bar",
    data: {
      labels: years.map(String),
      datasets: [
        { label: "% negative", data: data.map(d => d.negMargin), backgroundColor: data.map(d => d.negMargin > 20 ? "rgba(226,75,74,0.7)" : d.negMargin > 10 ? "rgba(226,75,74,0.45)" : "rgba(226,75,74,0.25)"), borderColor: "#E24B4A", borderWidth: 1.5, borderRadius: 3 },
        { label: "Revenue", data: data.map(d => d.revenue / 1000000), type: "line", borderColor: "#1D9E75", pointBackgroundColor: "#1D9E75", pointRadius: 5, borderWidth: 2.5, tension: 0.3, yAxisID: "y1" },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: tick, font: tf } },
        y: { min: 0, max: 35, grid: { color: grid }, ticks: { color: "#E24B4A", font: tf, callback: v => v + "%" }, title: { display: true, text: "% negative margin", color: "#E24B4A", font: tf } },
        y1: { position: "right", grid: { display: false }, ticks: { color: "#1D9E75", font: tf, callback: v => "£" + v.toFixed(0) + "M" }, title: { display: true, text: "Revenue", color: "#1D9E75", font: tf } },
      },
    },
  }), [years, data]);
  return <div style={{ position: "relative", width: "100%", height: 260 }}><canvas ref={ref} /></div>;
}

export function RevCreativeChart({ years, data }) {
  const ref = useChart(() => ({
    type: "bar",
    data: {
      labels: years.map(String),
      datasets: [
        { label: "Rev/project (£k)", data: data.map(d => d.revPerProject / 1000), backgroundColor: "rgba(29,158,117,0.6)", borderColor: "#1D9E75", borderWidth: 1.5, borderRadius: 3, yAxisID: "y" },
        { label: "Rev-weighted creative", data: data.map(d => d.rwCreative), type: "line", borderColor: "#7F77DD", pointBackgroundColor: "#7F77DD", pointRadius: 6, borderWidth: 2.5, tension: 0.3, yAxisID: "y1" },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: grid }, ticks: { color: tick, font: tf } },
        y: { grid: { color: grid }, ticks: { color: "#1D9E75", font: tf, callback: v => "£" + v.toFixed(0) + "k" }, title: { display: true, text: "Revenue per project", color: "#1D9E75", font: tf } },
        y1: { position: "right", min: 2.5, max: 3.8, grid: { display: false }, ticks: { color: "#7F77DD", font: tf }, title: { display: true, text: "Rev-weighted creative", color: "#7F77DD", font: tf } },
      },
    },
  }), [years, data]);
  return <div style={{ position: "relative", width: "100%", height: 280 }}><canvas ref={ref} /></div>;
}

export function BubbleChart({ years, data }) {
  const colors = ["#D85A30", "#EF9F27", "#7F77DD", "#1D9E75"];
  const tierLabels = ["<£25k", "£25–75k", "£75–200k", "£200k+"];
  const datasets = tierLabels.map((label, ti) => ({
    label,
    backgroundColor: colors[ti] + "88",
    borderColor: colors[ti],
    borderWidth: 1.5,
    data: years.map((yr, yi) => {
      const t = data[yi].tiers[ti];
      return { x: t.avgCreative, y: t.avgMargin * 100, r: Math.max(5, Math.sqrt(t.count) * 3.5) };
    }),
  }));
  const ref = useChart(() => ({
    type: "bubble",
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      layout: { padding: 20 },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${tierLabels[ctx.datasetIndex]} (${years[ctx.dataIndex]}) — Creative: ${ctx.raw.x.toFixed(2)}, Margin: ${ctx.raw.y.toFixed(1)}%` } },
      },
      scales: {
        x: { min: 1.8, max: 4.0, grid: { color: grid }, ticks: { color: tick, font: tf }, title: { display: true, text: "Avg creative score", color: tick, font: tf } },
        y: { min: -25, max: 80, grid: { color: grid }, ticks: { color: tick, font: tf, callback: v => v + "%" }, title: { display: true, text: "Avg margin", color: tick, font: tf } },
      },
    },
  }), [years, data]);
  return <div style={{ position: "relative", width: "100%", height: 340 }}><canvas ref={ref} /></div>;
}
