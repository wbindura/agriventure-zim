import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from "recharts";

// ─── COLOUR PALETTE ────────────────────────────────────────────────────────────
const C = { amber: "#F59E0B", orange: "#F97316", green: "#10B981", purple: "#7C3AED", blue: "#0EA5E9", pink: "#EC4899", teal: "#14B8A6", red: "#EF4444", lime: "#84CC16" };

// ─── CROP DATA ─────────────────────────────────────────────────────────────────
const CROPS = {
  vegetables: {
    name: "Baby Vegetables", emoji: "🥦", color: C.green,
    firstRevenue: 0.25, fullProd: 0.25, lifespan: "Perpetual",
    yieldKgHa: 18000, price: 2.80,
    establishCost: 2200, annualCost: 11200,
    peasant90Days: { desc: "3 cycles/year", y1: 3200, y3: 7800, y5: 11400, y10: 14800, y50: 18200 },
    valueAdd: ["Frozen veg $3.80/kg", "Dehydrated $12/kg", "Baby food puree $8/kg"],
    markets: ["UAE", "DRC", "Zambia", "Botswana", "Saudi"],
  },
  citrus: {
    name: "Citrus (Oranges)", emoji: "🍊", color: C.orange,
    firstRevenue: 3, fullProd: 5, lifespan: 28,
    yieldKgHa: 45000, price: 0.55,
    establishCost: 3800, annualCost: 7700,
    peasant90Days: { desc: "Harvest May–Aug", y1: 0, y3: 4200, y5: 12600, y10: 19800, y50: 24000 },
    valueAdd: ["Fresh juice $2.80/L", "Citrus oil $12/kg", "Marmalade $3.50/jar"],
    markets: ["UAE", "Saudi", "Zambia", "DRC", "Mozambique"],
  },
  roses: {
    name: "Export Roses", emoji: "🌹", color: C.pink,
    firstRevenue: 0.4, fullProd: 1, lifespan: 8,
    stemsHa: 800000, stemPrice: 0.22,
    establishCost: 18000, annualCost: 24100,
    peasant90Days: { desc: "Continuous harvest", y1: 8400, y3: 28000, y5: 36000, y10: 48000, y50: 52000 },
    valueAdd: ["Rose water $8/250ml", "Rose hip oil $28/100ml", "Dried roses $18/kg"],
    markets: ["UAE", "UK", "Saudi", "Netherlands", "Russia"],
  },
  avocado: {
    name: "Avocado (Hass)", emoji: "🥑", color: C.teal,
    firstRevenue: 4, fullProd: 6, lifespan: 22,
    yieldKgHa: 15000, price: 1.40,
    establishCost: 5200, annualCost: 9200,
    peasant90Days: { desc: "Harvest May–Aug", y1: 0, y3: 0, y5: 8400, y10: 16800, y50: 21000 },
    valueAdd: ["Avocado oil $22/500ml", "Guacamole $6/250g", "Frozen puree $3.50/kg"],
    markets: ["UAE", "Saudi", "China", "UK", "Mauritius"],
  },
  blueberry: {
    name: "Blueberries", emoji: "🫐", color: C.purple,
    firstRevenue: 3, fullProd: 4, lifespan: 15,
    yieldKgHa: 10000, price: 6.00,
    establishCost: 28000, annualCost: 37500,
    peasant90Days: { desc: "Apr–Oct season", y1: 0, y3: 9600, y5: 36000, y10: 48000, y50: 52000 },
    valueAdd: ["Frozen $4.50/kg", "Juice $5.50/L", "Dried $22/kg"],
    markets: ["UAE", "Germany", "Netherlands", "UK", "Singapore"],
  },
};

// ─── FINANCIAL MODELS ──────────────────────────────────────────────────────────
function cropRevenue(cropKey, ha, year) {
  const c = CROPS[cropKey];
  let yf = 0;
  if (year < c.firstRevenue) yf = 0;
  else if (year < c.fullProd) yf = (year - c.firstRevenue) / Math.max(c.fullProd - c.firstRevenue, 0.1) * 0.7 + 0.1;
  else yf = Math.min(1, 0.85 + (year - c.fullProd) * 0.025);
  const gross = c.stemsHa ? c.stemsHa * c.stemPrice * yf * ha : c.yieldKgHa * c.price * yf * ha;
  const cost = (year === 1 ? c.establishCost + c.annualCost : c.annualCost) * ha;
  return { gross: Math.round(gross), cost: Math.round(cost), net: Math.round(gross - cost) };
}

function buildFarmerTimeline(cropKey, ha) {
  return Array.from({ length: 25 }, (_, i) => {
    const yr = i + 1;
    const { gross, cost, net } = cropRevenue(cropKey, ha, yr);
    const farmerShare = Math.max(0, net * 0.6);
    return { year: `Y${yr}`, gross, cost, net, farmerShare };
  }).map((r, i, arr) => ({ ...r, cumFarmer: arr.slice(0, i + 1).reduce((s, x) => s + x.farmerShare, 0) }));
}

// Diaspora returns — profit share model
function buildDiasporaReturns(monthlyGBP, numInvestors) {
  const annualPoolGBP = monthlyGBP * numInvestors * 12;
  const xrate = 1.27; // GBP to USD approx
  const annualPoolUSD = annualPoolGBP * xrate;
  // Deployed across crops; modelled aggregate returns
  const netReturnRates = [0, 0.04, 0.11, 0.18, 0.23]; // Y1–Y5 net return on capital
  const profitSharePct = 0.25; // 25% of cooperative net profit to investors
  return Array.from({ length: 5 }, (_, i) => {
    const yr = i + 1;
    const capitalDeployed = annualPoolUSD * Math.min(yr, 3); // 3 year accumulation
    const coopNetProfit = capitalDeployed * netReturnRates[i];
    const investorPool = coopNetProfit * profitSharePct;
    const perInvestorUSD = numInvestors > 0 ? investorPool / numInvestors : 0;
    const perInvestorGBP = perInvestorUSD / xrate;
    const roi = annualPoolGBP > 0 ? (perInvestorGBP / (monthlyGBP * 12)) * 100 : 0;
    return {
      year: `Year ${yr}`,
      capitalPoolUSD: Math.round(capitalDeployed),
      coopNetProfit: Math.round(coopNetProfit),
      investorPoolUSD: Math.round(investorPool),
      perInvestorGBP: Math.round(perInvestorGBP),
      perInvestorUSD: Math.round(perInvestorUSD),
      roi: Math.round(roi * 10) / 10,
    };
  });
}

// Peasant farmer earnings model
function buildPeasantEarnings(cropKey, ha) {
  const c = CROPS[cropKey];
  const pd = c.peasant90Days;
  // 90-day windows = quarterly snapshots
  const milestones = [
    { period: "90 Days", label: "First 90 Days", earning: Math.round(pd.y1 * ha), note: "First cash from seasonal crops / initial flush" },
    { period: "Year 1", label: "Full Year 1", earning: Math.round(pd.y1 * ha * 3.5), note: "Establishment + first returns where applicable" },
    { period: "Year 3", label: "Years 1–3", earning: Math.round(pd.y3 * ha), note: "Perennial crops kicking in, vegetables scaling" },
    { period: "Year 5", label: "Years 3–5", earning: Math.round(pd.y5 * ha), note: "Full production on most crops" },
    { period: "Year 10", label: "Years 5–10", earning: Math.round(pd.y10 * ha), note: "Diversified income streams, value addition" },
    { period: "Year 50", label: "Years 10–50", earning: Math.round(pd.y50 * ha), note: "Multi-generational wealth; land appreciates" },
  ];
  return milestones;
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = n => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${Math.abs(n).toFixed(0)}`;
const fmtGBP = n => n >= 1e3 ? `£${(n/1e3).toFixed(1)}K` : `£${Math.abs(n).toFixed(0)}`;
const CHART_STYLE = { background: "#0F1710", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20 };
const TT = { contentStyle: { background: "#1A2A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#F9FAFB", fontSize: 12 }, labelStyle: { color: "#F9FAFB" } };
const label = (txt, color = "#6B7280") => <div style={{ color, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 5 }}>{txt}</div>;

function Card({ children, style = {} }) {
  return <div style={{ ...CHART_STYLE, ...style }}>{children}</div>;
}
function H3({ children, color = "#F9FAFB" }) {
  return <h3 style={{ color, fontSize: 14, fontWeight: 700, marginBottom: 16, margin: "0 0 16px" }}>{children}</h3>;
}
function Tag({ text, color }) {
  return <span style={{ fontSize: 10, padding: "2px 8px", background: color + "22", color, borderRadius: 10, marginRight: 4 }}>{text}</span>;
}
function KPI({ lbl, val, sub, color = C.amber }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "14px 18px" }}>
      {label(lbl)}
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display',serif" }}>{val}</div>
      {sub && <div style={{ color: "#6B7280", fontSize: 11, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ─── SECTION: DIASPORA RETURNS ─────────────────────────────────────────────────
function DiasporaReturns() {
  const [monthly, setMonthly] = useState(100);
  const [investors, setInvestors] = useState(500);
  const data = useMemo(() => buildDiasporaReturns(monthly, investors), [monthly, investors]);
  const yr5 = data[4];
  const annualContrib = monthly * 12;

  return (
    <div>
      <div style={{ color: C.amber, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>AgriVenture Zimbabwe</div>
      <h2 style={{ color: "#F9FAFB", fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display',serif", margin: "0 0 6px" }}>Diaspora Investor Returns</h2>
      <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 28 }}>
        Profit-sharing, not just interest. Your capital grows crops. The crops generate real trade income. A defined share of that income returns to you annually — proportional to your stake.
      </p>

      {/* Sliders */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            {label("Your monthly contribution (£)")}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={25} max={1000} step={25} value={monthly} onChange={e => setMonthly(+e.target.value)} style={{ flex: 1, accentColor: C.amber }} />
              <span style={{ color: C.amber, fontWeight: 800, fontSize: 22, minWidth: 55 }}>£{monthly}</span>
            </div>
            <div style={{ color: "#4B5563", fontSize: 11, marginTop: 4 }}>Annual commitment: £{(monthly * 12).toLocaleString()}</div>
          </div>
          <div>
            {label("Number of investors in pool")}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={50} max={5000} step={50} value={investors} onChange={e => setInvestors(+e.target.value)} style={{ flex: 1, accentColor: C.green }} />
              <span style={{ color: C.green, fontWeight: 800, fontSize: 22, minWidth: 55 }}>{investors.toLocaleString()}</span>
            </div>
            <div style={{ color: "#4B5563", fontSize: 11, marginTop: 4 }}>Monthly pool: £{(monthly * investors).toLocaleString()}</div>
          </div>
        </div>
      </Card>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <KPI lbl="Annual Pool (£)" val={fmtGBP(monthly * investors * 12)} sub="Total diaspora capital/year" color={C.amber} />
        <KPI lbl="Your Y5 Profit Share" val={fmtGBP(yr5.perInvestorGBP)} sub="Annual profit distribution" color={C.green} />
        <KPI lbl="Y5 Return on Capital" val={`${yr5.roi}%`} sub="of your annual £ contribution" color={C.orange} />
        <KPI lbl="Profit Share Model" val="25%" sub="Of coop net profit to investors" color={C.purple} />
      </div>

      {/* Year-by-year table */}
      <Card style={{ marginBottom: 20 }}>
        <H3>Your Returns Year by Year — Profit Share Model (not just interest)</H3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["Year", "Coop Capital Deployed", "Coop Net Profit", "25% Investor Pool", `Per Investor (£${monthly}/mo)`, "ROI on Contribution"].map(h => (
                  <th key={h} style={{ color: "#6B7280", fontSize: 10, textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i === 4 ? "rgba(245,158,11,0.05)" : "transparent" }}>
                  <td style={{ color: i === 4 ? C.amber : "#F9FAFB", fontWeight: i === 4 ? 700 : 400, padding: "10px 12px", fontSize: 13 }}>{row.year}{i === 4 ? " ★" : ""}</td>
                  <td style={{ color: "#9CA3AF", padding: "10px 12px", fontSize: 13 }}>£{(row.capitalPoolUSD / 1.27 / 1000).toFixed(0)}K</td>
                  <td style={{ color: "#9CA3AF", padding: "10px 12px", fontSize: 13 }}>{row.coopNetProfit > 0 ? fmt(row.coopNetProfit) : "—"}</td>
                  <td style={{ color: C.green, padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{row.investorPoolUSD > 0 ? fmt(row.investorPoolUSD) : "—"}</td>
                  <td style={{ color: C.amber, padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
                    {row.perInvestorGBP > 0 ? `£${row.perInvestorGBP.toLocaleString()}` : "Maturing"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.roi > 0 ? (
                      <span style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>{row.roi}%</span>
                    ) : <span style={{ color: "#4B5563", fontSize: 12 }}>Capital building</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245,158,11,0.08)", borderRadius: 8, fontSize: 12, color: "#9CA3AF" }}>
          <strong style={{ color: C.amber }}>How profit share works: </strong>
          25% of the cooperative's audited net profit is distributed to investors proportional to their capital stake. Unlike fixed interest, if the cooperative has a bumper harvest year, your return grows with it. In poor years, you share the agricultural risk transparently.
        </div>
      </Card>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <H3>Per-Investor Annual Profit Share (£) — 5 Years</H3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" stroke="#4B5563" fontSize={11} />
              <YAxis stroke="#4B5563" fontSize={11} tickFormatter={v => `£${v}`} />
              <Tooltip {...TT} formatter={v => [`£${v.toLocaleString()}`, "Your Profit Share"]} />
              <Bar dataKey="perInvestorGBP" fill={C.amber} radius={[4, 4, 0, 0]} name="Profit Share (£)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <H3>Total Investor Pool Growth (£) — 5 Years</H3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="poolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="year" stroke="#4B5563" fontSize={11} />
              <YAxis stroke="#4B5563" fontSize={11} tickFormatter={v => `£${(v/1.27/1000).toFixed(0)}K`} />
              <Tooltip {...TT} formatter={v => [`£${(v/1.27).toLocaleString()}`, "Investor Pool"]} />
              <Area type="monotone" dataKey="investorPoolUSD" stroke={C.green} fill="url(#poolGrad)" strokeWidth={2} name="Investor Pool" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── SECTION: PEASANT FARMER ───────────────────────────────────────────────────
function PeasantFarmer() {
  const [cropKey, setCropKey] = useState("vegetables");
  const [ha, setHa] = useState(1);
  const crop = CROPS[cropKey];
  const milestones = useMemo(() => buildPeasantEarnings(cropKey, ha), [cropKey, ha]);
  const timeline = useMemo(() => buildFarmerTimeline(cropKey, ha), [cropKey, ha]);

  const milestoneChartData = milestones.map(m => ({ name: m.period, earning: m.earning }));

  // 90-day cycle for vegetables specifically
  const cycleData = cropKey === "vegetables"
    ? [
        { cycle: "Cycle 1 (Feb)", gross: Math.round(ha * 16800 * 0.3), cost: Math.round(ha * 3700), net: Math.round(ha * 16800 * 0.3 - ha * 3700) },
        { cycle: "Cycle 2 (Jun)", gross: Math.round(ha * 16800 * 0.35), cost: Math.round(ha * 3200), net: Math.round(ha * 16800 * 0.35 - ha * 3200) },
        { cycle: "Cycle 3 (Oct)", gross: Math.round(ha * 16800 * 0.35), cost: Math.round(ha * 3300), net: Math.round(ha * 16800 * 0.35 - ha * 3300) },
      ]
    : null;

  return (
    <div>
      <div style={{ color: C.green, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>AgriVenture Zimbabwe</div>
      <h2 style={{ color: "#F9FAFB", fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display',serif", margin: "0 0 6px" }}>Farmer Income Journey</h2>
      <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 24 }}>From 90 days to 50 years — how a smallholder transforms idle land into generational income. Select your crop and land size to see your personal trajectory.</p>

      {/* Controls */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            {label("Choose your crop")}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {Object.entries(CROPS).map(([k, c]) => (
                <button key={k} onClick={() => setCropKey(k)} style={{
                  padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  border: `2px solid ${cropKey === k ? c.color : "rgba(255,255,255,0.1)"}`,
                  background: cropKey === k ? c.color + "22" : "transparent",
                  color: cropKey === k ? c.color : "#6B7280",
                }}>
                  {c.emoji} {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div>
            {label("Your land size (hectares)")}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <input type="range" min={0.5} max={20} step={0.5} value={ha} onChange={e => setHa(+e.target.value)} style={{ flex: 1, accentColor: crop.color }} />
              <span style={{ color: crop.color, fontWeight: 800, fontSize: 22, minWidth: 55 }}>{ha}ha</span>
            </div>
            <div style={{ color: "#4B5563", fontSize: 11, marginTop: 4 }}>{crop.name} · {crop.peasant90Days.desc}</div>
          </div>
        </div>
      </Card>

      {/* 90-day window — vegetables */}
      {cycleData && (
        <Card style={{ marginBottom: 20 }}>
          <H3 color={crop.color}>90-Day Cash Cycles — {ha}ha Baby Vegetables</H3>
          <p style={{ color: "#6B7280", fontSize: 12, marginBottom: 16 }}>Vegetables give you 3 harvests per year, each ~90 days. You can start earning within 10 weeks of planting.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {cycleData.map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, border: `1px solid ${crop.color}33` }}>
                <div style={{ color: crop.color, fontSize: 12, fontWeight: 700 }}>{c.cycle}</div>
                <div style={{ color: "#F9FAFB", fontSize: 20, fontWeight: 800, margin: "6px 0 2px", fontFamily: "'Playfair Display',serif" }}>{fmt(c.gross)}</div>
                <div style={{ color: "#6B7280", fontSize: 11 }}>Revenue</div>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: C.red, fontSize: 11 }}>Cost: {fmt(c.cost)}</span>
                  <span style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>Net: {fmt(c.net)}</span>
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cycleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="cycle" stroke="#4B5563" fontSize={11} />
              <YAxis stroke="#4B5563" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(1)}K`} />
              <Tooltip {...TT} formatter={v => [fmt(v)]} />
              <Legend />
              <Bar dataKey="gross" fill={crop.color} fillOpacity={0.7} radius={[3, 3, 0, 0]} name="Revenue" />
              <Bar dataKey="cost" fill={C.red} fillOpacity={0.6} radius={[3, 3, 0, 0]} name="Cost" />
              <Bar dataKey="net" fill={C.green} fillOpacity={0.8} radius={[3, 3, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Milestone income chart */}
      <Card style={{ marginBottom: 20 }}>
        <H3 color={crop.color}>Income at Every Milestone — {crop.emoji} {crop.name} on {ha}ha</H3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 20 }}>
          {milestones.map((m, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px 10px", border: `1px solid ${crop.color}${i > 2 ? "55" : "22"}`, textAlign: "center" }}>
              <div style={{ color: "#6B7280", fontSize: 9, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{m.period}</div>
              <div style={{ color: m.earning > 0 ? crop.color : "#4B5563", fontSize: 16, fontWeight: 800, fontFamily: "'Playfair Display',serif" }}>
                {m.earning > 0 ? fmt(m.earning) : "—"}
              </div>
              <div style={{ color: "#4B5563", fontSize: 9, marginTop: 4 }}>{m.note.substring(0, 30)}…</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={milestoneChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke="#4B5563" fontSize={11} />
            <YAxis stroke="#4B5563" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip {...TT} formatter={v => [fmt(v), "Annual Earnings"]} />
            <Bar dataKey="earning" radius={[5, 5, 0, 0]} name="Annual Earnings">
              {milestoneChartData.map((_, i) => <Cell key={i} fill={crop.color} fillOpacity={0.4 + i * 0.1} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 25-year farmer share trajectory */}
      <Card>
        <H3>25-Year Farmer Income Trajectory — 60% Share of Net Profit (US$)</H3>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" stroke="#4B5563" fontSize={10} interval={2} />
            <YAxis yAxisId="l" stroke="#4B5563" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <YAxis yAxisId="r" orientation="right" stroke="#4B5563" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip {...TT} formatter={v => [fmt(v)]} />
            <Legend />
            <Bar yAxisId="l" dataKey="farmerShare" fill={crop.color} fillOpacity={0.7} radius={[2, 2, 0, 0]} name="Annual Farmer Share" />
            <Line yAxisId="r" type="monotone" dataKey="cumFarmer" stroke={C.amber} strokeWidth={2} dot={false} name="Cumulative Earnings" />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { lbl: "5-Year Cumulative", val: fmt(timeline[4]?.cumFarmer || 0), color: C.orange },
            { lbl: "10-Year Cumulative", val: fmt(timeline[9]?.cumFarmer || 0), color: C.amber },
            { lbl: "25-Year Cumulative", val: fmt(timeline[24]?.cumFarmer || 0), color: C.green },
          ].map((k, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
              {label(k.lbl)}
              <div style={{ color: k.color, fontSize: 18, fontWeight: 800 }}>{k.val}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── SECTION: COMPLIANCE ───────────────────────────────────────────────────────
function Compliance() {
  const [stage, setStage] = useState(null);

  const stages = [
    {
      num: 1, title: "UK Co-operative Registration", risk: "CRITICAL", color: C.red, timeframe: "2–4 months",
      body: `Register a Co-operative Society under the Co-operative and Community Benefit Societies Act 2014 with the FCA (as registrar of mutuals — NOT as a financial regulator). This is your primary legal vehicle for raising capital from UK-based diaspora members.`,
      howTo: [
        "Draft society rules — must state purpose, membership rights, share structure, profit/surplus distribution",
        "Apply to FCA Mutuals team (not FCA authorisation team) at: fca.org.uk/firms/mutuals",
        "Pay £40–£950 registration fee depending on asset size",
        "Must have minimum 3 members at registration",
        "Agricultural co-operatives have specific guidance under RFCCBS Chapter 6",
      ],
      key: `Community shares in a registered co-operative are NOT regulated investments under FSMA. This means you can offer shares and profit distributions to members WITHOUT FCA authorisation — the single most important exemption for your model.`,
      warning: "Your promotion of the share offer must still comply with contract law and not be misleading. Use the Community Shares Standard Mark (community-shares.org.uk) for credibility.",
    },
    {
      num: 2, title: "Financial Promotion Rules", risk: "HIGH", color: C.orange, timeframe: "Ongoing",
      body: `Section 21 of FSMA 2000 makes it a criminal offence to communicate an invitation to invest unless you are FCA-authorised OR the promotion is exempt. As a registered co-operative issuing withdrawable, non-transferable shares, you benefit from a key exemption.`,
      howTo: [
        "Your share offer is withdrawable and non-transferable → falls OUTSIDE the definition of 'transferable securities' → Section 85 FSMA prospectus requirements do NOT apply",
        "You can promote your share offer to potential members WITHOUT FCA approval of the communication",
        "All promotional material must: clearly state the risk of losing capital, include the society's registered number, not use misleading claims or guaranteed return language",
        "DO NOT use language like 'guaranteed returns', 'risk-free', or 'fixed interest rate'",
        "Profit share language is fine: 'investors receive a proportional share of audited annual profits'",
      ],
      key: "Use the Community Shares Unit's template offer document — it has been pre-reviewed against FCA requirements. Available at: communityshares.org.uk/resources",
      warning: "If you invite investment from non-members (people who haven't joined the co-op), you re-enter regulated territory. Every investor MUST become a member first.",
    },
    {
      num: 3, title: "Zimbabwe End — Corporate Structure", risk: "HIGH", color: C.orange, timeframe: "1–3 months",
      body: `You need a Zimbabwe-registered private limited company (Pvt Ltd) to receive funds from the UK co-operative and operate the agricultural business. The UK co-op and Zimbabwe Pvt Ltd are sister entities — capital flows from UK to Zimbabwe as an inter-company investment or loan.`,
      howTo: [
        "Register with ZIMRA and Companies and Other Business Entities Act (COBE Act 2019) — Zimbabwe Companies Registry",
        "Apply for ZIMRA tax clearance",
        "Open a USD business account at a Zimbabwe commercial bank (CBZ, Stanbic, or Ecobank recommended for international transfers)",
        "Apply to Reserve Bank of Zimbabwe (RBZ) for a 'Capital Inflows Registration' — required for all FDI above $500,000",
        "Declare all inflows on CD1 forms as foreign direct investment — NOT as remittances",
        "Agricultural revenues qualify for Zimbabwe's export incentive schemes — register with ZIMRA for export rebate",
      ],
      key: "RBZ circular on diaspora investment (2021) specifically encourages diaspora capital into agriculture. Use the ZIMRA Approved Exporter status which gives you preferential treatment and faster forex retention.",
      warning: "Never route UK funds through personal accounts. Always through the corporate Zimbabwe bank account. All transfers must be documented as inter-company investment with a signed investment agreement.",
    },
    {
      num: 4, title: "UK Money Transmission & Banking", risk: "HIGH", color: C.orange, timeframe: "1–2 months",
      body: `Collecting monthly contributions from multiple UK investors and transmitting to Zimbabwe constitutes 'money transmission' — a regulated activity under FSMA if done as a business. You need a compliant payment channel.`,
      howTo: [
        "DO NOT collect cash or use personal bank accounts for member contributions",
        "Use an FCA-authorised payment service provider to collect member share payments — Stripe, GoCardless, or a specialist platform",
        "For Zimbabwe transfers: use a licensed international money transfer operator (WorldRemit Business, Mukuru Business, Nala Business, or Wise Business)",
        "Maintain full records of all transfers — sender name, amount, date, reference — for 7 years (AML requirements)",
        "If collective monthly transfers exceed £10,000, your bank will apply Enhanced Due Diligence — prepare a business purpose letter",
        "Register with HMRC as a High Value Dealer if individual transactions exceed £10,000",
      ],
      key: "The cleanest structure: UK co-op holds a Wise Business account. Members pay share capital via direct debit (GoCardless). Co-op sends quarterly investment tranches to Zimbabwe Pvt Ltd via Wise international transfer. Full audit trail.",
      warning: "Do not describe inflows as 'donations' or 'gifts' on bank forms. Always: 'inter-company investment' or 'co-operative member share capital remittance'. Incorrect descriptions trigger AML flags and account freezes.",
    },
    {
      num: 5, title: "Anti-Money Laundering (AML)", risk: "MEDIUM", color: C.amber, timeframe: "Before launch",
      body: `Even as a co-operative, you must have basic AML controls. This protects you and your members. The Money Laundering Regulations 2017 (as amended 2019) apply to certain financial activities — and good practice applies to all.`,
      howTo: [
        "Implement a written AML policy (1–2 pages is fine for a small co-op)",
        "Collect proof of identity for every member before accepting share capital: passport/driving licence + proof of address (utility bill < 3 months)",
        "Keep KYC records for 5 years after membership ends",
        "Appoint a Money Laundering Reporting Officer (MLRO) — can be yourself initially",
        "File Suspicious Activity Reports (SARs) with the National Crime Agency if you suspect any member's funds are from criminal activity",
        "Do NOT accept cash contributions of any amount",
      ],
      key: "Use a simple digital KYC tool like Veriff or Onfido (starts at ~£50/month) to automate passport verification. This makes your platform scalable and compliant as membership grows.",
      warning: "Failure to have AML controls is a criminal offence even for small organisations. But implementation is simple and cheap — don't let this put you off.",
    },
    {
      num: 6, title: "Tax — UK Side", risk: "MEDIUM", color: C.amber, timeframe: "From Y1",
      body: `Your UK co-operative will have tax obligations. Profit distributions to members are treated differently from dividends — another advantage of the co-operative structure.`,
      howTo: [
        "Register the co-operative for UK Corporation Tax with HMRC — even if initially loss-making",
        "Profit share payments to members are treated as 'member transactions' — potentially taxable as income in members' hands, not as dividends",
        "Members receiving profit share should declare it on their self-assessment as 'other income' — typically taxed at their marginal income tax rate above the £1,000 trading allowance",
        "The co-op itself pays Corporation Tax (25% standard rate) on any retained profits",
        "Consult an accountant re: potential tax-efficient structuring via Enterprise Investment Scheme (EIS) — agricultural businesses can qualify for EIS which gives members 30% income tax relief on investments",
        "EIS qualification would make your offer significantly more attractive to diaspora investors",
      ],
      key: "EIS (Enterprise Investment Scheme) approval from HMRC is a game-changer — members get 30% income tax relief on up to £1M invested. An EIS-qualifying agricultural fund structure would be unique and very attractive to diaspora.",
      warning: "Get an accountant who understands both cooperatives and agricultural businesses. Do not use a general high street accountant. Try Cooperatives UK's list of specialist advisers.",
    },
    {
      num: 7, title: "Zimbabwe Agric & Export Licences", risk: "MEDIUM", color: C.lime, timeframe: "Before first export",
      body: `To legally export from Zimbabwe you need a specific chain of licences and registrations. These are obtainable — bureaucratic but manageable with the right support from ZimTrade.`,
      howTo: [
        "Register as Agro-producer with Agricultural Marketing Authority (AMA) — annual, £20 equivalent fee — 8 Leman Road, Harare",
        "Apply for Export Permit from Ministry of Lands, Agriculture at Ngungunyana Building, Borrowdale Road — per product, per season",
        "Obtain Phytosanitary Certificate from Plant Quarantine Services for each shipment — Harare Airport or Mazowe office",
        "Register with ZimTrade as an exporter — free, gives access to market intelligence, trade missions, buyer connections",
        "Register with ZIMRA as an exporter — mandatory for CD1 foreign exchange declaration on every shipment",
        "Apply for GLOBALG.A.P. certification (via South Africa body) — required for UAE, UK, EU supermarket buyers",
        "Apply for Organic certification if targeting premium organic markets (Control Union or ECOCERT)",
      ],
      key: "ZimTrade runs a free 'Exporter Development Programme' and will hand-hold you through all Zimbabwean licensing. Contact: info@tradezimbabwe.com | +263 242 791512",
      warning: "Export permits are crop-specific and time-limited. Do not ship without a valid phytosanitary certificate — shipments will be rejected at destination and you lose the entire load.",
    },
    {
      num: 8, title: "SAFE LAUNCH PATH — 100% Compliant", risk: "LOW", color: C.green, timeframe: "Recommended sequence",
      body: `Here is the exact sequence to launch legally from Day 1, without FCA authorisation, without a prospectus, and without legal risk.`,
      howTo: [
        "MONTH 1–2: Register UK Agricultural Co-operative Society (FCA Mutuals team) · Cost: ~£170",
        "MONTH 1–2: Register Zimbabwe Private Limited Company (COBE Act) · Cost: ~$300",
        "MONTH 2–3: Open Wise Business account (UK) + USD business bank account (Zimbabwe)",
        "MONTH 3: Develop share offer document using Community Shares Unit template — have it reviewed by a co-operative legal specialist (Bates Wells LLP or Anthony Collins Solicitors specialise in co-ops)",
        "MONTH 4: Launch member recruitment — emphasise MEMBERSHIP first, investment second",
        "MONTH 4–6: Collect first tranche of member share capital — transfer quarterly to Zimbabwe Pvt Ltd",
        "MONTH 6+: Register with AMA, ZimTrade, and ZIMRA in Zimbabwe",
        "ONGOING: Annual accounts, member meetings, profit share calculation by independent accountant",
        "YEAR 2+: Apply for EIS advance assurance from HMRC — turbo-charges the offer",
      ],
      key: "Total setup cost: £2,000–£5,000 for legal/accountancy fees. Timeline to compliant launch: 4–6 months. The co-operative structure is specifically designed for community capital raising — it is the BEST vehicle for exactly what you are building.",
      warning: "Do NOT start collecting money before the co-op is registered and the offer document is finalised. One week of impatience could create a criminal liability. Follow the sequence.",
    },
  ];

  return (
    <div>
      <div style={{ color: C.red, fontSize: 10, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>Legal & Compliance</div>
      <h2 style={{ color: "#F9FAFB", fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display',serif", margin: "0 0 6px" }}>100% Compliant Fundraising</h2>
      <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 24 }}>
        You have a significant structural advantage: UK <strong style={{ color: "#F9FAFB" }}>Co-operative Society</strong> community shares are specifically exempt from FSMA financial promotion rules. Click each stage to expand the full compliance pathway.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <KPI lbl="FCA Authorisation Needed?" val="NO" sub="Co-op shares are exempt from FSMA" color={C.green} />
        <KPI lbl="Prospectus Required?" val="NO" sub="Non-transferable shares are exempt" color={C.green} />
        <KPI lbl="Profit Sharing Allowed?" val="YES" sub="Co-op structure permits this" color={C.green} />
        <KPI lbl="Setup Cost (Legal + Reg)" val="£2–5K" sub="4–6 month compliant launch" color={C.amber} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stages.map((s, i) => (
          <div key={i}>
            <div onClick={() => setStage(stage === i ? null : i)} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
              background: stage === i ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${stage === i ? s.color + "55" : "rgba(255,255,255,0.06)"}`,
              borderRadius: stage === i ? "10px 10px 0 0" : 10, cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.color + "33", border: `2px solid ${s.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{s.num}</div>
              <div style={{ flex: 1 }}>
                <span style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600 }}>{s.title}</span>
                <span style={{ color: "#4B5563", fontSize: 12, marginLeft: 12 }}>{s.timeframe}</span>
              </div>
              <Tag text={s.risk} color={s.color} />
              <span style={{ color: "#4B5563", fontSize: 16 }}>{stage === i ? "▲" : "▼"}</span>
            </div>
            {stage === i && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}33`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 24 }}>
                <p style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 16 }}>{s.body}</p>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: "#6B7280", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Action steps</div>
                  {s.howTo.map((step, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                      <span style={{ color: s.color, fontSize: 12, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>→</span>
                      <span style={{ color: "#D1D5DB", fontSize: 13 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px", background: s.color + "11", border: `1px solid ${s.color}33`, borderRadius: 8, marginBottom: 12 }}>
                  <span style={{ color: s.color, fontWeight: 700, fontSize: 12 }}>KEY: </span>
                  <span style={{ color: "#D1D5DB", fontSize: 13 }}>{s.key}</span>
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
                  <span style={{ color: C.red, fontWeight: 700, fontSize: 12 }}>⚠ CAUTION: </span>
                  <span style={{ color: "#9CA3AF", fontSize: 12 }}>{s.warning}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Card style={{ marginTop: 24 }}>
        <H3 color={C.green}>Recommended Legal Partners (UK)</H3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { name: "Bates Wells LLP", spec: "UK's leading co-operative & charity law firm", url: "bateswells.co.uk", note: "Draft your society rules and offer document" },
            { name: "Anthony Collins Solicitors", spec: "Social enterprise & co-op specialists", url: "anthonycollins.com", note: "Birmingham-based, strong on mutuals law" },
            { name: "Co-operatives UK", spec: "Model rules, templates, sector body", url: "uk.coop", note: "Free initial guidance. Community Shares Unit." },
          ].map((l, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 14, border: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ color: C.green, fontSize: 13, fontWeight: 700 }}>{l.name}</div>
              <div style={{ color: "#6B7280", fontSize: 11, margin: "4px 0" }}>{l.spec}</div>
              <div style={{ color: "#4B5563", fontSize: 11 }}>{l.url}</div>
              <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 6 }}>{l.note}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
const TABS = [
  { id: "diaspora", label: "Investor Returns", icon: "💷" },
  { id: "farmer", label: "Farmer Journey", icon: "🌾" },
  { id: "compliance", label: "Legal Compliance", icon: "⚖️" },
];

export default function App() {
  const [tab, setTab] = useState("diaspora");

  return (
    <div style={{ minHeight: "100vh", background: "#080E08", fontFamily: "'DM Sans','Segoe UI',sans-serif", color: "#F9FAFB" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0D140D; } ::-webkit-scrollbar-thumb { background: #2D3D2D; border-radius: 4px; }
        select option { background: #111; color: #f9fafb; }
        input[type=range] { cursor: pointer; height: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, zIndex: 100, padding: "0 28px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", alignItems: "center", height: 58 }}>
          <div>
            <div style={{ color: C.amber, fontSize: 15, fontWeight: 800, fontFamily: "'Playfair Display',serif" }}>AgriVenture Zimbabwe</div>
            <div style={{ color: "#2D3D2D", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Mupandawana · Chatsworth · Zimuto</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                background: tab === t.id ? "rgba(245,158,11,0.15)" : "transparent",
                color: tab === t.id ? C.amber : "#4B5563",
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "32px 28px 80px" }}>
        {tab === "diaspora" && <DiasporaReturns />}
        {tab === "farmer" && <PeasantFarmer />}
        {tab === "compliance" && <Compliance />}
      </div>
    </div>
  );
}
