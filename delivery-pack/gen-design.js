const fs = require("fs");
const path = require("path");
const D = require("./data");
const c = D.counts;

const OUT = path.join(__dirname, "design", "project");
fs.mkdirSync(OUT, { recursive: true });

const FONT = `<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">`;
const C = { teal: "#04768D", light: "#64C2D3", soft: "#E4F4F7", navy: "#1E2B4A", canvas: "#F3F6F8", good: "#15803D", bad: "#DC2626", mut: "#5B6577", line: "#E2E6EE", gold: "#B8912F", goldSoft: "#FBF3DD" };
const GRAD = `linear-gradient(150deg, ${C.teal} 0%, ${C.teal} 38%, ${C.light} 135%)`;

function page({ title, w, h, body, css = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
${FONT}
<style>
body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;color:${C.navy};background:${C.canvas}}
a{color:inherit;text-decoration:none}
button{font-family:inherit}
${css}
</style>
</helmet>
${body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":${w},"height":${h}}}'>
class Component extends DCLogic {
renderVals() { return {}; }
}
</script>
</body>
</html>
`;
}

const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const card = (inner, extra = "") => `<div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(30,43,74,.08);${extra}">${inner}</div>`;
const row = (k, v, o = {}) => `<div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:14px"><span style="color:${C.mut}">${e(k)}</span><span style="text-align:right;font-weight:${o.strong ? 800 : 600};color:${o.color || C.navy}">${e(v)}</span></div>`;
const hr = `<div style="height:1px;background:${C.line}"></div>`;
const pill = (t, bg, fg) => `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${bg};color:${fg}">${e(t)}</span>`;
const btn = (t, href, kind = "primary") => {
  const st = { primary: `background:${C.teal};color:#fff`, secondary: `background:#fff;color:${C.teal};border:1px solid rgba(4,118,141,.3)`, gold: `background:${C.gold};color:#fff` }[kind];
  return `<a href="${href}" style="display:block;text-align:center;padding:15px 16px;border-radius:16px;font-size:15px;font-weight:800;${st}">${e(t)}</a>`;
};
const topbar = (title, back) => `<div style="display:flex;align-items:center;gap:8px;background:#fff;padding:14px 16px;box-shadow:0 1px 3px rgba(30,43,74,.08)">${back ? `<a href="${back}" aria-label="Back" style="width:36px;height:36px;border-radius:50%;background:${C.canvas};display:flex;align-items:center;justify-content:center;font-size:20px">‹</a>` : `<span style="width:36px"></span>`}<div style="flex-grow:1;text-align:center;font-size:17px;font-weight:800">${e(title)}</div><span style="width:36px"></span></div>`;
const tabs = (active) => {
  const t = [["Gold", "F04-Dashboard.dc.html"], ["Portfolio", "F08-Portfolio.dc.html"], ["Activity", "F10-Transactions.dc.html"], ["Home", "F01-Home.dc.html"]];
  return `<div style="display:flex;background:#fff;border-top:1px solid ${C.line};padding:8px 0 14px">${t.map(([n, h]) => `<a href="${h}" style="flex-grow:1;text-align:center;font-size:12px;font-weight:700;color:${n === active ? C.teal : "#9AA3B2"}">${n}</a>`).join("")}</div>`;
};
const shell = (top, main, bottom = "") => `<div style="width:390px;height:844px;box-sizing:border-box;display:flex;flex-direction:column;background:${C.canvas};overflow:hidden">${top}<div style="flex-grow:1;overflow:hidden;padding:16px;display:flex;flex-direction:column;gap:12px">${main}</div>${bottom}</div>`;
const hero = (inner) => `<div style="background:${GRAD};border-radius:24px;padding:20px;color:#fff">${inner}</div>`;

const files = {}; // name -> html

// ---------- F01 Home ----------
files["F01-Home.dc.html"] = page({ title: "Aman Home", w: 390, h: 844, body: shell(
  `<div style="display:flex;justify-content:center;background:#fff;padding:16px"><span style="font-size:26px;font-weight:800;color:${C.teal};letter-spacing:-1px">aman</span></div>`,
  `<div style="background:${GRAD};border-radius:16px;padding:16px;color:#fff;height:80px;box-sizing:content-box"><div style="font-size:12px;opacity:.85">Installments on all products</div><div style="font-size:22px;font-weight:800">0% interest</div><div style="font-size:12px;opacity:.85">up to 6 months</div></div>
   <a href="F02-Landing.dc.html" style="display:flex;align-items:center;gap:12px;background:${C.goldSoft};border-radius:16px;padding:12px;border:1px solid rgba(184,145,47,.3)"><div style="width:44px;height:44px;border-radius:12px;background:${C.gold};color:#fff;font-weight:800;font-size:20px;display:flex;align-items:center;justify-content:center">Au</div><div style="flex-grow:1"><div style="font-size:15px;font-weight:800">Invest in Gold ${pill("DEMO", "#fff", C.gold)}</div><div style="font-size:12px;color:${C.mut}">Start investing in gold from 0.1 g (about EGP 726)</div></div><div style="text-align:right"><div style="font-size:13px;font-weight:800">EGP 7,223</div><div style="font-size:10px;color:${C.mut}">per gram</div></div></a>
   <div style="font-size:15px;font-weight:800;margin-top:4px">Aman services</div>
   <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">
     <a href="F02-Landing.dc.html" style="grid-column:span 2;display:flex;align-items:center;gap:12px;background:#fff;border-radius:16px;padding:12px;box-shadow:0 0 0 2px rgba(184,145,47,.4)"><div style="width:48px;height:48px;border-radius:12px;background:${C.goldSoft};color:${C.gold};font-weight:800;display:flex;align-items:center;justify-content:center">Au</div><div style="flex-grow:1"><div style="font-size:14px;font-weight:800">Aman Gold</div><div style="font-size:11px;color:${C.mut}">Buy and sell digital gold</div></div>${pill("NEW", C.gold, "#fff")}</a>
     ${["Bill payments", "Aman installments", "Aman store", "Project financing"].map((t) => card(`<div style="font-size:13px;font-weight:700;height:36px;display:flex;align-items:center">${t}</div>`, "padding:12px")).join("")}
   </div>
   <div style="font-size:15px;font-weight:800;margin-top:4px">Pay now</div>
   ${card(`<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;text-align:center;font-size:11px">${["Mobile", "Landline", "Electricity", "Water", "Gas", "Education", "Utilities", "Games"].map((t) => `<div><div style="width:40px;height:40px;border-radius:50%;background:${C.soft};margin:0 auto 4px"></div>${t}</div>`).join("")}</div>`)}`,
  `<div style="display:flex;background:#fff;border-top:1px solid ${C.line};padding:10px 0 16px;font-size:11px;font-weight:700;color:#9AA3B2">${["Offers", "Balance", "Home", "Cart", "List"].map((t, i) => `<div style="flex-grow:1;text-align:center;${i === 2 ? `color:${C.teal}` : ""}">${t}</div>`).join("")}</div>`) });

// ---------- F02 Landing ----------
const spark = (() => { const pts = [40, 36, 42, 30, 34, 28, 33, 24, 30, 20, 26, 14, 18, 8]; return pts.map((y, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * 300 + 4},${y + 6}`).join(" "); })();
files["F02-Landing.dc.html"] = page({ title: "Gold landing", w: 390, h: 844, body: shell(topbar("Aman Gold", "F01-Home.dc.html"),
  `${hero(`<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#FBF3DD">Invest in Gold</div><div style="font-size:22px;font-weight:800;line-height:1.2;margin-top:4px">Start investing in gold from 0.1 g (about EGP 726)</div><div style="font-size:13px;opacity:.9;margin-top:6px">Buy and sell digital gold in a few taps.</div>`)}
   ${card(`<div style="font-size:22px;font-weight:800">EGP 7,223.00 <span style="font-size:12px;color:${C.mut};font-weight:600">/ gram</span></div><div style="font-size:12px;color:${C.mut}">Mid-market price (simulated)</div><svg viewBox="0 0 308 60" style="width:100%;height:60px;margin-top:6px"><path d="${spark}" fill="none" stroke="${C.good}" stroke-width="2"/></svg><div style="display:flex;gap:6px;margin-top:8px">${["1D", "1W", "1M", "3M", "1Y"].map((r, i) => `<span style="flex-grow:1;text-align:center;padding:6px 0;border-radius:999px;font-size:12px;font-weight:700;${i === 0 ? `background:${C.navy};color:#fff` : `background:${C.canvas};color:${C.mut}`}">${r}</span>`).join("")}</div>`)}
   ${card(`<div style="font-weight:800;font-size:14px">Buy and sell prices</div>${row("Buy price", "EGP 7,259.11 / g")}${row("Sell price", "EGP 7,186.89 / g")}<div style="font-size:12px;color:${C.mut}">The difference is Aman's spread (0.5% each side).</div>`)}
   ${card(`<div style="font-weight:800;font-size:14px;margin-bottom:4px">Fees and charges</div>${row("Spread", "0.5% each side")}${row("Transaction fee", "None")}${row("Funding", "Aman Prepaid Card")}`)}
   <div style="background:#FFFBEB;color:#92400E;border-radius:12px;padding:10px 12px;font-size:12px;line-height:1.4"><b>Risk disclosure.</b> Gold prices can rise and fall. Prices here are simulated. Regulatory structure to be validated.</div>`,
  `<div style="background:#fff;padding:14px 16px 20px;border-top:1px solid ${C.line}">${btn("Start Investing", "F03-Onboarding.dc.html", "gold")}</div>`) });

// ---------- F03 Onboarding ----------
files["F03-Onboarding.dc.html"] = page({ title: "Onboarding: account check", w: 390, h: 844, body: shell(topbar("Account check", "F02-Landing.dc.html"),
  `<div style="display:flex;gap:4px">${[1, 1, 0, 0, 0, 0, 0].map((f) => `<div style="flex-grow:1;height:4px;border-radius:2px;background:${f ? C.teal : "rgba(0,0,0,.1)"}"></div>`).join("")}</div>
   <div style="background:${C.soft};color:#035A6C;border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.4">We already have some of your details from your Aman account, so you won't need to enter them twice.</div>
   ${card(`${row("Full name", "Ahmed Hassan")}${row("Mobile number", "+20 100 123 4567")}${row("Aman account", "Active")}${["National ID", "Date of birth", "Address", "Nationality"].map((f) => row(f, "On file", { color: C.good })).join("")}`)}
   <div style="font-size:11px;color:${C.mut};line-height:1.4">Next steps: mobile code, identity review, Aman prepaid card, agreements, done. Required fields are a configurable checklist, not a statement of legal requirements.</div>`,
  `<div style="background:#fff;padding:14px 16px 20px;border-top:1px solid ${C.line}">${btn("Continue", "F04-Dashboard.dc.html")}</div>`) });

// ---------- F04 Dashboard ----------
files["F04-Dashboard.dc.html"] = page({ title: "Gold dashboard", w: 390, h: 844, body: shell(topbar("Aman Gold", null),
  `${hero(`<div style="font-size:12px;opacity:.75">Hi, Ahmed · Portfolio value</div><div style="font-size:32px;font-weight:800;line-height:1.15">EGP 39,528</div><div style="font-size:12px;opacity:.75">Current value (at sell price)</div><div style="display:flex;gap:24px;margin-top:14px"><div><div style="font-size:11px;opacity:.75">Gold holdings</div><div style="font-size:18px;font-weight:800">5.5 g</div></div><div><div style="font-size:11px;opacity:.75">Unrealized P&amp;L</div><div style="font-size:18px;font-weight:800;color:#FCA5A5">-EGP 244</div><div style="font-size:12px;font-weight:700;color:#FCA5A5">-0.61%</div></div></div>`)}
   <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">${btn("Buy Gold", "F05-Buy.dc.html")}${btn("Sell Gold", "F04-Dashboard.dc.html", "secondary")}</div>
   ${card(`<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:800;font-size:14px">Gold price</div>${pill("EGP / gram · 24k", C.goldSoft, C.gold)}</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;background:${C.canvas};border-radius:12px;padding:12px;margin:10px 0"><div><div style="font-size:11px;color:${C.mut};font-weight:700">BUY PRICE</div><div style="font-size:18px;font-weight:800">EGP 7,259.11</div></div><div><div style="font-size:11px;color:${C.mut};font-weight:700">SELL PRICE</div><div style="font-size:18px;font-weight:800">EGP 7,186.89</div></div></div><svg viewBox="0 0 308 60" style="width:100%;height:60px"><path d="${spark}" fill="none" stroke="${C.good}" stroke-width="2"/></svg>`)}
   ${card(`${row("Available balance", "EGP 25,000.00")}${row("Average buy price", "EGP 7,231.24 / g")}${row("Total invested", "EGP 39,772")}`)}`,
  tabs("Gold")) });

// ---------- F05 Buy ----------
files["F05-Buy.dc.html"] = page({ title: "Buy gold: amount", w: 390, h: 844, body: shell(topbar("Buy Gold", "F04-Dashboard.dc.html"),
  `<div style="display:flex;background:#fff;border-radius:12px;padding:4px;font-size:13px;font-weight:700"><span style="flex-grow:1;text-align:center;padding:8px 0;border-radius:8px;background:${C.navy};color:#fff">Buy by grams</span><span style="flex-grow:1;text-align:center;padding:8px 0;color:${C.mut}">Buy by EGP</span></div>
   ${card(`<div style="font-size:12px;font-weight:600;color:${C.mut}">Grams (steps of 0.1 g)</div><div style="display:flex;align-items:center;gap:8px;padding:8px 0"><span style="width:40px;height:40px;border-radius:50%;background:${C.canvas};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">−</span><div style="flex-grow:1;font-size:34px;font-weight:800"><span style="color:#9AA3B2;font-size:20px">g</span> 0.5</div><span style="width:40px;height:40px;border-radius:50%;background:${C.canvas};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">+</span></div><div style="font-size:13px;font-weight:600;color:${C.mut}">You'll buy 0.5 g for EGP 3,629.56</div>`)}
   <div style="display:flex;flex-wrap:wrap;gap:8px">${["0.1 g", "0.5 g", "1 g", "2 g", "5 g"].map((t, i) => `<span style="padding:9px 16px;border-radius:999px;background:${i === 1 ? C.soft : "#fff"};font-size:13px;font-weight:700;box-shadow:0 1px 2px rgba(0,0,0,.06)">${t}</span>`).join("")}</div>
   ${card(`${row("Available balance", "EGP 25,000.00")}${row("Buy price", "EGP 7,259.11 / g")}${row("Minimum", "0.1 g (about EGP 726)")}${row("Maximum per order", "EGP 75,000")}`)}`,
  `<div style="background:#fff;padding:14px 16px 20px;border-top:1px solid ${C.line}">${btn("Review order", "F06-Summary.dc.html")}</div>`) });

// ---------- F06 Summary ----------
files["F06-Summary.dc.html"] = page({ title: "Order summary", w: 390, h: 844, body: shell(topbar("Order summary", "F05-Buy.dc.html"),
  `<div style="background:${C.soft};color:#035A6C;border-radius:12px;padding:10px;text-align:center;font-size:13px;font-weight:800">Price locked for 27s</div>
   ${card(`${row("Gold quantity", "0.5 g", { strong: true })}${row("Gold buy price", "EGP 7,259.11 / g")}${row("Investment", "EGP 3,629.56")}${row("Fee", "EGP 0.00 (spread only)")}${hr}${row("Total", "EGP 3,629.56", { strong: true })}${row("Payment method", "Aman Prepaid Card 4582")}`)}
   <div style="background:${C.soft};color:#035A6C;border-radius:12px;padding:10px 12px;font-size:13px">Gold prices may change before your order is executed.</div>
   <div style="font-size:11px;color:${C.mut};line-height:1.4">Next: enter your PIN (simulated), see the processing state, then the confirmation.</div>`,
  `<div style="background:#fff;padding:14px 16px 20px;border-top:1px solid ${C.line}">${btn("Confirm Purchase", "F07-Success.dc.html")}</div>`) });

// ---------- F07 Success ----------
files["F07-Success.dc.html"] = page({ title: "Purchase complete", w: 390, h: 844, body: shell(topbar("Purchase complete", null),
  `<div style="text-align:center;padding-top:16px"><div style="width:64px;height:64px;border-radius:50%;background:#DCFCE7;color:${C.good};font-size:32px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto">✓</div><div style="font-size:20px;font-weight:800;margin-top:10px">Gold purchased successfully</div></div>
   ${card(`${row("Quantity", "0.5 g")}${row("Purchase price", "EGP 7,259.11 / g")}${row("Fee", "EGP 0.00")}${row("Total paid", "EGP 3,629.56", { strong: true })}${hr}${row("Transaction ID", "GOLD-000123")}${row("Date & time", "22 Sep 2026, 03:05")}${row("Gold balance", "5.5 g → 6.0 g")}${row("Cash balance", "EGP 25,000.00 → EGP 21,370.44")}`)}`,
  `<div style="background:#fff;padding:14px 16px 20px;border-top:1px solid ${C.line};display:flex;flex-direction:column;gap:8px">${btn("View Investment", "F08-Portfolio.dc.html", "gold")}${btn("Done", "F04-Dashboard.dc.html", "secondary")}</div>`) });

// ---------- F08 Portfolio ----------
const CUM = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 63.93, 55.66, 55.66, 55.66, -20.49, -3.27, -3.27, -31.65, -75.81, -75.81, -75.81, -75.81, 39.78, 100.37, 200.3, 250.03, 307.91, 307.91, 307.91]; // Aug 24 .. Sep 22, from the seeded ledger
const cx = (i) => 40 + (i / (CUM.length - 1)) * 292, cy = (v) => 10 + (1 - (v + 100) / 500) * 130;
const cumLine = CUM.map((v, i) => `${i ? "L" : "M"}${cx(i).toFixed(1)},${cy(v).toFixed(1)}`).join(" ");
files["F08-Portfolio.dc.html"] = page({ title: "Portfolio", w: 390, h: 844, body: shell(topbar("Portfolio", null),
  `${card(`<div style="font-size:15px;font-weight:800">Portfolio value</div><div style="font-size:32px;font-weight:800;line-height:1.15">EGP 43,121</div><div style="font-size:12px;color:${C.mut}">≈ 6.0 g of 24k gold at sell price EGP 7,186.89 / g</div>
     <a href="F09-DailyPnl.dc.html" style="display:flex;justify-content:space-between;align-items:center;background:${C.canvas};border-radius:12px;padding:10px 12px;margin-top:10px"><div><div style="font-size:13px;font-weight:700">Today's Realized P&amp;L</div><div style="font-size:11px;color:${C.mut}">Tap to see daily P&amp;L</div></div><div style="display:flex;align-items:center;gap:8px"><div style="text-align:right;font-size:14px;font-weight:800">+EGP 0.00<div style="font-size:11px">+0.00%</div></div><span style="font-size:20px;color:#9AA3B2">›</span></div></a>
     <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:12px"><div><div style="font-size:12px;color:${C.mut}">Gold holdings</div><div style="font-size:18px;font-weight:800">6.0 g</div></div><div><div style="font-size:12px;color:${C.mut}">Unrealized P&amp;L</div><div style="font-size:18px;font-weight:800;color:${C.bad}">-EGP 280</div><div style="font-size:12px;font-weight:700;color:${C.bad}">-0.65%</div></div></div>`)}
   ${card(`<div style="font-size:15px;font-weight:800;margin-bottom:4px">Cumulative P&amp;L</div><div style="font-size:20px;font-weight:800;color:${C.good}">+EGP 307.89</div><div style="font-size:11px;color:${C.mut}">Cumulative realized P&amp;L, last 30 days</div><svg viewBox="0 0 340 170" style="width:100%"><g stroke="#1E2B4A" stroke-opacity=".12">${[-100, 0, 100, 200, 300, 400].map((t) => `<line x1="40" x2="332" y1="${cy(t)}" y2="${cy(t)}"/>`).join("")}</g><g font-size="9" fill="#1E2B4A" fill-opacity=".55" text-anchor="end">${[-100, 0, 100, 200, 300, 400].map((t) => `<text x="34" y="${cy(t) + 3}">${t}</text>`).join("")}</g><path d="${cumLine}" fill="none" stroke="${C.teal}" stroke-width="2" stroke-linejoin="round"/><g font-size="9" fill="#1E2B4A" fill-opacity=".55" text-anchor="middle"><text x="${cx(0)}" y="160">08-24</text><text x="${cx(10)}" y="160">09-03</text><text x="${cx(20)}" y="160">09-13</text><text x="${cx(29)}" y="160">09-22</text></g></svg>`)}
   ${card(`<div style="font-size:15px;font-weight:800;margin-bottom:8px">Asset allocation</div><div style="display:flex;align-items:center;gap:16px"><svg viewBox="0 0 140 140" style="width:110px;height:110px;transform:rotate(-90deg)"><circle cx="70" cy="70" r="54" fill="none" stroke="${C.light}" stroke-width="16"/><circle cx="70" cy="70" r="54" fill="none" stroke="${C.teal}" stroke-width="16" stroke-dasharray="226.8 112.4"/></svg><div style="flex-grow:1;font-size:13px">${row("Gold", "66.86%")}${row("Cash (prepaid)", "33.14%")}</div></div>`)}`,
  tabs("Portfolio")) });

// ---------- F09 Daily P&L ----------
const daily = { 3: 63.93, 4: -8.27, 8: -76.15, 9: 17.22, 11: -28.38, 12: -44.16, 16: 115.59, 17: 60.59, 18: 99.93, 19: 49.73, 20: 57.88 };
const cells = [];
for (let i = 0; i < 2; i++) cells.push("<div></div>");
for (let d = 1; d <= 30; d++) {
  if (d > 22) { cells.push(`<div style="height:52px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#9AA3B2">${d}</div>`); continue; }
  const v = daily[d] || 0;
  const st = v > 0 ? `background:#F0FDF4;color:${C.good}` : v < 0 ? `background:#FEF2F2;color:${C.bad}` : `background:rgba(0,0,0,.05);color:${C.mut}`;
  const txt = v === 0 ? "0.00" : `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(2)}`;
  cells.push(`<div style="height:52px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;${st};${d === 22 ? `box-shadow:0 0 0 2px ${C.teal}` : ""}"><span style="font-size:12px;font-weight:800;color:${C.navy}">${d}</span><span style="font-size:9.5px;font-weight:700;margin-top:2px">${txt}</span></div>`);
}
files["F09-DailyPnl.dc.html"] = page({ title: "Daily P&L", w: 390, h: 844, body: shell(topbar("Daily P&L", "F08-Portfolio.dc.html"),
  `<div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:4px;background:#fff;border-radius:12px;padding:4px 6px;box-shadow:0 1px 2px rgba(0,0,0,.06)"><span style="width:32px;text-align:center;font-size:18px;font-weight:700">‹</span><span style="min-width:120px;text-align:center;font-size:14px;font-weight:800">September 2026</span><span style="width:32px;text-align:center;font-size:18px;color:#C5CBD6">›</span></div><div style="display:flex;background:#fff;border-radius:12px;padding:4px;font-size:12px;font-weight:700"><span style="padding:6px 12px;border-radius:8px;background:${C.navy};color:#fff">Calendar</span><span style="padding:6px 12px;color:${C.mut}">Bars</span></div></div>
   ${card(`<div style="font-size:12px;font-weight:600;color:${C.mut}">Realized P&amp;L in September 2026</div><div style="font-size:24px;font-weight:800;color:${C.good}">+EGP 307.89</div><div style="font-size:12px;color:${C.mut}"><b style="color:${C.good}">7</b> winning days · <b style="color:${C.bad}">4</b> losing days</div>`)}
   ${card(`<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;text-align:center;font-size:11px;font-weight:700;color:#9AA3B2;margin-bottom:8px">${["S", "M", "T", "W", "T", "F", "S"].map((w) => `<div>${w}</div>`).join("")}</div><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px">${cells.join("")}</div>`, "padding:12px")}
   <div style="font-size:11px;color:${C.mut};line-height:1.4">Realized P&amp;L is booked when you sell gold: net proceeds minus average cost of the gold sold. Days without a sale show 0.00. Today's cell updates live as you trade.</div>`) });

// ---------- F10 Transactions ----------
const tx = [["BUY", "0.5 g", "EGP 7,259.11 / g", "EGP 3,629.56", "22 Sep 2026 · 03:05", "GOLD-000123"], ["BUY", "1 g", "EGP 7,301.80 / g", "EGP 7,301.80", "21 Sep 2026 · 16:05", "GOLD-000119"], ["SELL", "0.5 g", "EGP 7,331.32 / g", "EGP 3,665.66", "20 Sep 2026 · 11:45", "GOLD-000118"], ["SELL", "0.5 g", "EGP 7,315.02 / g", "EGP 3,657.51", "19 Sep 2026 · 13:10", "GOLD-000117"], ["SELL", "1 g", "EGP 7,315.49 / g", "EGP 7,315.49", "18 Sep 2026 · 12:00", "GOLD-000116"]];
files["F10-Transactions.dc.html"] = page({ title: "Transactions", w: 390, h: 844, body: shell(topbar("Transactions", null),
  tx.map((t) => card(`<div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:8px">${pill(t[0], t[0] === "BUY" ? C.soft : C.goldSoft, t[0] === "BUY" ? "#035A6C" : C.gold)}<span style="font-size:15px;font-weight:800">${t[1]}</span></div>${pill("Completed", "#DCFCE7", C.good)}</div><div style="display:flex;justify-content:space-between;font-size:13px;margin-top:4px"><span style="color:${C.mut}">${t[2]}</span><b>${t[3]}</b></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#9AA3B2;margin-top:4px"><span>${t[4]}</span><span>${t[5]}</span></div>`, "padding:12px")).join(""),
  tabs("Activity")) });


// ---------- New-customer onboarding (CR-10) ----------
const stepper10 = (n) => `<div style="display:flex;gap:4px">${Array.from({ length: 10 }, (_, i) => `<div style="flex-grow:1;height:4px;border-radius:2px;background:${i < n ? C.teal : "rgba(0,0,0,.1)"}"></div>`).join("")}</div>`;
const inp = (label, val, hint) => `<div><div style="font-size:12px;font-weight:600;color:${C.mut};margin-bottom:4px">${e(label)}</div><div style="border:1px solid rgba(0,0,0,.1);background:#fff;border-radius:12px;padding:13px 12px;font-size:15px;min-height:20px">${e(val)}</div>${hint ? `<div style="font-size:11px;color:${C.mut};margin-top:4px;line-height:1.4">${e(hint)}</div>` : ""}</div>`;
const info = (t) => `<div style="background:${C.soft};color:#035A6C;border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.4">${e(t)}</div>`;
const nframe = (n, title, prev, next, cta, main, kind = "primary") => page({ title: "New customer: " + title, w: 390, h: 844, body: shell(topbar(title, prev), stepper10(n) + main, `<div style="background:#fff;padding:14px 16px 20px;border-top:1px solid ${C.line}">${btn(cta, next, kind)}</div>`) });
const box = (t) => `<div style="flex-grow:1;height:52px;border:1px solid rgba(0,0,0,.1);background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800">${t}</div>`;
const dots = (n) => `<div style="display:flex;gap:12px;justify-content:center;padding:6px 0">${[0, 1, 2, 3].map((i) => `<span style="width:16px;height:16px;border-radius:50%;background:${i < n ? C.teal : "rgba(0,0,0,.1)"}"></span>`).join("")}</div>`;
const idcard = (t) => card(`<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:14px;font-weight:800">${t}</div>${pill("Captured", "#DCFCE7", C.good)}</div><div style="height:96px;margin:12px 0;border:2px dashed rgba(0,0,0,.1);border-radius:12px;background:${C.canvas};display:flex;align-items:center;justify-content:center;font-size:12px;color:#9AA3B2">ID image captured (simulated)</div><div style="text-align:center;padding:12px;border-radius:16px;border:1px solid rgba(4,118,141,.3);color:${C.teal};font-weight:800;font-size:15px">Retake</div>`);

files["N01-Mobile.dc.html"] = nframe(2, "Mobile number", "F02-Landing.dc.html", "N02-Code.dc.html", "Send code", inp("Mobile number", "+20  101 234 5678", "We'll send a 4-digit code to this number (demo: no SMS is sent).") + info("We couldn't find an Aman profile with your details, so we'll set one up now."));
files["N02-Code.dc.html"] = nframe(3, "Verification code", "N01-Mobile.dc.html", "N03-Pin.dc.html", "Verify", info("Code sent to +20 1012345678. Demo: enter any 4 digits.") + `<div style="display:flex;gap:10px">${["1", "2", "3", "4"].map(box).join("")}</div>`);
files["N03-Pin.dc.html"] = nframe(4, "Create PIN", "N02-Code.dc.html", "N04-Details.dc.html", "Continue", info("Your PIN approves every gold order. Demo: any 4 digits.") + card(`<div style="font-size:12px;font-weight:600;color:${C.mut}">Create a 4-digit PIN</div>${dots(4)}<div style="font-size:12px;font-weight:600;color:${C.mut};margin-top:8px">Confirm PIN</div>${dots(4)}`));
files["N04-Details.dc.html"] = nframe(5, "Personal details", "N03-Pin.dc.html", "N05-Id.dc.html", "Continue", inp("Full name (as on National ID)", "Sara Mahmoud") + inp("National ID number", "29001011234567", "Demo validation: 14 digits (configurable).") + inp("Date of birth", "01/01/1990") + inp("Nationality", "Egyptian") + inp("Address", "5 Example St, Maadi, Cairo") + `<div style="font-size:11px;color:${C.mut};line-height:1.4">Required data is a configurable checklist, not a statement of legal requirements. To validate with Compliance.</div>`);
files["N05-Id.dc.html"] = nframe(6, "ID document", "N04-Details.dc.html", "N06-Selfie.dc.html", "Continue", info("Take a clear photo of each side of your National ID. Demo: tap to simulate a capture.") + idcard("Front of National ID") + idcard("Back of National ID"));
files["N06-Selfie.dc.html"] = nframe(7, "Selfie check", "N05-Id.dc.html", "N07-Card.dc.html", "Continue", info("A quick selfie confirms it's you. Demo: tap to simulate the check.") + card(`<div style="width:160px;height:160px;border-radius:50%;border:4px dashed rgba(4,118,141,.4);background:${C.canvas};margin:8px auto;display:flex;align-items:center;justify-content:center;font-size:12px;color:#9AA3B2">Verified (simulated)</div><div style="text-align:center;margin-bottom:12px">${pill("Match confirmed", "#DCFCE7", C.good)}</div><div style="text-align:center;padding:12px;border-radius:16px;border:1px solid rgba(4,118,141,.3);color:${C.teal};font-weight:800;font-size:15px">Retake</div>`));
files["N07-Card.dc.html"] = nframe(8, "Aman prepaid card", "N06-Selfie.dc.html", "N08-Agreements.dc.html", "Continue", info("Gold purchases are paid from your Aman prepaid card balance. Add money via InstaPay.") + `<div style="background:${GRAD};border-radius:16px;padding:16px;color:#fff"><div style="font-size:11px;opacity:.8">Aman Prepaid Card</div><div style="font-size:16px;letter-spacing:.16em;margin-top:12px">**** **** **** 4582</div><div style="font-size:11px;opacity:.8;margin-top:8px">Balance: EGP 10,000</div></div>` + card(`<div style="font-size:14px;font-weight:800;margin-bottom:8px">Add money via InstaPay (optional now)</div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${["1K", "5K", "10K", "25K"].map((t) => `<div style="text-align:center;padding:12px 0;border-radius:12px;font-size:13px;font-weight:800;${t === "10K" ? `background:${C.teal};color:#fff` : `background:${C.soft};color:#035A6C`}">${t}</div>`).join("")}</div><div style="font-size:11px;color:${C.mut};margin-top:8px">Simulated. You can top up later from the buy screen.</div>`));
files["N08-Agreements.dc.html"] = nframe(9, "Agreements", "N07-Card.dc.html", "F04-Dashboard.dc.html", "Start Investing", card(["Terms & Conditions", "Gold Investment Terms", "Fees", "Risk Disclosure", "Privacy Policy"].map((t, i) => `<div style="display:flex;justify-content:space-between;padding:12px 0;font-size:14px;font-weight:700;${i ? `border-top:1px solid ${C.line}` : ""}"><span>${e(t)}</span><span style="color:${C.teal}">›</span></div>`).join(""), "padding:4px 16px") + `<div style="display:flex;gap:12px;align-items:flex-start;background:#fff;border-radius:16px;padding:16px;font-size:13px"><span style="width:20px;height:20px;border-radius:5px;background:${C.teal};color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">✓</span>I have read and agree to the terms, fees and risk disclosure.</div>`);

const stepsExisting = ["Introduction", "Account check (reuse data on file)", "Mobile code", "Identity (only missing fields)", "Payment method (existing prepaid card)", "Agreements", "Done"];
const stepsNew = ["Introduction", "Mobile number", "Verification code", "Create PIN", "Personal details", "ID document (front and back)", "Selfie check", "Aman prepaid card + InstaPay top-up", "Agreements", "Done"];
const stepList = (a, tone) => a.map((s, i) => `<div style="display:flex;gap:10px;align-items:center;padding:6px 0;font-size:14px"><span style="width:24px;height:24px;border-radius:50%;background:${tone};color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i + 1}</span>${e(s)}</div>`).join("");
files["F11-OnboardingBranch.dc.html"] = page({ title: "Onboarding decision", w: 920, h: 844, body: `<div style="width:920px;height:844px;box-sizing:border-box;padding:40px;background:${C.canvas};display:flex;flex-direction:column;gap:20px">
  <div style="font-size:28px;font-weight:800;line-height:1.2">Which onboarding does the customer get?</div>
  <div style="display:flex;justify-content:center"><div style="background:#fff;border-radius:16px;padding:14px 24px;font-size:15px;font-weight:800;box-shadow:0 1px 3px rgba(30,43,74,.08)">Customer taps Gold and starts investing</div></div>
  <div style="text-align:center;font-size:20px;color:${C.mut}">↓</div>
  <div style="display:flex;justify-content:center"><div style="background:${C.goldSoft};border:2px solid ${C.gold};border-radius:16px;padding:14px 28px;font-size:15px;font-weight:800;text-align:center">Is an Aman profile with KYC data already on file?</div></div>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;flex-grow:1">
    <div style="background:#fff;border-radius:20px;padding:22px;box-shadow:0 1px 3px rgba(30,43,74,.08);display:flex;flex-direction:column;gap:6px"><div style="font-size:12px;font-weight:800;color:${C.good};letter-spacing:.06em;text-transform:uppercase">Yes: existing Aman customer</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">7 steps, reuses data on file</div>${stepList(stepsExisting, C.teal)}<div style="flex-grow:1"></div><a href="F03-Onboarding.dc.html" style="text-align:center;padding:13px;border-radius:14px;background:${C.teal};color:#fff;font-weight:800;font-size:14px">Open frame 3</a></div>
    <div style="background:#fff;border-radius:20px;padding:22px;box-shadow:0 1px 3px rgba(30,43,74,.08);display:flex;flex-direction:column;gap:6px"><div style="font-size:12px;font-weight:800;color:#B45309;letter-spacing:.06em;text-transform:uppercase">No: brand-new customer</div><div style="font-size:18px;font-weight:800;margin-bottom:6px">10 steps, captures everything</div>${stepList(stepsNew, C.gold)}<div style="flex-grow:1"></div><a href="N01-Mobile.dc.html" style="text-align:center;padding:13px;border-radius:14px;background:${C.gold};color:#fff;font-weight:800;font-size:14px">Open frame N1</a></div>
  </div>
  <div style="text-align:center;font-size:20px;color:${C.mut}">↓</div>
  <div style="display:flex;justify-content:center"><a href="F04-Dashboard.dc.html" style="background:#fff;border-radius:16px;padding:14px 24px;font-size:15px;font-weight:800;box-shadow:0 1px 3px rgba(30,43,74,.08)">Gold dashboard</a></div>
  <div style="font-size:12px;color:${C.mut};text-align:center;line-height:1.5">Prototype control "Customer scenario": existing Aman customer, brand-new customer, existing investor. All identity checks are simulated; required data is a configurable checklist (to validate with Compliance).</div>
</div>` });

// ---------- Main: process board ----------
const stages = [
  ["1", "Business case", `Lab with 5 agents and a 7-round debate. Decision: <b>PROCEED WITH CONDITIONS</b> after PM updates.`, [["Inputs", "39"], ["Sources", "11"], ["Lines", "~1,600"]], "20-21 Sep"],
  ["2", "Product (PRD)", `Phase 1 discovery, then PRD, business flow, architecture, assumptions, risk register and roadmap as .md files.`, [["Conflicts", "9"], ["Assumptions", "13"], ["Docs", "4"]], "21 Sep"],
  ["3", "Design", `Screen flow board on a Claude Design canvas with clickable links. Aman palette applied. <i>No Figma file was created.</i>`, [["Frames", "19"], ["Flows", "3"], ["Palette", "2 hex"]], "21-22 Sep"],
  ["4", "Sprint tickets", `Epics, stories and tasks written retrospectively; import-ready CSV for Jira.`, [["Epics", c.epics], ["Stories", c.stories], ["Tasks", c.tasks]], "retrospective"],
  ["5", "Development", `Next.js + TypeScript + Tailwind prototype. Core code generated in <b>8 minutes</b>; 4h 11m elapsed including waiting for PM.`, [["Files", "36"], ["Lines", "~1,850"], ["Screens", "12+"]], "21-22 Sep"],
  ["6", "QA stories", `New stories and tasks for the testing team, mapped to every "Not executed" case.`, [["Stories", c.qaStories], ["Tasks", c.qaTasks], ["Sprint", "3 (proposed)"]], "proposed"],
  ["7", "Test cases", `${c.tc} cases with results. Executed by scripted browser checks, not a human QA team.`, [["Pass", c.pass], ["Fixed", c.fixed], ["Not run", c.notExec]], "20-22 Sep"],
  ["8", "Change requests", `Every PM change logged: 4 decisions, 5 business-case changes, 10 product changes.`, [["Total", c.crs], ["Decisions", 4], ["Product CRs", 10]], "20-22 Sep"],
  ["9", "Debugging", `${c.defects} defects; three high severity ones shared one root cause (extra PIN taps re-submitting orders).`, [["Defects", c.defects], ["High", 3], ["Fix time", "~40 min"]], "22 Sep"],
];
const stageCard = (s) => `<div style="background:#fff;border-radius:20px;padding:22px;box-shadow:0 1px 3px rgba(30,43,74,.08);display:flex;flex-direction:column;gap:12px"><div style="display:flex;align-items:center;gap:12px"><div style="width:38px;height:38px;border-radius:50%;background:${C.teal};color:#fff;font-weight:800;font-size:17px;display:flex;align-items:center;justify-content:center">${s[0]}</div><div style="flex-grow:1;font-size:20px;font-weight:800">${s[1]}</div><div style="font-size:12px;font-weight:700;color:${C.mut}">${s[4]}</div></div><div style="font-size:14px;line-height:1.5;color:#3B4660;min-height:63px">${s[2]}</div><div style="display:flex;gap:10px">${s[3].map((m) => `<div style="flex-grow:1;background:${C.canvas};border-radius:12px;padding:10px 12px"><div style="font-size:20px;font-weight:800;color:${C.teal}">${m[1]}</div><div style="font-size:11px;font-weight:600;color:${C.mut}">${m[0]}</div></div>`).join("")}</div></div>`;
const seg = (n, color) => `<div style="flex-grow:${n};background:${color}"></div>`;
const cr10 = fs.existsSync(path.join(__dirname, ".cr10-time.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, ".cr10-time.json"), "utf8")) : { total: "n/a" };
const tl = [["Lab build", "20 Sep 21:34", "43 min", "#04768D"], ["PM changes (Lab)", "21 Sep, by 17:02", "n/a", "#64C2D3"], ["Prototype code", "21 Sep 22:39", "8 min", "#B8912F"], ["Verify + CR-01/02", "21 Sep 22:47", "47 min", "#64C2D3"], ["Waiting for PM", "21 Sep 23:34", "2 h 25 m", "#C5CBD6"], ["Debug + palette", "22 Sep 01:59", "14 min", "#DC2626"], ["P&L CRs", "22 Sep 02:13", "37 min", "#04768D"], ["New-customer onboarding", "22 Sep 03:12", cr10.total, "#B8912F"]];
files["Main.dc.html"] = page({ title: "How Aman Gold was built", w: 1440, h: 1080, css: "", body: `<div style="width:1440px;height:1080px;box-sizing:border-box;padding:48px;background:${C.canvas};display:flex;flex-direction:column;gap:24px">
  <div style="display:flex;justify-content:space-between;align-items:flex-end"><div><div style="font-size:14px;font-weight:700;color:${C.teal};letter-spacing:.06em;text-transform:uppercase">Delivery overview · 20 Sep to 22 Sep 2026</div><div style="font-size:36px;font-weight:800;line-height:1.15;margin-top:6px">From idea to a tested clickable prototype</div></div><div style="font-size:13px;color:${C.mut};max-width:420px;text-align:right;line-height:1.5">Figures come from file timestamps and the delivery workbook. Human-equivalent effort is an estimate. Tickets and QA stories were written after the work.</div></div>
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px">${stages.map(stageCard).join("")}</div>
  <div style="background:#fff;border-radius:20px;padding:22px;box-shadow:0 1px 3px rgba(30,43,74,.08)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div style="font-size:16px;font-weight:800">Test results (${c.tc} cases)</div><div style="display:flex;gap:16px;font-size:12px;font-weight:700"><span style="color:${C.good}">Pass ${c.pass}</span><span style="color:${C.bad}">Failed then fixed ${c.fixed}</span><span style="color:#B45309">Not executed ${c.notExec}</span></div></div><div style="display:flex;height:22px;border-radius:11px;overflow:hidden">${seg(c.pass, "#16A34A")}${seg(c.fixed, "#EF4444")}${seg(c.notExec, "#F59E0B")}</div></div>
  <div style="background:#fff;border-radius:20px;padding:22px;box-shadow:0 1px 3px rgba(30,43,74,.08)"><div style="font-size:16px;font-weight:800;margin-bottom:12px">Timeline (segments not to scale; overnight gap of 18 h not shown)</div><div style="display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:8px">${tl.map((t) => `<div style="border-top:5px solid ${t[3]};padding-top:8px"><div style="font-size:13px;font-weight:800">${t[0].replace("&", "&amp;")}</div><div style="font-size:12px;color:${C.mut}">${t[1]}</div><div style="font-size:18px;font-weight:800;color:${C.teal};margin-top:2px">${t[2]}</div></div>`).join("")}</div></div>
</div>` });

for (const [name, html] of Object.entries(files)) fs.writeFileSync(path.join(OUT, name), html, "utf8");

// canvas.json
const flow = ["F01-Home", "F02-Landing", "F03-Onboarding", "F04-Dashboard", "F05-Buy", "F06-Summary", "F07-Success", "F08-Portfolio", "F09-DailyPnl", "F10-Transactions"];
const titles = ["1 Home", "2 Gold landing", "3 Onboarding (existing customer)", "4 Dashboard", "5 Buy: amount", "6 Order summary", "7 Success", "8 Portfolio", "9 Daily P&L", "10 Transactions"];
const boards = { "Main.dc.html": { x: 0, y: 260, w: 1440, h: 1080, title: "Delivery overview" } };
flow.forEach((f, i) => (boards[`${f}.dc.html`] = { x: i * 470, y: 1680, w: 390, h: 844, title: titles[i], is_interactive: true, radius: 24 }));
const canvas = {
  v: 3, createdOnFiles: { v: 1, at: new Date().toISOString() }, title: "Aman Gold - Delivery Story and Flow Board",
  launch: { view: "canvas" }, pages: [], boards, order: ["Main.dc.html", ...flow.map((f) => `${f}.dc.html`)],
  notes: {
    t1: { x: 0, y: 0, text: "How Aman Gold was built", kind: "title1", maxW: 1440 },
    t2: { x: 0, y: 1420, text: "Customer flow: press Play and click through", kind: "title1", maxW: 4700 },
  },
  designSystems: [],
};
const nflow = ["N01-Mobile", "N02-Code", "N03-Pin", "N04-Details", "N05-Id", "N06-Selfie", "N07-Card", "N08-Agreements"];
const ntitles = ["N1 Mobile number", "N2 Verification code", "N3 Create PIN", "N4 Personal details", "N5 ID document", "N6 Selfie check", "N7 Prepaid card + top-up", "N8 Agreements"];
boards["F11-OnboardingBranch.dc.html"] = { x: 0, y: 2900, w: 920, h: 844, title: "Onboarding decision", is_interactive: true, radius: 12 };
nflow.forEach((f, i) => (boards[`${f}.dc.html`] = { x: 1000 + i * 470, y: 2900, w: 390, h: 844, title: ntitles[i], is_interactive: true, radius: 24 }));
canvas.order.push("F11-OnboardingBranch.dc.html", ...nflow.map((f) => `${f}.dc.html`));
canvas.notes.t3 = { x: 0, y: 2640, text: "Onboarding: brand-new customer (nothing on file)", kind: "title1", maxW: 4680 };
fs.writeFileSync(path.join(OUT, "canvas.json"), JSON.stringify(canvas, null, 2), "utf8");
console.log("wrote", Object.keys(files).length, "boards");
