import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── DATA ENGINE ───────────────────────────────────────────────────────────────

const CROPS = {
  citrus: {
    name: "Citrus (Oranges/Valencia)",
    emoji: "🍊",
    color: "#F97316",
    suitability: "HIGH",
    region: "Lower Gutu / Mutirikwi lowlands",
    lifespan: 28,
    firstRevenue: 3,
    fullProduction: 5,
    yieldKgHa: 45000,
    pricePerKg: 0.55,
    exportMode: "Sea Freight",
    markets: ["UAE", "Saudi Arabia", "Zambia", "DRC", "Mozambique", "Angola"],
    costPerHa: {
      establishment: 3800,
      annualOps: 2200,
      irrigation: 1800,
      inputs: 900,
      labour: 1400,
      postHarvest: 600,
      logistics: 800,
    },
    valueAdd: ["Fresh juice (US$2.80/L)", "Citrus oil (US$12/kg)", "Dried peel (US$4/kg)", "Marmalade (US$3.50/jar)"],
    lifecycle: [
      { phase: "Nursery", months: "M1–12", activity: "Graft Washington Navel / Valencia scions on certified rootstock. 12 months nursery growth." },
      { phase: "Land Prep & Planting", months: "Y1", activity: "Deep-plough 60cm, add 40t/ha compost. Plant at 5×3m (667 trees/ha). Install drip irrigation." },
      { phase: "Establishment", months: "Y1–3", activity: "Daily drip irrigation. Shape pruning only. NPK fertigation monthly. Phosphonate drenches for Phytophthora prevention." },
      { phase: "First Harvest", months: "Y3–4", activity: "Navel: May–Aug. Valencia: Aug–Oct. Partial yield ~15,000 kg/ha." },
      { phase: "Full Production", months: "Y5–25", activity: "45,000 kg/ha. Wash, wax, grade (AA/A/B). 15kg cartons. Pre-cool to 6°C. Sea freight to UAE/Africa." },
      { phase: "Renovation", months: "Every 8Y", activity: "Selective limb removal, soil nutrition refresh, replant gaps." },
      { phase: "End of Life", months: "Y28+", activity: "Replant cycle. Timber sold. Land restores. Full replant of new certified stock." },
    ],
  },
  roses: {
    name: "Cut Roses (Export Grade)",
    emoji: "🌹",
    color: "#EC4899",
    suitability: "MEDIUM-HIGH",
    region: "Zimuto highlands / Irrigated plots",
    lifespan: 8,
    firstRevenue: 0.4,
    fullProduction: 1,
    yieldKgHa: null,
    stemsPerHa: 800000,
    pricePerStem: 0.22,
    exportMode: "Airfreight",
    markets: ["UAE", "Netherlands", "UK", "Saudi Arabia", "South Africa", "Russia"],
    costPerHa: {
      establishment: 18000,
      annualOps: 8500,
      irrigation: 3200,
      inputs: 3800,
      labour: 4200,
      postHarvest: 2400,
      logistics: 6000,
    },
    valueAdd: ["Dried roses (US$18/kg)", "Rose water (US$8/250ml)", "Rose hip oil (US$28/100ml)", "Potpourri (US$5/pack)"],
    lifecycle: [
      { phase: "Infrastructure", months: "M1–2", activity: "Shade netting (40%), drip irrigation, cold room (2–4°C). Grading hall. Packing shed." },
      { phase: "Planting", months: "M2–3", activity: "Source grafted certified cuttings. Plant in prepared beds. pH 5.5–6.5. Loamy, well-drained soil." },
      { phase: "Establishment", months: "M3–4", activity: "Daily drip irrigation. Fortnightly blackspot / aphid spray. Weekly NPK fertigation." },
      { phase: "First Harvest", months: "M5", activity: "Cut at stage 0–1 (bud coloured, no petal open). 45° cut. Immediately into 500ppm citric acid buckets. Cold room within 2 hours." },
      { phase: "Continuous Production", months: "Ongoing", activity: "7–10 harvests/year. Each flush 35–50 days. Graded by stem: 40/50/60/70cm. 20-stem bunches. Export cartons." },
      { phase: "Annual Hard Prune", months: "July", activity: "Cut back 40–50%. Stimulates Valentine's Day / Christmas flushes. Soil nutrition refresh." },
      { phase: "Replant", months: "Y8", activity: "Full replant. New certified cuttings. Infrastructure reused." },
    ],
  },
  avocado: {
    name: "Avocado (Hass)",
    emoji: "🥑",
    color: "#16A34A",
    suitability: "MEDIUM",
    region: "Zimuto kopje areas / Elevated farms",
    lifespan: 22,
    firstRevenue: 4,
    fullProduction: 6,
    yieldKgHa: 15000,
    pricePerKg: 1.40,
    exportMode: "Sea Freight",
    markets: ["UAE", "Saudi Arabia", "China", "Netherlands", "UK", "Mauritius", "DRC"],
    costPerHa: {
      establishment: 5200,
      annualOps: 2800,
      irrigation: 2000,
      inputs: 1200,
      labour: 1600,
      postHarvest: 700,
      logistics: 900,
    },
    valueAdd: ["Avocado oil (US$22/500ml)", "Guacamole paste (US$6/250g)", "Avocado butter (US$18/100ml)", "Frozen puree (US$3.50/kg)"],
    lifecycle: [
      { phase: "Windbreak Establishment", months: "6M before planting", activity: "Plant eucalyptus / grevillea windbreaks. Avocados are highly wind-sensitive." },
      { phase: "Nursery & Planting", months: "Y1", activity: "Grafted Hass on Lula rootstock. Plant 8×5m (250 trees/ha). Deep 1m³ holes enriched with compost and superphosphate." },
      { phase: "Establishment", months: "Y1–3", activity: "Regular irrigation. Phosphonate drenches monthly for Phytophthora. Light shape pruning only." },
      { phase: "First Harvest", months: "Y4–5", activity: "Hass ripens May–August. Harvest by pole-and-bag. Avoid any bruising. Fruit hardens as it ripens off tree." },
      { phase: "Full Production", months: "Y6–20", activity: "15,000 kg/ha. Grade by size (Class 1/2/3). 4kg or 10kg export cartons. Sea freight — 4-6 weeks shelf life when harvested hard." },
      { phase: "Alternate Bearing Management", months: "Ongoing", activity: "Avocados naturally alternate heavy/light years. Manage with aggressive pruning in heavy years. Irrigation critical in off years." },
      { phase: "Replant", months: "Y22+", activity: "Stagger replanting across orchards to maintain continuous cash flow." },
    ],
  },
  blueberry: {
    name: "Blueberries",
    emoji: "🫐",
    color: "#7C3AED",
    suitability: "MEDIUM",
    region: "Higher elevation / Zimuto north",
    lifespan: 15,
    firstRevenue: 3,
    fullProduction: 4,
    yieldKgHa: 10000,
    pricePerKg: 6.00,
    exportMode: "Airfreight",
    markets: ["UAE", "Germany", "Netherlands", "UK", "Singapore", "Malaysia", "Saudi Arabia"],
    costPerHa: {
      establishment: 28000,
      annualOps: 12000,
      irrigation: 4000,
      inputs: 5000,
      labour: 5500,
      postHarvest: 3000,
      logistics: 8000,
    },
    valueAdd: ["Frozen blueberries (US$4.50/kg)", "Blueberry juice (US$5.50/L)", "Dried blueberries (US$22/kg)", "Jam (US$4.50/jar)"],
    lifecycle: [
      { phase: "Soil Preparation", months: "M1–3", activity: "Acidify soil to pH 4.5–5.5. Add pine bark / peat. Raised beds. Drip irrigation essential — sensitive to both drought and waterlogging." },
      { phase: "Planting", months: "M3–4", activity: "Tissue-culture certified plants. 1.5×3m spacing (2,222 plants/ha). Remove ALL flower buds Year 1 to force vegetative structure." },
      { phase: "Establishment", months: "Y1–2", activity: "Ammonium sulphate nitrogen (acidifying). No commercial harvest. Build plant architecture for long-term yield." },
      { phase: "First Commercial Harvest", months: "Y3 Apr–Oct", activity: "Zimbabwe's season April–October. Peak August–October. 60% of crop in this window — counter-season to northern hemisphere = premium pricing." },
      { phase: "Full Production", months: "Y4–15 May–Oct", activity: "10,000 kg/ha. All export — no domestic market in Zimbabwe for blueberries. Pack in punnets (125g, 250g). Cold chain from farm to airfreight. 100% forex." },
      { phase: "Replant", months: "Y15+", activity: "Staggered replanting. Soil restoration with organic matter before new planting." },
    ],
  },
  vegetables: {
    name: "Baby Vegetables (Premium Export)",
    emoji: "🥦",
    color: "#059669",
    suitability: "VERY HIGH",
    region: "All irrigated plots — immediate start",
    lifespan: "Perennial rotation",
    firstRevenue: 0.25,
    fullProduction: 0.25,
    yieldKgHa: 18000,
    pricePerKg: 2.80,
    exportMode: "Airfreight",
    markets: ["UAE", "Saudi Arabia", "DRC", "Zambia", "Botswana", "South Africa", "Tanzania", "Rwanda"],
    costPerHa: {
      establishment: 2200,
      annualOps: 6800,
      irrigation: 1200,
      inputs: 2400,
      labour: 2800,
      postHarvest: 800,
      logistics: 3200,
    },
    valueAdd: ["Frozen veg (US$3.80/kg)", "Dehydrated veg (US$12/kg)", "Ready-to-cook packs (US$5/kg)", "Baby food puree (US$8/kg)"],
    lifecycle: [
      { phase: "Seedbed", months: "Wk 1–4", activity: "Sow in seedling trays. Germination 7–10 days. Harden seedlings 3–4 weeks before transplant." },
      { phase: "Transplant", months: "Wk 4–5", activity: "Transplant into drip-irrigated prepared beds. Baby corn, fine beans, courgette, cherry tomato, mangetout." },
      { phase: "Vegetative Growth", months: "Wk 5–8", activity: "Irrigate every 2 days. Weekly NPK fertigation. Spray for aphids, whitefly, Fusarium. Stake tomatoes." },
      { phase: "Harvest", months: "Wk 9–16", activity: "Harvest weekly over 6–8 weeks. Baby corn 55–65 days. Fine beans 50–60 days. Courgette 50 days." },
      { phase: "Post-Harvest", months: "Same day", activity: "Wash. Cold water hydrocooling. Pack in export punnets / clamshells. Pre-cool to 4°C. Airfreight within 24–48 hours." },
      { phase: "Replant Cycle", months: "3 cycles/year", activity: "February / June / October planting slots. 3 full cycles per year per hectare." },
    ],
  },
};

const COLD_CHAIN = [
  { stage: "Farm Harvest", temp: "Ambient", time: "0h", action: "Harvest at dawn. Immediately into pre-cooling solution or shade.", icon: "🌾" },
  { stage: "Hydrocooling", temp: "2–5°C", time: "1–2h", action: "Cold water bath for vegetables. Forced-air cooling for flowers and berries.", icon: "💧" },
  { stage: "Pack House", temp: "6–10°C", time: "2–4h", action: "Grade, sort, pack. 15kg citrus cartons / 125g blueberry punnets / 5kg veg boxes.", icon: "📦" },
  { stage: "Cold Room Storage", temp: "2–8°C", time: "12–48h", action: "Centralised cold room at aggregation hub (10 tonne capacity minimum).", icon: "🏭" },
  { stage: "Refrigerated Transport", temp: "4–8°C", time: "4–8h", action: "Reefer truck to Harare Airport or Beit Bridge (for road freight to SA).", icon: "🚛" },
  { stage: "Airport Handling", temp: "4–8°C", time: "2–4h", action: "Pre-clearance phytosanitary inspection. Airfreight palletisation. Export documentation.", icon: "✈️" },
  { stage: "Destination Cold Chain", temp: "2–6°C", time: "Transit", action: "Dubai / Lusaka / Johannesburg receiving cold rooms. Distribution to retailers.", icon: "🏪" },
];

const VALUE_ADDITION_CHAIN = [
  { level: "L1 Raw", margin: "1×", example: "Fresh orange sold at farm gate", price: "$0.15/kg" },
  { level: "L2 Graded & Packed", margin: "2.5×", example: "Washed, waxed, graded in export carton", price: "$0.55/kg" },
  { level: "L3 Processed", margin: "6×", example: "Fresh-squeezed pasteurised juice", price: "$2.80/L" },
  { level: "L4 Refined", margin: "18×", example: "Cold-pressed citrus essential oil", price: "$12/kg" },
  { level: "L5 Branded Retail", margin: "35×", example: "Branded 'Zimbabwe Gold' gift set", price: "$28/unit" },
];

const INVESTMENT_TIERS = [
  { name: "Seed Investor", monthly: 50, annual: 600, perk: "Digital certificate + crop updates", return: "8% annual", currency: "£" },
  { name: "Field Partner", monthly: 100, annual: 1200, perk: "Named hectare + quarterly reports", return: "12% annual", currency: "£" },
  { name: "Harvest Partner", monthly: 250, annual: 3000, perk: "Farm visit + 15% profit share", return: "15% annual", currency: "£" },
  { name: "Export Anchor", monthly: 1000, annual: 12000, perk: "Board seat + 20% profit share", return: "20% annual", currency: "£" },
];

const AFRICAN_MARKETS = [
  { country: "DRC Congo", pop: 105, deficit: "Fruits & Veg", opportunity: "Very High", distance: "2,200km" },
  { country: "Tanzania", pop: 64, deficit: "Premium Produce", opportunity: "High", distance: "1,400km" },
  { country: "Zambia", pop: 20, deficit: "Citrus & Avocado", opportunity: "Very High", distance: "580km" },
  { country: "Botswana", pop: 2.6, deficit: "Fresh Veg", opportunity: "High", distance: "620km" },
  { country: "Mozambique", pop: 33, deficit: "Citrus & Nuts", opportunity: "High", distance: "620km" },
  { country: "Angola", pop: 35, deficit: "Fruits & Oil", opportunity: "Very High", distance: "1,900km" },
  { country: "Rwanda", pop: 14, deficit: "Premium Veg", opportunity: "High", distance: "2,400km" },
  { country: "Ethiopia", pop: 128, deficit: "Avocado Oil", opportunity: "Medium", distance: "3,200km" },
  { country: "UAE", pop: 11, deficit: "All Premium", opportunity: "Very High", distance: "5,200km" },
  { country: "Saudi Arabia", pop: 36, deficit: "Fresh Produce", opportunity: "Very High", distance: "5,800km" },
  { country: "China", pop: 1400, deficit: "Macadamia & Avo", opportunity: "High", distance: "9,500km" },
];

// ─── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────

function buildFinancials(crop, hectares) {
  const c = CROPS[crop];
  const years = Array.from({ length: Math.min(c.lifespan === "Perennial rotation" ? 10 : c.lifespan, 30) }, (_, i) => i + 1);
  
  return years.map(yr => {
    let yieldFactor = 0;
    if (yr < c.firstRevenue) yieldFactor = 0;
    else if (yr < c.fullProduction) yieldFactor = (yr - c.firstRevenue) / (c.fullProduction - c.firstRevenue) * 0.7 + 0.1;
    else yieldFactor = Math.min(1, 0.85 + (yr - c.fullProduction) * 0.03);

    let grossRevenue;
    if (c.stemsPerHa) {
      grossRevenue = c.stemsPerHa * c.pricePerStem * yieldFactor * hectares;
    } else {
      grossRevenue = c.yieldKgHa * c.pricePerKg * yieldFactor * hectares;
    }

    const opCost = (yr === 1
      ? Object.values(c.costPerHa).reduce((a, b) => a + b, 0)
      : c.costPerHa.annualOps + c.costPerHa.irrigation + c.costPerHa.inputs + c.costPerHa.labour + c.costPerHa.postHarvest + c.costPerHa.logistics
    ) * hectares;

    const netProfit = grossRevenue - opCost;
    const margin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

    return {
      year: `Y${yr}`,
      revenue: Math.round(grossRevenue),
      cost: Math.round(opCost),
      profit: Math.round(netProfit),
      margin: parseFloat(margin),
      cumulative: 0,
    };
  }).map((row, i, arr) => ({
    ...row,
    cumulative: arr.slice(0, i + 1).reduce((s, r) => s + r.profit, 0),
  }));
}

const fmt = (n) => n >= 1000000
  ? `$${(n / 1000000).toFixed(2)}M`
  : n >= 1000
  ? `$${(n / 1000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "crops", label: "Crop Lifecycles", icon: "🌱" },
  { id: "financials", label: "Financials", icon: "📈" },
  { id: "farmer", label: "Farmer Portal", icon: "🌾" },
  { id: "invest", label: "Invest / Diaspora", icon: "💷" },
  { id: "markets", label: "Markets", icon: "🌍" },
  { id: "coldchain", label: "Cold Chain", icon: "❄️" },
  { id: "schedule", label: "Book Meeting", icon: "📅" },
];

const COLORS = ["#F97316", "#EC4899", "#16A34A", "#7C3AED", "#059669", "#0EA5E9", "#EAB308", "#EF4444"];

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
      padding: "16px 20px",
    }}>
      <div style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{value}</div>
      {sub && <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ color: "#F59E0B", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>AgriVenture Zimbabwe</div>
      <h2 style={{ color: "#F9FAFB", fontSize: 32, fontWeight: 700, fontFamily: "'Playfair Display', serif", margin: 0 }}>{title}</h2>
      {sub && <p style={{ color: "#9CA3AF", fontSize: 15, marginTop: 8, maxWidth: 680 }}>{sub}</p>}
    </div>
  );
}

// ─── SECTIONS ──────────────────────────────────────────────────────────────────

function Overview() {
  const investmentData = [
    { month: "M1", investors: 50, capital: 5000 },
    { month: "M6", investors: 200, capital: 20000 },
    { month: "M12", investors: 500, capital: 50000 },
    { month: "M18", investors: 750, capital: 75000 },
    { month: "M24", investors: 1200, capital: 120000 },
    { month: "M36", investors: 2000, capital: 200000 },
  ];

  const revenueProjection = [
    { year: "Y1", citrus: 0, roses: 85000, avocado: 0, vegetables: 48000, blueberry: 0 },
    { year: "Y2", citrus: 0, roses: 170000, avocado: 0, vegetables: 96000, blueberry: 0 },
    { year: "Y3", citrus: 62000, roses: 176000, avocado: 0, vegetables: 144000, blueberry: 35000 },
    { year: "Y4", citrus: 148000, roses: 176000, avocado: 42000, vegetables: 192000, blueberry: 120000 },
    { year: "Y5", citrus: 247500, roses: 176000, avocado: 125000, vegetables: 240000, blueberry: 180000 },
    { year: "Y7", citrus: 330000, roses: 352000, avocado: 200000, vegetables: 288000, blueberry: 240000 },
    { year: "Y10", citrus: 495000, roses: 528000, avocado: 294000, vegetables: 360000, blueberry: 360000 },
  ];

  return (
    <div>
      <SectionHeader
        title="AgriVenture Zimbabwe"
        sub="A cooperative export-agriculture platform connecting Gutu District landowners, African diaspora capital, and global premium food markets — creating circular wealth across the Mupandawana–Chatsworth–Zimuto corridor."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        <StatCard label="Target Corridor" value="3 Districts" sub="Gutu / Mupandawana / Zimuto" color="#F59E0B" />
        <StatCard label="500 Investors × £100/mo" value="£600K/yr" sub="Diaspora crowdfund capital" color="#10B981" />
        <StatCard label="Peak Annual Revenue" value="$2.4M+" sub="at full 10-year production" color="#F97316" />
        <StatCard label="Addressable Markets" value="11 Countries" sub="Africa + Middle East + Asia" color="#7C3AED" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 40 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ color: "#F9FAFB", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>10-Year Revenue Projection by Crop (US$)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueProjection}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#6B7280" fontSize={11} />
              <YAxis stroke="#6B7280" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8, color: "#F9FAFB" }} />
              <Legend />
              <Area type="monotone" dataKey="citrus" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.7} name="Citrus" />
              <Area type="monotone" dataKey="roses" stackId="1" stroke="#EC4899" fill="#EC4899" fillOpacity={0.7} name="Roses" />
              <Area type="monotone" dataKey="avocado" stackId="1" stroke="#16A34A" fill="#16A34A" fillOpacity={0.7} name="Avocado" />
              <Area type="monotone" dataKey="vegetables" stackId="1" stroke="#059669" fill="#059669" fillOpacity={0.7} name="Vegetables" />
              <Area type="monotone" dataKey="blueberry" stackId="1" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.7} name="Blueberries" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ color: "#F9FAFB", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Diaspora Capital Growth</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={investmentData}>
              <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v => `£${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }} formatter={v => [`£${v.toLocaleString()}`]} />
              <Line type="monotone" dataKey="capital" stroke="#F59E0B" strokeWidth={2} dot={false} name="Monthly Capital" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(245,158,11,0.1)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ color: "#F59E0B", fontSize: 13, fontWeight: 600 }}>500 Investors @ £100/month</div>
            <div style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>= £50,000/month = £600,000/year</div>
            <div style={{ color: "#9CA3AF", fontSize: 12 }}>Enough to establish 15ha Year 1</div>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.08))", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 28 }}>
        <h3 style={{ color: "#F59E0B", fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>The Wealth Engine</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { who: "Rural Farmers", what: "Land + Labour", get: "Income from redundant land + profit share + capacity building" },
            { who: "Diaspora Investors", what: "Capital (£100+/mo)", get: "8–20% returns + pride of ownership + food security mission" },
            { who: "AgriVenture Engine", what: "Management + Export", get: "Management fees + equity + market premiums" },
            { who: "UAE / Global Buyers", what: "Premium prices", get: "Consistent supply of certified, traceable African produce" },
            { who: "African Markets", what: "Competitive pricing", get: "Regional food security + reduced import dependency" },
            { who: "Zimbabwe Govt", what: "Tax revenue", get: "Forex earnings + employment + rural development" },
          ].map((item, i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 16 }}>
              <div style={{ color: "#F59E0B", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{item.who}</div>
              <div style={{ color: "#6B7280", fontSize: 11, marginBottom: 6 }}>Contributes: {item.what}</div>
              <div style={{ color: "#D1D5DB", fontSize: 12 }}>{item.get}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CropLifecycles() {
  const [selected, setSelected] = useState("citrus");
  const crop = CROPS[selected];

  const radarData = Object.keys(CROPS).map(k => ({
    crop: CROPS[k].name.split(" ")[0],
    suitability: k === "citrus" ? 95 : k === "roses" ? 72 : k === "avocado" ? 65 : k === "blueberry" ? 60 : 90,
    speed: k === "vegetables" ? 100 : k === "roses" ? 85 : k === "blueberry" ? 55 : k === "citrus" ? 45 : 40,
    margin: k === "blueberry" ? 90 : k === "roses" ? 78 : k === "avocado" ? 72 : k === "citrus" ? 65 : 60,
    risk: k === "vegetables" ? 30 : k === "citrus" ? 35 : k === "avocado" ? 50 : k === "roses" ? 55 : 65,
    lifespan: k === "citrus" ? 95 : k === "avocado" ? 80 : k === "blueberry" ? 55 : k === "roses" ? 30 : 20,
  }));

  return (
    <div>
      <SectionHeader title="Crop Lifecycle Analysis" sub="Full growing cycle, agronomic requirements, and phase-by-phase management for the Mupandawana–Chatsworth–Zimuto corridor." />

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {Object.entries(CROPS).map(([k, c]) => (
          <button key={k} onClick={() => setSelected(k)} style={{
            padding: "8px 16px", borderRadius: 20, border: `2px solid ${selected === k ? c.color : "rgba(255,255,255,0.1)"}`,
            background: selected === k ? c.color + "22" : "transparent",
            color: selected === k ? c.color : "#9CA3AF", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
          }}>
            {c.emoji} {c.name.split(" ")[0]}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 24, border: `1px solid ${crop.color}33` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{crop.emoji}</div>
          <h3 style={{ color: crop.color, fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif", margin: "0 0 4px" }}>{crop.name}</h3>
          <div style={{ color: "#9CA3AF", fontSize: 13, marginBottom: 20 }}>{crop.region}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Suitability", crop.suitability],
              ["First Revenue", `Year ${crop.firstRevenue}`],
              ["Full Production", `Year ${crop.fullProduction}`],
              ["Lifespan", crop.lifespan === "Perennial rotation" ? "Perpetual" : `${crop.lifespan} years`],
              ["Yield", crop.stemsPerHa ? `${(crop.stemsPerHa/1000).toFixed(0)}K stems/ha` : `${(crop.yieldKgHa/1000).toFixed(0)}t/ha`],
              ["Export Mode", crop.exportMode],
            ].map(([l, v]) => (
              <div key={l} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ color: "#6B7280", fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
                <div style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Value Addition Ladder</h4>
          {crop.valueAdd.map((v, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: crop.color + "33", border: `1px solid ${crop.color}`, display: "flex", alignItems: "center", justifyContent: "center", color: crop.color, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>L{i + 2}</div>
              <div style={{ color: "#D1D5DB", fontSize: 13 }}>{v}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>Target export markets:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {crop.markets.map(m => (
                <span key={m} style={{ fontSize: 11, padding: "3px 8px", background: crop.color + "22", color: crop.color, borderRadius: 10 }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
        <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Phase-by-Phase Lifecycle</h4>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${crop.color}, transparent)` }} />
          {crop.lifecycle.map((phase, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: 20, paddingLeft: 44, position: "relative" }}>
              <div style={{ position: "absolute", left: 8, top: 4, width: 18, height: 18, borderRadius: "50%", background: crop.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000", fontWeight: 700 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ color: crop.color, fontSize: 13, fontWeight: 700 }}>{phase.phase}</span>
                  <span style={{ color: "#6B7280", fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 10 }}>{phase.months}</span>
                </div>
                <div style={{ color: "#9CA3AF", fontSize: 13 }}>{phase.activity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Financials() {
  const [crop, setCrop] = useState("citrus");
  const [hectares, setHectares] = useState(5);
  const data = buildFinancials(crop, hectares);
  const c = CROPS[crop];
  const peakYear = data.reduce((best, r) => r.profit > best.profit ? r : best, data[0]);
  const totalLifetimeProfit = data.reduce((s, r) => s + r.profit, 0);
  const breakeven = data.find(r => r.cumulative > 0);

  const costBreakdown = Object.entries(c.costPerHa)
    .filter(([k]) => k !== "establishment")
    .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'), value: Math.round(v * hectares) }));

  return (
    <div>
      <SectionHeader title="Financial Analysis" sub="Per-hectare economics, profitability curves, cost breakdown, and lifetime returns for each crop in the corridor." />

      <div style={{ display: "flex", gap: 16, marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(CROPS).map(([k, c]) => (
            <button key={k} onClick={() => setCrop(k)} style={{
              padding: "7px 14px", borderRadius: 16, border: `2px solid ${crop === k ? c.color : "rgba(255,255,255,0.1)"}`,
              background: crop === k ? c.color + "22" : "transparent",
              color: crop === k ? c.color : "#9CA3AF", cursor: "pointer", fontSize: 12, fontWeight: 600,
            }}>
              {c.emoji} {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <span style={{ color: "#9CA3AF", fontSize: 13 }}>Hectares:</span>
          <input type="range" min={1} max={50} value={hectares} onChange={e => setHectares(+e.target.value)}
            style={{ width: 120, accentColor: c.color }} />
          <span style={{ color: c.color, fontWeight: 700, fontSize: 16, minWidth: 40 }}>{hectares}ha</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Peak Year Profit" value={fmt(peakYear.profit)} sub={`in ${peakYear.year}`} color={c.color} />
        <StatCard label="Breakeven Point" value={breakeven ? breakeven.year : "N/A"} sub="Cumulative profit turns positive" color="#10B981" />
        <StatCard label="Lifetime Profit" value={fmt(totalLifetimeProfit)} sub={`over ${data.length} years`} color="#F59E0B" />
        <StatCard label="First Year Cost" value={fmt(Object.values(c.costPerHa).reduce((a, b) => a + b, 0) * hectares)} sub="Full establishment" color="#EF4444" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Revenue vs Cost vs Profit — {hectares}ha {c.name}</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, color: "#F9FAFB" }} formatter={v => [`$${v.toLocaleString()}`]} />
              <Legend />
              <Bar dataKey="revenue" fill={c.color} fillOpacity={0.8} name="Revenue" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cost" fill="#EF4444" fillOpacity={0.6} name="Cost" radius={[2, 2, 0, 0]} />
              <Bar dataKey="profit" fill="#10B981" fillOpacity={0.8} name="Profit" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Annual Cost Split</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" nameKey="name">
                {costBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, color: "#F9FAFB" }} formatter={v => [`$${v.toLocaleString()}`]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {costBreakdown.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9CA3AF" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                {item.name}: ${(item.value / 1000).toFixed(1)}K
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
        <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Cumulative Profit Curve (US$)</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.slice(0, 20)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" stroke="#6B7280" fontSize={10} />
            <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, color: "#F9FAFB" }} formatter={v => [`$${v.toLocaleString()}`]} />
            <defs>
              <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={c.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="cumulative" stroke={c.color} fill="url(#cumGrad)" strokeWidth={2} name="Cumulative Profit" />
            <Line type="monotone" dataKey="margin" stroke="#F59E0B" strokeWidth={1} strokeDasharray="4 2" name="Margin %" yAxisId={1} hide />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FarmerPortal() {
  const [form, setForm] = useState({ name: "", phone: "", location: "", landSize: "", waterSource: "borehole", cropChoice: "citrus", landType: "a2", experience: "none" });
  const [submitted, setSubmitted] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleSubmit = () => {
    if (!form.name || !form.landSize) return;
    const c = CROPS[form.cropChoice];
    const ha = parseFloat(form.landSize) || 1;
    const data = buildFinancials(form.cropChoice, ha);
    const peak = data.reduce((b, r) => r.profit > b.profit ? r : b, data[0]);
    setAnalysis({ crop: c, hectares: ha, peak, breakeven: data.find(r => r.cumulative > 0), data });
    setSubmitted(true);
  };

  const inp = (label, key, type = "text", options = null) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: "#9CA3AF", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      {options ? (
        <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{
          width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8, color: "#F9FAFB", fontSize: 14, outline: "none",
        }}>
          {options.map(([v, l]) => <option key={v} value={v} style={{ background: "#111" }}>{l}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
          placeholder={`Enter ${label.toLowerCase()}`}
          style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#F9FAFB", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  return (
    <div>
      <SectionHeader title="Farmer Registration Portal" sub="Register your land, water access, and crop preference. Our team will assess your suitability and connect you to the cooperative network." />

      {!submitted ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 28, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#F9FAFB", fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Your Land Profile</h3>
            {inp("Full Name", "name")}
            {inp("Phone / WhatsApp", "phone")}
            {inp("Location (Village / Area)", "location")}
            {inp("Land Size (Hectares)", "landSize", "number")}
            {inp("Water Source", "waterSource", "select", [
              ["borehole", "Borehole (existing)"],
              ["river", "River / Stream Access"],
              ["dam", "Dam / Reservoir"],
              ["none", "None (need installation)"],
              ["municipal", "Municipal / ZINWA"],
            ])}
            {inp("Land Type", "landType", "select", [
              ["a1", "A1 Resettlement"],
              ["a2", "A2 Medium Farm"],
              ["communal", "Communal Land"],
              ["commercial", "Commercial Farm"],
            ])}
            {inp("Prior Farming Experience", "experience", "select", [
              ["none", "None — starting fresh"],
              ["subsistence", "Subsistence farming"],
              ["commercial", "Some commercial experience"],
              ["expert", "Experienced commercial farmer"],
            ])}
            {inp("Preferred Crop", "cropChoice", "select", Object.entries(CROPS).map(([k, c]) => [k, `${c.emoji} ${c.name}`]))}

            <button onClick={handleSubmit} style={{
              width: "100%", padding: "14px", background: "linear-gradient(135deg, #F59E0B, #F97316)", border: "none",
              borderRadius: 8, color: "#000", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 8,
            }}>
              Calculate My Returns →
            </button>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 28, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#F9FAFB", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>What Joining Means</h3>
            {[
              ["🌱", "AgriVenture installs irrigation and provides inputs on credit", "No upfront cash needed from you"],
              ["📊", "We handle all export logistics, compliance, and buyer relationships", "You focus on growing"],
              ["💵", "Revenue split: 60% farmer, 40% cooperative (covers input repayment)", "After repayment: 75% / 25%"],
              ["📱", "Monthly SMS updates on your crop status and payments", "Full transparency"],
              ["🌍", "Your produce goes to UAE, Zambia, DRC, Saudi Arabia and more", "Premium international prices"],
              ["🤝", "Capacity building and AGRITEX training provided", "Upskill as you earn"],
            ].map(([icon, title, sub], i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 18, padding: "12px 16px", background: "rgba(245,158,11,0.05)", borderRadius: 8, border: "1px solid rgba(245,158,11,0.1)" }}>
                <div style={{ fontSize: 24 }}>{icon}</div>
                <div>
                  <div style={{ color: "#F9FAFB", fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
            <StatCard label="Your Land" value={`${form.landSize} ha`} sub={`${analysis.crop.name}`} color={analysis.crop.color} />
            <StatCard label="Peak Annual Profit" value={fmt(analysis.peak.profit)} sub={`in ${analysis.peak.year}`} color="#10B981" />
            <StatCard label="Breakeven" value={analysis.breakeven ? analysis.breakeven.year : "Y6+"} sub="Cumulative profit positive" color="#F59E0B" />
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
            <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Your Projected Returns (US$) — {form.name}</h4>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analysis.data.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#6B7280" fontSize={10} />
                <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }} formatter={v => [`$${v.toLocaleString()}`]} />
                <Bar dataKey="revenue" fill={analysis.crop.color} fillOpacity={0.7} name="Revenue" />
                <Bar dataKey="profit" fill="#10B981" fillOpacity={0.8} name="Your 60% Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button onClick={() => setSubmitted(false)} style={{ padding: "10px 24px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>
            ← Register Another Farm
          </button>
        </div>
      )}
    </div>
  );
}

function InvestPortal() {
  const [investors, setInvestors] = useState(500);
  const [monthly, setMonthly] = useState(100);
  const totalMonthly = investors * monthly;
  const totalAnnual = totalMonthly * 12;

  const deploymentData = [
    { name: "Irrigation Infrastructure", pct: 30, color: "#0EA5E9" },
    { name: "Planting Stock & Inputs", pct: 25, color: "#16A34A" },
    { name: "Cold Chain Equipment", pct: 20, color: "#7C3AED" },
    { name: "Pack House & Grading", pct: 12, color: "#F97316" },
    { name: "Export Logistics", pct: 8, color: "#EC4899" },
    { name: "Working Capital Reserve", pct: 5, color: "#F59E0B" },
  ];

  const growthData = Array.from({ length: 36 }, (_, m) => ({
    month: `M${m + 1}`,
    investors: Math.min(investors, Math.round(50 + (investors - 50) * (m / 35) * (1 + Math.sin(m / 3) * 0.1))),
    capital: Math.min(totalMonthly, Math.round((50 + (investors - 50) * (m / 35)) * monthly)),
    cumulative: Math.round((50 + (investors - 50) * (m / 35)) * monthly * (m + 1) * 0.7),
  }));

  return (
    <div>
      <SectionHeader title="Diaspora Investment Portal" sub="Every pound from the African diaspora becomes a seed for generational wealth on African soil. Transparent, traceable, meaningful returns." />

      <div style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(16,185,129,0.1))", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: 28, marginBottom: 28 }}>
        <h3 style={{ color: "#F59E0B", fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>Model the Impact</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label style={{ color: "#9CA3AF", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Number of Investors</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <input type="range" min={10} max={5000} value={investors} onChange={e => setInvestors(+e.target.value)} style={{ flex: 1, accentColor: "#F59E0B" }} />
              <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: 20, minWidth: 60 }}>{investors.toLocaleString()}</span>
            </div>
          </div>
          <div>
            <label style={{ color: "#9CA3AF", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Monthly Contribution (£)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <input type="range" min={25} max={1000} step={25} value={monthly} onChange={e => setMonthly(+e.target.value)} style={{ flex: 1, accentColor: "#10B981" }} />
              <span style={{ color: "#10B981", fontWeight: 700, fontSize: 20, minWidth: 60 }}>£{monthly}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
          <div style={{ textAlign: "center", padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10 }}>
            <div style={{ color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Monthly Capital</div>
            <div style={{ color: "#F59E0B", fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>£{totalMonthly.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10 }}>
            <div style={{ color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Annual Capital</div>
            <div style={{ color: "#10B981", fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>£{totalAnnual.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: "center", padding: 16, background: "rgba(0,0,0,0.3)", borderRadius: 10 }}>
            <div style={{ color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Hectares Possible Y1</div>
            <div style={{ color: "#7C3AED", fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{Math.floor(totalAnnual / 5000)}ha</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {INVESTMENT_TIERS.map((tier, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: `1px solid ${COLORS[i]}44`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: COLORS[i] }} />
            <div style={{ color: COLORS[i], fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{tier.name}</div>
            <div style={{ color: "#F9FAFB", fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{tier.currency}{tier.monthly}<span style={{ fontSize: 12, color: "#6B7280" }}>/mo</span></div>
            <div style={{ color: "#9CA3AF", fontSize: 12, margin: "8px 0" }}>{tier.currency}{tier.annual.toLocaleString()}/year</div>
            <div style={{ color: "#10B981", fontSize: 13, fontWeight: 600 }}>{tier.return}</div>
            <div style={{ color: "#6B7280", fontSize: 12, marginTop: 8 }}>{tier.perk}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Capital Deployment Plan</h4>
          {deploymentData.map((item, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#D1D5DB", fontSize: 12 }}>{item.name}</span>
                <span style={{ color: item.color, fontSize: 12, fontWeight: 600 }}>{item.pct}%</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Investor Growth Curve (36 months)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData.filter((_, i) => i % 3 === 0)}>
              <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
              <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v => `£${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }} formatter={v => [`£${v.toLocaleString()}`]} />
              <defs>
                <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="capital" stroke="#F59E0B" fill="url(#capGrad)" strokeWidth={2} name="Monthly Capital" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Markets() {
  const opportunityColor = { "Very High": "#10B981", "High": "#F59E0B", "Medium": "#F97316" };

  const marketData = AFRICAN_MARKETS.map(m => ({
    ...m,
    score: m.opportunity === "Very High" ? 90 + Math.random() * 10 : m.opportunity === "High" ? 70 + Math.random() * 15 : 50 + Math.random() * 15,
  }));

  const cropMarketMatrix = [
    { crop: "Citrus", uae: 95, zambia: 90, drc: 85, saudi: 80, china: 50, uk: 60, botswana: 88 },
    { crop: "Roses", uae: 90, zambia: 40, drc: 30, saudi: 85, china: 50, uk: 95, botswana: 35 },
    { crop: "Avocado", uae: 88, zambia: 70, drc: 60, saudi: 82, china: 90, uk: 85, botswana: 65 },
    { crop: "Blueberry", uae: 85, zambia: 20, drc: 15, saudi: 75, china: 60, uk: 90, botswana: 25 },
    { crop: "Vegetables", uae: 80, zambia: 95, drc: 98, saudi: 70, china: 20, uk: 55, botswana: 90 },
  ];

  return (
    <div>
      <SectionHeader title="Global Market Intelligence" sub="The world eats. Africa's 1.5 billion population is the fastest-growing food market on earth. Your corridor sits at the crossroads." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="African Population 2030" value="1.7 Billion" sub="Fastest growing food demand on earth" color="#F59E0B" />
        <StatCard label="UAE Food Import Value" value="$20B+/yr" sub="95% imported — massive deficit" color="#F97316" />
        <StatCard label="DRC Food Deficit" value="Critical" sub="105M people, minimal local production" color="#10B981" />
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
        <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Target Market Opportunity Map</h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["Market", "Population (M)", "Key Deficit", "Opportunity", "Distance", "Access"].map(h => (
                  <th key={h} style={{ color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, padding: "8px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AFRICAN_MARKETS.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ color: "#F9FAFB", fontSize: 13, fontWeight: 600, padding: "10px 12px" }}>{m.country}</td>
                  <td style={{ color: "#9CA3AF", fontSize: 13, padding: "10px 12px" }}>{m.pop}M</td>
                  <td style={{ color: "#D1D5DB", fontSize: 12, padding: "10px 12px" }}>{m.deficit}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ color: opportunityColor[m.opportunity], fontSize: 12, fontWeight: 600, background: opportunityColor[m.opportunity] + "22", padding: "2px 8px", borderRadius: 10 }}>{m.opportunity}</span>
                  </td>
                  <td style={{ color: "#6B7280", fontSize: 12, padding: "10px 12px" }}>{m.distance}</td>
                  <td style={{ color: "#9CA3AF", fontSize: 12, padding: "10px 12px" }}>
                    {m.distance.replace("km", "").replace(",", "") < 1000 ? "Road + Sea" : m.country === "UAE" || m.country === "Saudi Arabia" || m.country === "China" ? "Air + Sea" : "Road + Air"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
        <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Crop × Market Suitability Score</h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={cropMarketMatrix} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" domain={[0, 100]} stroke="#6B7280" fontSize={10} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="crop" stroke="#6B7280" fontSize={12} width={70} />
            <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }} formatter={v => [`${v}%`]} />
            <Legend />
            <Bar dataKey="uae" name="UAE" fill="#F97316" radius={[0, 2, 2, 0]} />
            <Bar dataKey="zambia" name="Zambia" fill="#10B981" radius={[0, 2, 2, 0]} />
            <Bar dataKey="drc" name="DRC" fill="#0EA5E9" radius={[0, 2, 2, 0]} />
            <Bar dataKey="saudi" name="Saudi" fill="#F59E0B" radius={[0, 2, 2, 0]} />
            <Bar dataKey="botswana" name="Botswana" fill="#7C3AED" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ColdChain() {
  const lossData = [
    { crop: "Tomatoes", withoutCC: 45, withCC: 8 },
    { crop: "Roses", withoutCC: 80, withCC: 5 },
    { crop: "Blueberries", withoutCC: 60, withCC: 4 },
    { crop: "Avocados", withoutCC: 35, withCC: 6 },
    { crop: "Citrus", withoutCC: 25, withCC: 3 },
    { crop: "Baby Veg", withoutCC: 55, withCC: 7 },
  ];

  return (
    <div>
      <SectionHeader title="Cold Chain & Value Addition" sub="Zimbabwe loses an estimated 40–60% of annual horticulture produce to post-harvest losses. Cold chain infrastructure is not cost — it is the entire revenue unlock." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Annual Produce Lost in Zimbabwe" value="$180M+" sub="Without cold chain infrastructure" color="#EF4444" />
        <StatCard label="Revenue Recovery with Cold Chain" value="3–8×" sub="Per kilogram of produce preserved" color="#10B981" />
        <StatCard label="Cold Room Required (Hub)" value="10 Tonne" sub="Minimum for export-grade aggregation" color="#0EA5E9" />
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
        <h4 style={{ color: "#F9FAFB", fontSize: 15, fontWeight: 600, marginBottom: 24 }}>The Cold Chain: Farm to Export Market</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {COLD_CHAIN.map((stage, i) => (
            <div key={i} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 20, width: 40 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${200 + i * 20}, 70%, 45%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{stage.icon}</div>
                {i < COLD_CHAIN.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 20 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ color: "#F9FAFB", fontSize: 13, fontWeight: 600 }}>{stage.stage}</span>
                  <span style={{ color: "#0EA5E9", fontSize: 11, background: "rgba(14,165,233,0.15)", padding: "2px 8px", borderRadius: 10 }}>{stage.temp}</span>
                  <span style={{ color: "#6B7280", fontSize: 11 }}>⏱ {stage.time}</span>
                </div>
                <div style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>{stage.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Post-Harvest Loss: With vs Without Cold Chain (%)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lossData} layout="vertical">
              <XAxis type="number" domain={[0, 90]} stroke="#6B7280" fontSize={10} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="crop" stroke="#6B7280" fontSize={11} width={65} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }} formatter={v => [`${v}%`]} />
              <Legend />
              <Bar dataKey="withoutCC" name="Without Cold Chain" fill="#EF4444" fillOpacity={0.7} radius={[0, 3, 3, 0]} />
              <Bar dataKey="withCC" name="With Cold Chain" fill="#10B981" fillOpacity={0.8} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h4 style={{ color: "#F9FAFB", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Value Addition Multiplier Chain</h4>
          {VALUE_ADDITION_CHAIN.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, padding: "10px 14px", background: `rgba(${i * 40}, ${120 - i * 15}, ${80 + i * 30}, 0.1)`, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS[i], minWidth: 30 }}>{item.level}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#D1D5DB", fontSize: 12 }}>{item.example}</div>
                <div style={{ color: "#6B7280", fontSize: 11, marginTop: 1 }}>{item.price}</div>
              </div>
              <div style={{ color: "#10B981", fontSize: 13, fontWeight: 700 }}>{item.margin}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 12, padding: 20 }}>
        <h4 style={{ color: "#0EA5E9", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Hub Infrastructure Requirements (Mupandawana Aggregation Centre)</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            ["Cold Room", "10 tonne capacity, 2–8°C", "$18,000–25,000"],
            ["Grading Hall", "Covered, 200m² minimum", "$8,000–12,000"],
            ["Solar Power", "15kW system for cold room", "$22,000–30,000"],
            ["Packing Line", "Manual + semi-auto", "$5,000–8,000"],
            ["Borehole + Tank", "40,000L JoJo + pump", "$6,000–9,000"],
            ["Reefer Transport", "Shared / contracted", "$800–1,200/trip"],
          ].map(([name, desc, cost], i) => (
            <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 14 }}>
              <div style={{ color: "#0EA5E9", fontSize: 13, fontWeight: 600 }}>{name}</div>
              <div style={{ color: "#9CA3AF", fontSize: 12, margin: "4px 0" }}>{desc}</div>
              <div style={{ color: "#F9FAFB", fontSize: 13, fontWeight: 700 }}>{cost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MeetingScheduler() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "farmer", country: "", topic: "general", date: "", time: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const TOPICS = [
    ["general", "General Enquiry"],
    ["farmer_join", "Join as Farmer / Landowner"],
    ["investor_diaspora", "Diaspora Investment"],
    ["uae_buyer", "UAE / Middle East Buyer"],
    ["african_buyer", "African Market Buyer"],
    ["partnership", "Strategic Partnership"],
    ["funding", "Funding / Grant Proposal"],
    ["cold_chain", "Cold Chain / Infrastructure"],
    ["export_logistics", "Export & Logistics"],
  ];

  const TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

  const inp = (label, key, type = "text", options = null, placeholder = "") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: "#9CA3AF", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{label}</label>
      {options ? (
        <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#F9FAFB", fontSize: 13, outline: "none" }}>
          {options.map(([v, l]) => <option key={v} value={v} style={{ background: "#111" }}>{l}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} rows={3}
          style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#F9FAFB", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
          style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#F9FAFB", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.date) return;
    setSubmitted(true);
  };

  const topicLabel = TOPICS.find(([v]) => v === form.topic)?.[1] || "";

  return (
    <div>
      <SectionHeader title="Book a Meeting" sub="Whether you are a farmer with land, a diaspora investor, a UAE buyer, or a potential partner — let's talk. Every great enterprise starts with a conversation." />

      {!submitted ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 28, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#F9FAFB", fontSize: 15, fontWeight: 600, marginBottom: 22 }}>Your Details</h3>
            {inp("Full Name", "name", "text", null, "Your name")}
            {inp("Email Address", "email", "email", null, "your@email.com")}
            {inp("WhatsApp / Phone", "phone", "text", null, "+263 or +44...")}
            {inp("Country / Location", "country", "text", null, "Zimbabwe / UK / UAE...")}
            {inp("I am a...", "role", "select", [
              ["farmer", "Farmer / Landowner"],
              ["investor", "Diaspora Investor"],
              ["uae_buyer", "UAE / Gulf Buyer"],
              ["african_buyer", "African Buyer / Distributor"],
              ["partner", "Potential Partner / NGO"],
              ["govt", "Government / Regulatory Body"],
              ["media", "Media / Press"],
            ])}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 28, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ color: "#F9FAFB", fontSize: 15, fontWeight: 600, marginBottom: 22 }}>Meeting Details</h3>
            {inp("Topic / Purpose", "topic", "select", TOPICS)}
            {inp("Preferred Date", "date", "date")}
            {inp("Preferred Time (CAT)", "time", "select", [["", "Select time..."], ...TIMES.map(t => [t, t + " (Central Africa Time)"])])}
            {inp("Additional Notes", "message", "textarea", null, "Tell us about your land, investment interest, buying requirements...")}

            <button onClick={handleSubmit} style={{
              width: "100%", padding: "14px", background: "linear-gradient(135deg, #F59E0B, #F97316)",
              border: "none", borderRadius: 8, color: "#000", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4,
            }}>
              Request Meeting →
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 40px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(16,185,129,0.3)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h3 style={{ color: "#10B981", fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Meeting Requested!</h3>
          <p style={{ color: "#9CA3AF", fontSize: 15, maxWidth: 480, margin: "0 auto 24px" }}>
            Thank you, <strong style={{ color: "#F9FAFB" }}>{form.name}</strong>. Your request for a <strong style={{ color: "#F9FAFB" }}>{topicLabel}</strong> meeting on <strong style={{ color: "#F9FAFB" }}>{form.date} at {form.time}</strong> has been received.
          </p>
          <p style={{ color: "#6B7280", fontSize: 13 }}>We will confirm via email to <strong style={{ color: "#9CA3AF" }}>{form.email}</strong> within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} style={{ marginTop: 24, padding: "10px 28px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>
            ← Book Another Meeting
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 28 }}>
        {[
          { icon: "📞", label: "WhatsApp", value: "+263 77 XXX XXXX" },
          { icon: "📧", label: "Email", value: "info@agriventure.co.zw" },
          { icon: "🌐", label: "Website", value: "agriventure.co.zw" },
          { icon: "📍", label: "Office", value: "Mupandawana Growth Point" },
        ].map((c, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ color: "#6B7280", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{c.label}</div>
            <div style={{ color: "#D1D5DB", fontSize: 12, marginTop: 2 }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  const [active, setActive] = useState("overview");

  const SECTION_MAP = {
    overview: <Overview />,
    crops: <CropLifecycles />,
    financials: <Financials />,
    farmer: <FarmerPortal />,
    invest: <InvestPortal />,
    markets: <Markets />,
    coldchain: <ColdChain />,
    schedule: <MeetingScheduler />,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0F0A",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#F9FAFB",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        input[type=range] { cursor: pointer; }
        select option { background: #1a1a1a; color: #f9fafb; }
      `}</style>

      {/* Header */}
      <div style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 100, padding: "0 24px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", alignItems: "center", gap: 20, height: 60 }}>
          <div>
            <div style={{ color: "#F59E0B", fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif", letterSpacing: -0.5 }}>AgriVenture Zimbabwe</div>
            <div style={{ color: "#4B5563", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Gutu · Mupandawana · Chatsworth · Zimuto</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 2, flexWrap: "wrap" }}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)} style={{
                padding: "6px 12px", borderRadius: 6, border: "none",
                background: active === item.id ? "rgba(245,158,11,0.15)" : "transparent",
                color: active === item.id ? "#F59E0B" : "#6B7280",
                cursor: "pointer", fontSize: 12, fontWeight: active === item.id ? 600 : 400,
                transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
              }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ display: window.innerWidth > 900 ? "inline" : "none" }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero strip */}
      <div style={{ background: "linear-gradient(90deg, #0A1A0A, #0F1F0A, #0A150A)", borderBottom: "1px solid rgba(245,158,11,0.15)", padding: "12px 24px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", gap: 32, overflowX: "auto" }}>
          {[
            ["🌍", "Gutu District", "Zimbabwe"],
            ["🌾", "5 Export Crops", "Citrus · Roses · Avocado · Blueberry · Veg"],
            ["💷", "£600K/year", "500 × £100/month diaspora capital"],
            ["✈️", "11 Markets", "UAE · Saudi · DRC · Zambia · China + more"],
            ["❄️", "Cold Chain", "Harvest-to-market traceability"],
          ].map(([icon, title, sub]) => (
            <div key={title} style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ color: "#F9FAFB", fontSize: 12, fontWeight: 600 }}>{title}</div>
                <div style={{ color: "#4B5563", fontSize: 11 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "36px 24px 80px" }}>
        {SECTION_MAP[active]}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ color: "#374151", fontSize: 12 }}>AgriVenture Zimbabwe — Unlocking Africa's Agricultural Potential · Mupandawana–Chatsworth–Zimuto Corridor · Gutu District, Masvingo Province</div>
      </div>
    </div>
  );
}
