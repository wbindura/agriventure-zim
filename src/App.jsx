import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── COLOUR PALETTE ────────────────────────────────────────────────────────────
const C = { amber: "#F59E0B", orange: "#F97316", green: "#10B981", purple: "#7C3AED", blue: "#0EA5E9", pink: "#EC4899", teal: "#14B8A6", red: "#EF4444", lime: "#84CC16" };
const COLORS = ["#F97316","#EC4899","#16A34A","#7C3AED","#059669","#0EA5E9","#EAB308","#EF4444"];

// ─── SHARED CROP DATA (v2 model — used by Diaspora, Farmer, Financials) ────────
const CROPS = {
  vegetables: {
    name: "Baby Vegetables", emoji: "🥦", color: C.green,
    firstRevenue: 0.25, fullProd: 0.25, lifespan: "Perpetual",
    yieldKgHa: 18000, price: 2.80, establishCost: 2200, annualCost: 11200,
    peasant90Days: { desc: "3 cycles/year", y1: 3200, y3: 7800, y5: 11400, y10: 14800, y50: 18200 },
    valueAdd: ["Frozen veg $3.80/kg","Dehydrated $12/kg","Baby food puree $8/kg"],
    markets: ["UAE","DRC","Zambia","Botswana","Saudi"],
  },
  citrus: {
    name: "Citrus (Oranges)", emoji: "🍊", color: C.orange,
    firstRevenue: 3, fullProd: 5, lifespan: 28,
    yieldKgHa: 45000, price: 0.55, establishCost: 3800, annualCost: 7700,
    peasant90Days: { desc: "Harvest May–Aug", y1: 0, y3: 4200, y5: 12600, y10: 19800, y50: 24000 },
    valueAdd: ["Fresh juice $2.80/L","Citrus oil $12/kg","Marmalade $3.50/jar"],
    markets: ["UAE","Saudi","Zambia","DRC","Mozambique"],
  },
  roses: {
    name: "Export Roses", emoji: "🌹", color: C.pink,
    firstRevenue: 0.4, fullProd: 1, lifespan: 8,
    stemsHa: 800000, stemPrice: 0.22, establishCost: 18000, annualCost: 24100,
    peasant90Days: { desc: "Continuous harvest", y1: 8400, y3: 28000, y5: 36000, y10: 48000, y50: 52000 },
    valueAdd: ["Rose water $8/250ml","Rose hip oil $28/100ml","Dried roses $18/kg"],
    markets: ["UAE","UK","Saudi","Netherlands","Russia"],
  },
  avocado: {
    name: "Avocado (Hass)", emoji: "🥑", color: C.teal,
    firstRevenue: 4, fullProd: 6, lifespan: 22,
    yieldKgHa: 15000, price: 1.40, establishCost: 5200, annualCost: 9200,
    peasant90Days: { desc: "Harvest May–Aug", y1: 0, y3: 0, y5: 8400, y10: 16800, y50: 21000 },
    valueAdd: ["Avocado oil $22/500ml","Guacamole $6/250g","Frozen puree $3.50/kg"],
    markets: ["UAE","Saudi","China","UK","Mauritius"],
  },
  blueberry: {
    name: "Blueberries", emoji: "🫐", color: C.purple,
    firstRevenue: 3, fullProd: 4, lifespan: 15,
    yieldKgHa: 10000, price: 6.00, establishCost: 28000, annualCost: 37500,
    peasant90Days: { desc: "Apr–Oct season", y1: 0, y3: 9600, y5: 36000, y10: 48000, y50: 52000 },
    valueAdd: ["Frozen $4.50/kg","Juice $5.50/L","Dried $22/kg"],
    markets: ["UAE","Germany","Netherlands","UK","Singapore"],
  },
};

// ─── PLATFORM CROP DATA (used by Lifecycle, Full Financials, Cold Chain) ───────
const PLATFORM_CROPS = {
  citrus: {
    name:"Citrus (Oranges/Valencia)", emoji:"🍊", color:"#F97316", suitability:"HIGH",
    region:"Lower Gutu / Mutirikwi lowlands", lifespan:28, firstRevenue:3, fullProduction:5,
    yieldKgHa:45000, pricePerKg:0.55, exportMode:"Sea Freight",
    markets:["UAE","Saudi Arabia","Zambia","DRC","Mozambique","Angola"],
    costPerHa:{ establishment:3800, annualOps:2200, irrigation:1800, inputs:900, labour:1400, postHarvest:600, logistics:800 },
    valueAdd:["Fresh juice (US$2.80/L)","Citrus oil (US$12/kg)","Dried peel (US$4/kg)","Marmalade (US$3.50/jar)"],
    lifecycle:[
      {phase:"Nursery",months:"M1–12",activity:"Graft Washington Navel / Valencia scions on certified rootstock. 12 months nursery growth."},
      {phase:"Land Prep & Planting",months:"Y1",activity:"Deep-plough 60cm, add 40t/ha compost. Plant at 5×3m (667 trees/ha). Install drip irrigation."},
      {phase:"Establishment",months:"Y1–3",activity:"Daily drip irrigation. Shape pruning only. NPK fertigation monthly. Phosphonate drenches for Phytophthora prevention."},
      {phase:"First Harvest",months:"Y3–4",activity:"Navel: May–Aug. Valencia: Aug–Oct. Partial yield ~15,000 kg/ha."},
      {phase:"Full Production",months:"Y5–25",activity:"45,000 kg/ha. Wash, wax, grade (AA/A/B). 15kg cartons. Pre-cool to 6°C. Sea freight to UAE/Africa."},
      {phase:"Renovation",months:"Every 8Y",activity:"Selective limb removal, soil nutrition refresh, replant gaps."},
      {phase:"End of Life",months:"Y28+",activity:"Replant cycle. Timber sold. Land restores. Full replant of new certified stock."},
    ],
  },
  roses: {
    name:"Cut Roses (Export Grade)", emoji:"🌹", color:"#EC4899", suitability:"MEDIUM-HIGH",
    region:"Zimuto highlands / Irrigated plots", lifespan:8, firstRevenue:0.4, fullProduction:1,
    stemsPerHa:800000, pricePerStem:0.22, exportMode:"Airfreight",
    markets:["UAE","Netherlands","UK","Saudi Arabia","South Africa","Russia"],
    costPerHa:{ establishment:18000, annualOps:8500, irrigation:3200, inputs:3800, labour:4200, postHarvest:2400, logistics:6000 },
    valueAdd:["Dried roses (US$18/kg)","Rose water (US$8/250ml)","Rose hip oil (US$28/100ml)","Potpourri (US$5/pack)"],
    lifecycle:[
      {phase:"Infrastructure",months:"M1–2",activity:"Shade netting (40%), drip irrigation, cold room (2–4°C). Grading hall. Packing shed."},
      {phase:"Planting",months:"M2–3",activity:"Source grafted certified cuttings. Plant in prepared beds. pH 5.5–6.5. Loamy, well-drained soil."},
      {phase:"Establishment",months:"M3–4",activity:"Daily drip irrigation. Fortnightly blackspot / aphid spray. Weekly NPK fertigation."},
      {phase:"First Harvest",months:"M5",activity:"Cut at stage 0–1 (bud coloured, no petal open). 45° cut. Immediately into 500ppm citric acid buckets. Cold room within 2 hours."},
      {phase:"Continuous Production",months:"Ongoing",activity:"7–10 harvests/year. Each flush 35–50 days. Graded by stem: 40/50/60/70cm. 20-stem bunches. Export cartons."},
      {phase:"Annual Hard Prune",months:"July",activity:"Cut back 40–50%. Stimulates Valentine's Day / Christmas flushes. Soil nutrition refresh."},
      {phase:"Replant",months:"Y8",activity:"Full replant. New certified cuttings. Infrastructure reused."},
    ],
  },
  avocado: {
    name:"Avocado (Hass)", emoji:"🥑", color:"#14B8A6", suitability:"MEDIUM",
    region:"Zimuto kopje areas / Elevated farms", lifespan:22, firstRevenue:4, fullProduction:6,
    yieldKgHa:15000, pricePerKg:1.40, exportMode:"Sea Freight",
    markets:["UAE","Saudi Arabia","China","Netherlands","UK","Mauritius","DRC"],
    costPerHa:{ establishment:5200, annualOps:2800, irrigation:2000, inputs:1200, labour:1600, postHarvest:700, logistics:900 },
    valueAdd:["Avocado oil (US$22/500ml)","Guacamole paste (US$6/250g)","Avocado butter (US$18/100ml)","Frozen puree (US$3.50/kg)"],
    lifecycle:[
      {phase:"Windbreak Establishment",months:"6M before planting",activity:"Plant eucalyptus / grevillea windbreaks. Avocados are highly wind-sensitive."},
      {phase:"Nursery & Planting",months:"Y1",activity:"Grafted Hass on Lula rootstock. Plant 8×5m (250 trees/ha). Deep 1m³ holes enriched with compost and superphosphate."},
      {phase:"Establishment",months:"Y1–3",activity:"Regular irrigation. Phosphonate drenches monthly for Phytophthora. Light shape pruning only."},
      {phase:"First Harvest",months:"Y4–5",activity:"Hass ripens May–August. Harvest by pole-and-bag. Avoid any bruising."},
      {phase:"Full Production",months:"Y6–20",activity:"15,000 kg/ha. Grade by size (Class 1/2/3). 4kg or 10kg export cartons. Sea freight — 4-6 weeks shelf life when harvested hard."},
      {phase:"Alternate Bearing",months:"Ongoing",activity:"Avocados naturally alternate heavy/light years. Manage with aggressive pruning in heavy years."},
      {phase:"Replant",months:"Y22+",activity:"Stagger replanting across orchards to maintain continuous cash flow."},
    ],
  },
  blueberry: {
    name:"Blueberries", emoji:"🫐", color:"#7C3AED", suitability:"MEDIUM",
    region:"Higher elevation / Zimuto north", lifespan:15, firstRevenue:3, fullProduction:4,
    yieldKgHa:10000, pricePerKg:6.00, exportMode:"Airfreight",
    markets:["UAE","Germany","Netherlands","UK","Singapore","Malaysia","Saudi Arabia"],
    costPerHa:{ establishment:28000, annualOps:12000, irrigation:4000, inputs:5000, labour:5500, postHarvest:3000, logistics:8000 },
    valueAdd:["Frozen blueberries (US$4.50/kg)","Blueberry juice (US$5.50/L)","Dried blueberries (US$22/kg)","Jam (US$4.50/jar)"],
    lifecycle:[
      {phase:"Soil Preparation",months:"M1–3",activity:"Acidify soil to pH 4.5–5.5. Add pine bark / peat. Raised beds. Drip irrigation essential."},
      {phase:"Planting",months:"M3–4",activity:"Tissue-culture certified plants. 1.5×3m spacing (2,222 plants/ha). Remove ALL flower buds Year 1."},
      {phase:"Establishment",months:"Y1–2",activity:"Ammonium sulphate nitrogen (acidifying). No commercial harvest. Build plant architecture."},
      {phase:"First Commercial Harvest",months:"Y3 Apr–Oct",activity:"Zimbabwe's season April–October. Peak August–October — counter-season to northern hemisphere = premium pricing."},
      {phase:"Full Production",months:"Y4–15",activity:"10,000 kg/ha. Pack in punnets (125g, 250g). Cold chain from farm to airfreight. 100% forex."},
      {phase:"Replant",months:"Y15+",activity:"Staggered replanting. Soil restoration with organic matter before new planting."},
    ],
  },
  vegetables: {
    name:"Baby Vegetables (Premium Export)", emoji:"🥦", color:"#059669", suitability:"VERY HIGH",
    region:"All irrigated plots — immediate start", lifespan:"Perpetual", firstRevenue:0.25, fullProduction:0.25,
    yieldKgHa:18000, pricePerKg:2.80, exportMode:"Airfreight",
    markets:["UAE","Saudi Arabia","DRC","Zambia","Botswana","South Africa","Tanzania","Rwanda"],
    costPerHa:{ establishment:2200, annualOps:6800, irrigation:1200, inputs:2400, labour:2800, postHarvest:800, logistics:3200 },
    valueAdd:["Frozen veg (US$3.80/kg)","Dehydrated veg (US$12/kg)","Ready-to-cook packs (US$5/kg)","Baby food puree (US$8/kg)"],
    lifecycle:[
      {phase:"Seedbed",months:"Wk 1–4",activity:"Sow in seedling trays. Germination 7–10 days. Harden seedlings 3–4 weeks before transplant."},
      {phase:"Transplant",months:"Wk 4–5",activity:"Transplant into drip-irrigated prepared beds. Baby corn, fine beans, courgette, cherry tomato, mangetout."},
      {phase:"Vegetative Growth",months:"Wk 5–8",activity:"Irrigate every 2 days. Weekly NPK fertigation. Spray for aphids, whitefly, Fusarium."},
      {phase:"Harvest",months:"Wk 9–16",activity:"Harvest weekly over 6–8 weeks. Baby corn 55–65 days. Fine beans 50–60 days. Courgette 50 days."},
      {phase:"Post-Harvest",months:"Same day",activity:"Wash. Cold water hydrocooling. Pack in export punnets / clamshells. Pre-cool to 4°C. Airfreight within 24–48 hours."},
      {phase:"Replant Cycle",months:"3 cycles/year",activity:"February / June / October planting slots. 3 full cycles per year per hectare."},
    ],
  },
};

const COLD_CHAIN = [
  {stage:"Farm Harvest",temp:"Ambient",time:"0h",action:"Harvest at dawn. Immediately into pre-cooling solution or shade.",icon:"🌾"},
  {stage:"Hydrocooling",temp:"2–5°C",time:"1–2h",action:"Cold water bath for vegetables. Forced-air cooling for flowers and berries.",icon:"💧"},
  {stage:"Pack House",temp:"6–10°C",time:"2–4h",action:"Grade, sort, pack. 15kg citrus cartons / 125g blueberry punnets / 5kg veg boxes.",icon:"📦"},
  {stage:"Cold Room Storage",temp:"2–8°C",time:"12–48h",action:"Centralised cold room at aggregation hub (10 tonne capacity minimum).",icon:"🏭"},
  {stage:"Refrigerated Transport",temp:"4–8°C",time:"4–8h",action:"Reefer truck to Harare Airport or Beit Bridge (for road freight to SA).",icon:"🚛"},
  {stage:"Airport Handling",temp:"4–8°C",time:"2–4h",action:"Pre-clearance phytosanitary inspection. Airfreight palletisation. Export documentation.",icon:"✈️"},
  {stage:"Destination Cold Chain",temp:"2–6°C",time:"Transit",action:"Dubai / Lusaka / Johannesburg receiving cold rooms. Distribution to retailers.",icon:"🏪"},
];

const VALUE_ADDITION_CHAIN = [
  {level:"L1 Raw",margin:"1×",example:"Fresh orange sold at farm gate",price:"$0.15/kg"},
  {level:"L2 Graded & Packed",margin:"2.5×",example:"Washed, waxed, graded in export carton",price:"$0.55/kg"},
  {level:"L3 Processed",margin:"6×",example:"Fresh-squeezed pasteurised juice",price:"$2.80/L"},
  {level:"L4 Refined",margin:"18×",example:"Cold-pressed citrus essential oil",price:"$12/kg"},
  {level:"L5 Branded Retail",margin:"35×",example:"Branded 'Zimbabwe Gold' gift set",price:"$28/unit"},
];

const AFRICAN_MARKETS = [
  {country:"DRC Congo",pop:105,deficit:"Fruits & Veg",opportunity:"Very High",distance:"2,200km"},
  {country:"Tanzania",pop:64,deficit:"Premium Produce",opportunity:"High",distance:"1,400km"},
  {country:"Zambia",pop:20,deficit:"Citrus & Avocado",opportunity:"Very High",distance:"580km"},
  {country:"Botswana",pop:2.6,deficit:"Fresh Veg",opportunity:"High",distance:"620km"},
  {country:"Mozambique",pop:33,deficit:"Citrus & Nuts",opportunity:"High",distance:"620km"},
  {country:"Angola",pop:35,deficit:"Fruits & Oil",opportunity:"Very High",distance:"1,900km"},
  {country:"Rwanda",pop:14,deficit:"Premium Veg",opportunity:"High",distance:"2,400km"},
  {country:"UAE",pop:11,deficit:"All Premium",opportunity:"Very High",distance:"5,200km"},
  {country:"Saudi Arabia",pop:36,deficit:"Fresh Produce",opportunity:"Very High",distance:"5,800km"},
  {country:"China",pop:1400,deficit:"Macadamia & Avo",opportunity:"High",distance:"9,500km"},
];

const INVESTMENT_TIERS = [
  {name:"Seed Investor",monthly:50,annual:600,perk:"Digital certificate + crop updates",return:"8% annual",currency:"£"},
  {name:"Field Partner",monthly:100,annual:1200,perk:"Named hectare + quarterly reports",return:"12% annual",currency:"£"},
  {name:"Harvest Partner",monthly:250,annual:3000,perk:"Farm visit + 15% profit share",return:"15% annual",currency:"£"},
  {name:"Export Anchor",monthly:1000,annual:12000,perk:"Board seat + 20% profit share",return:"20% annual",currency:"£"},
];

// ─── FINANCIAL HELPERS ─────────────────────────────────────────────────────────
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
  return Array.from({length:25},(_,i)=>{
    const yr=i+1; const {gross,cost,net}=cropRevenue(cropKey,ha,yr);
    return {year:`Y${yr}`,gross,cost,net,farmerShare:Math.max(0,net*0.6)};
  }).map((r,i,arr)=>({...r,cumFarmer:arr.slice(0,i+1).reduce((s,x)=>s+x.farmerShare,0)}));
}
function buildDiasporaReturns(monthlyGBP, numInvestors) {
  const annualPoolUSD = monthlyGBP * numInvestors * 12 * 1.27;
  const netReturnRates = [0,0.04,0.11,0.18,0.23];
  return Array.from({length:5},(_,i)=>{
    const yr=i+1;
    const capitalDeployed=annualPoolUSD*Math.min(yr,3);
    const coopNetProfit=capitalDeployed*netReturnRates[i];
    const investorPool=coopNetProfit*0.25;
    const perInvestorGBP=numInvestors>0?Math.round(investorPool/numInvestors/1.27):0;
    const roi=monthlyGBP>0?Math.round((perInvestorGBP/(monthlyGBP*12))*1000)/10:0;
    return {year:`Year ${yr}`,capitalPoolUSD:Math.round(capitalDeployed),coopNetProfit:Math.round(coopNetProfit),investorPoolUSD:Math.round(investorPool),perInvestorGBP,roi};
  });
}
function buildPlatformFinancials(cropKey, ha) {
  const c = PLATFORM_CROPS[cropKey];
  const years = Array.from({length:Math.min(typeof c.lifespan==="number"?c.lifespan:25,25)},(_,i)=>i+1);
  return years.map(yr=>{
    let yf=0;
    if(yr<c.firstRevenue) yf=0;
    else if(yr<c.fullProduction) yf=(yr-c.firstRevenue)/Math.max(c.fullProduction-c.firstRevenue,0.1)*0.7+0.1;
    else yf=Math.min(1,0.85+(yr-c.fullProduction)*0.025);
    const gross=c.stemsPerHa?c.stemsPerHa*c.pricePerStem*yf*ha:c.yieldKgHa*c.pricePerKg*yf*ha;
    const opCost=(yr===1?Object.values(c.costPerHa).reduce((a,b)=>a+b,0):c.costPerHa.annualOps+c.costPerHa.irrigation+c.costPerHa.inputs+c.costPerHa.labour+c.costPerHa.postHarvest+c.costPerHa.logistics)*ha;
    return {year:`Y${yr}`,revenue:Math.round(gross),cost:Math.round(opCost),profit:Math.round(gross-opCost)};
  }).map((r,i,arr)=>({...r,cumulative:arr.slice(0,i+1).reduce((s,x)=>s+x.profit,0)}));
}
function buildPeasantEarnings(cropKey, ha) {
  const pd = CROPS[cropKey].peasant90Days;
  return [
    {period:"90 Days",label:"First 90 Days",earning:Math.round(pd.y1*ha),note:"First cash from seasonal crops / initial flush"},
    {period:"Year 1",label:"Full Year 1",earning:Math.round(pd.y1*ha*3.5),note:"Establishment + first returns where applicable"},
    {period:"Year 3",label:"Years 1–3",earning:Math.round(pd.y3*ha),note:"Perennial crops kicking in, vegetables scaling"},
    {period:"Year 5",label:"Years 3–5",earning:Math.round(pd.y5*ha),note:"Full production on most crops"},
    {period:"Year 10",label:"Years 5–10",earning:Math.round(pd.y10*ha),note:"Diversified income streams, value addition"},
    {period:"Year 50",label:"Years 10–50",earning:Math.round(pd.y50*ha),note:"Multi-generational wealth; land appreciates"},
  ];
}
const fmt = n=>n>=1e6?`$${(n/1e6).toFixed(2)}M`:n>=1e3?`$${(n/1e3).toFixed(1)}K`:`$${Math.abs(n).toFixed(0)}`;
const fmtGBP = n=>n>=1e3?`£${(n/1e3).toFixed(1)}K`:`£${Math.abs(n).toFixed(0)}`;
const TT = {contentStyle:{background:"#1A2A1A",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#F9FAFB",fontSize:12}};

// ─── SHARED UI COMPONENTS ──────────────────────────────────────────────────────
function Card({children,style={}}){return <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:20,...style}}>{children}</div>;}
function KPI({lbl,val,sub,color=C.amber}){return(<div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${color}33`,borderLeft:`3px solid ${color}`,borderRadius:8,padding:"14px 18px"}}><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2,marginBottom:5}}>{lbl}</div><div style={{color,fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{val}</div>{sub&&<div style={{color:"#6B7280",fontSize:11,marginTop:3}}>{sub}</div>}</div>);}
function SectionHeader({title,sub}){return(<div style={{marginBottom:28}}><div style={{color:C.amber,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginBottom:6}}>AgriVenture Zimbabwe</div><h2 style={{color:"#F9FAFB",fontSize:28,fontWeight:800,fontFamily:"'Playfair Display',serif",margin:"0 0 6px"}}>{title}</h2>{sub&&<p style={{color:"#6B7280",fontSize:13,margin:0}}>{sub}</p>}</div>);}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function Overview(){
  const revenueProjection=[
    {year:"Y1",citrus:0,roses:85000,avocado:0,vegetables:48000,blueberry:0},
    {year:"Y2",citrus:0,roses:170000,avocado:0,vegetables:96000,blueberry:0},
    {year:"Y3",citrus:62000,roses:176000,avocado:0,vegetables:144000,blueberry:35000},
    {year:"Y4",citrus:148000,roses:176000,avocado:42000,vegetables:192000,blueberry:120000},
    {year:"Y5",citrus:247500,roses:176000,avocado:125000,vegetables:240000,blueberry:180000},
    {year:"Y7",citrus:330000,roses:352000,avocado:200000,vegetables:288000,blueberry:240000},
    {year:"Y10",citrus:495000,roses:528000,avocado:294000,vegetables:360000,blueberry:360000},
  ];
  return(<div>
    <SectionHeader title="AgriVenture Zimbabwe" sub="A cooperative export-agriculture platform connecting Gutu District landowners, African diaspora capital, and global premium food markets — creating circular wealth across the Mupandawana–Chatsworth–Zimuto corridor."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
      <KPI lbl="Target Corridor" val="3 Districts" sub="Gutu / Mupandawana / Zimuto" color={C.amber}/>
      <KPI lbl="500 Investors × £100/mo" val="£600K/yr" sub="Diaspora crowdfund capital" color={C.green}/>
      <KPI lbl="Peak Annual Revenue" val="$2.4M+" sub="at full 10-year production" color={C.orange}/>
      <KPI lbl="Addressable Markets" val="11 Countries" sub="Africa + Middle East + Asia" color={C.purple}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20,marginBottom:28}}>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:14,fontWeight:700,marginBottom:16}}>10-Year Revenue Projection by Crop (US$)</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueProjection}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="year" stroke="#6B7280" fontSize={11}/>
            <YAxis stroke="#6B7280" fontSize={11} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <Tooltip {...TT} formatter={v=>[`$${v.toLocaleString()}`]}/>
            <Legend/>
            <Area type="monotone" dataKey="citrus" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.7} name="Citrus"/>
            <Area type="monotone" dataKey="roses" stackId="1" stroke="#EC4899" fill="#EC4899" fillOpacity={0.7} name="Roses"/>
            <Area type="monotone" dataKey="avocado" stackId="1" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.7} name="Avocado"/>
            <Area type="monotone" dataKey="vegetables" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.7} name="Vegetables"/>
            <Area type="monotone" dataKey="blueberry" stackId="1" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.7} name="Blueberries"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:14,fontWeight:700,marginBottom:16}}>The Wealth Engine</div>
        {[["🌱","Rural Farmers","Land + Labour","Income + profit share"],["💷","Diaspora Investors","Capital (£100+/mo)","8–20% returns"],["🚀","AgriVenture Engine","Management + Export","Fees + equity"],["🌍","UAE / Global Buyers","Premium prices","Consistent certified supply"],["🌍","African Markets","Competitive pricing","Regional food security"],["🏛","Zimbabwe Govt","Tax revenue","Forex + employment"]].map(([icon,who,what,get],i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:10,padding:"8px 12px",background:"rgba(245,158,11,0.05)",borderRadius:6,border:"1px solid rgba(245,158,11,0.1)"}}>
            <span style={{fontSize:16}}>{icon}</span>
            <div><div style={{color:C.amber,fontSize:11,fontWeight:700}}>{who}</div><div style={{color:"#6B7280",fontSize:10}}>{what} → {get}</div></div>
          </div>
        ))}
      </Card>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — CROP LIFECYCLES
// ═══════════════════════════════════════════════════════════════════════════════
function CropLifecycles(){
  const [selected,setSelected]=useState("citrus");
  const crop=PLATFORM_CROPS[selected];
  return(<div>
    <SectionHeader title="Crop Lifecycle Analysis" sub="Full growing cycle, agronomic requirements, and phase-by-phase management for the corridor."/>
    <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
      {Object.entries(PLATFORM_CROPS).map(([k,c])=>(
        <button key={k} onClick={()=>setSelected(k)} style={{padding:"8px 16px",borderRadius:20,border:`2px solid ${selected===k?c.color:"rgba(255,255,255,0.1)"}`,background:selected===k?c.color+"22":"transparent",color:selected===k?c.color:"#9CA3AF",cursor:"pointer",fontSize:13,fontWeight:600}}>
          {c.emoji} {c.name.split(" ")[0]}
        </button>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
      <Card style={{border:`1px solid ${crop.color}33`}}>
        <div style={{fontSize:36,marginBottom:8}}>{crop.emoji}</div>
        <div style={{color:crop.color,fontSize:20,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:4}}>{crop.name}</div>
        <div style={{color:"#9CA3AF",fontSize:12,marginBottom:16}}>{crop.region}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Suitability",crop.suitability],["First Revenue",`Year ${crop.firstRevenue}`],["Full Production",`Year ${crop.fullProduction}`],["Lifespan",crop.lifespan==="Perpetual"?"Perpetual":`${crop.lifespan} years`],["Yield",crop.stemsPerHa?`${(crop.stemsPerHa/1000).toFixed(0)}K stems/ha`:`${(crop.yieldKgHa/1000).toFixed(0)}t/ha`],["Export Mode",crop.exportMode]].map(([l,v])=>(
            <div key={l} style={{background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"8px 12px"}}>
              <div style={{color:"#6B7280",fontSize:10,letterSpacing:1,textTransform:"uppercase"}}>{l}</div>
              <div style={{color:"#F9FAFB",fontSize:13,fontWeight:600,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:16}}>
          <div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Value Addition</div>
          {crop.valueAdd.map((v,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{color:crop.color,fontSize:11,fontWeight:700}}>L{i+2}</span><span style={{color:"#D1D5DB",fontSize:12}}>{v}</span></div>)}
        </div>
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:14,fontWeight:700,marginBottom:16}}>Phase-by-Phase Lifecycle</div>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:16,top:0,bottom:0,width:2,background:`linear-gradient(to bottom,${crop.color},transparent)`}}/>
          {crop.lifecycle.map((phase,i)=>(
            <div key={i} style={{display:"flex",gap:16,marginBottom:16,paddingLeft:40,position:"relative"}}>
              <div style={{position:"absolute",left:8,top:4,width:16,height:16,borderRadius:"50%",background:crop.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",fontWeight:700}}>{i+1}</div>
              <div>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:3}}>
                  <span style={{color:crop.color,fontSize:12,fontWeight:700}}>{phase.phase}</span>
                  <span style={{color:"#6B7280",fontSize:10,background:"rgba(255,255,255,0.05)",padding:"1px 6px",borderRadius:8}}>{phase.months}</span>
                </div>
                <div style={{color:"#9CA3AF",fontSize:12}}>{phase.activity}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — FINANCIALS
// ═══════════════════════════════════════════════════════════════════════════════
function Financials(){
  const [cropKey,setCropKey]=useState("citrus");
  const [ha,setHa]=useState(5);
  const c=PLATFORM_CROPS[cropKey];
  const data=useMemo(()=>buildPlatformFinancials(cropKey,ha),[cropKey,ha]);
  const peak=data.reduce((b,r)=>r.profit>b.profit?r:b,data[0]);
  const breakeven=data.find(r=>r.cumulative>0);
  const total=data.reduce((s,r)=>s+r.profit,0);
  const costBreakdown=Object.entries(c.costPerHa).filter(([k])=>k!=="establishment").map(([k,v])=>({name:k.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase()),value:Math.round(v*ha)}));
  return(<div>
    <SectionHeader title="Financial Analysis" sub="Per-hectare economics, profitability curves, cost breakdown, and lifetime returns."/>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20,alignItems:"center"}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {Object.entries(PLATFORM_CROPS).map(([k,cr])=>(
          <button key={k} onClick={()=>setCropKey(k)} style={{padding:"6px 14px",borderRadius:16,border:`2px solid ${cropKey===k?cr.color:"rgba(255,255,255,0.1)"}`,background:cropKey===k?cr.color+"22":"transparent",color:cropKey===k?cr.color:"#9CA3AF",cursor:"pointer",fontSize:12,fontWeight:600}}>
            {cr.emoji} {cr.name.split(" ")[0]}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginLeft:"auto"}}>
        <span style={{color:"#9CA3AF",fontSize:13}}>Hectares:</span>
        <input type="range" min={1} max={50} value={ha} onChange={e=>setHa(+e.target.value)} style={{width:120,accentColor:c.color}}/>
        <span style={{color:c.color,fontWeight:800,fontSize:16,minWidth:40}}>{ha}ha</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      <KPI lbl="Peak Year Profit" val={fmt(peak.profit)} sub={`in ${peak.year}`} color={c.color}/>
      <KPI lbl="Breakeven" val={breakeven?breakeven.year:"N/A"} sub="Cumulative profit turns positive" color={C.green}/>
      <KPI lbl="Lifetime Profit" val={fmt(total)} sub={`over ${data.length} years`} color={C.amber}/>
      <KPI lbl="Year 1 Cost" val={fmt(Object.values(c.costPerHa).reduce((a,b)=>a+b,0)*ha)} sub="Full establishment" color={C.red}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Revenue vs Cost vs Profit</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.slice(0,20)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
            <XAxis dataKey="year" stroke="#6B7280" fontSize={10}/>
            <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
            <Tooltip {...TT} formatter={v=>[`$${v.toLocaleString()}`]}/>
            <Legend/>
            <Bar dataKey="revenue" fill={c.color} fillOpacity={0.8} name="Revenue" radius={[2,2,0,0]}/>
            <Bar dataKey="cost" fill="#EF4444" fillOpacity={0.6} name="Cost" radius={[2,2,0,0]}/>
            <Bar dataKey="profit" fill="#10B981" fillOpacity={0.8} name="Profit" radius={[2,2,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Annual Cost Split</div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart><Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" nameKey="name">
            {costBreakdown.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
          </Pie><Tooltip {...TT} formatter={v=>[`$${v.toLocaleString()}`]}/></PieChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
          {costBreakdown.map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:"#9CA3AF"}}><div style={{width:7,height:7,borderRadius:2,background:COLORS[i%COLORS.length]}}/>{item.name}</div>)}
        </div>
      </Card>
    </div>
    <Card>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Cumulative Profit Curve (US$)</div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data.slice(0,20)}>
          <defs><linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c.color} stopOpacity={0.3}/><stop offset="95%" stopColor={c.color} stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
          <XAxis dataKey="year" stroke="#6B7280" fontSize={10}/>
          <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
          <Tooltip {...TT} formatter={v=>[`$${v.toLocaleString()}`]}/>
          <Area type="monotone" dataKey="cumulative" stroke={c.color} fill="url(#cumGrad)" strokeWidth={2} name="Cumulative Profit"/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — FARMER PORTAL (registration)
// ═══════════════════════════════════════════════════════════════════════════════
function FarmerPortal(){
  const [form,setForm]=useState({name:"",phone:"",location:"",landSize:"",waterSource:"borehole",cropChoice:"citrus",landType:"a2",experience:"none"});
  const [submitted,setSubmitted]=useState(false);
  const [analysis,setAnalysis]=useState(null);
  const handleSubmit=()=>{
    if(!form.name||!form.landSize)return;
    const ha=parseFloat(form.landSize)||1;
    const data=buildPlatformFinancials(form.cropChoice,ha);
    const peak=data.reduce((b,r)=>r.profit>b.profit?r:b,data[0]);
    setAnalysis({crop:PLATFORM_CROPS[form.cropChoice],hectares:ha,peak,breakeven:data.find(r=>r.cumulative>0),data});
    setSubmitted(true);
  };
  const inp=(label,key,type="text",options=null)=>(<div style={{marginBottom:14}}>
    <label style={{color:"#9CA3AF",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>
    {options?<select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#F9FAFB",fontSize:13,outline:"none"}}>
      {options.map(([v,l])=><option key={v} value={v} style={{background:"#111"}}>{l}</option>)}
    </select>:<input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={`Enter ${label.toLowerCase()}`} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#F9FAFB",fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
  </div>);
  if(submitted&&analysis)return(<div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      <KPI lbl="Your Land" val={`${form.landSize}ha`} sub={analysis.crop.name} color={analysis.crop.color}/>
      <KPI lbl="Peak Annual Profit" val={fmt(analysis.peak.profit)} sub={`in ${analysis.peak.year}`} color={C.green}/>
      <KPI lbl="Breakeven" val={analysis.breakeven?analysis.breakeven.year:"Y6+"} sub="Cumulative profit positive" color={C.amber}/>
    </div>
    <Card>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Your Projected Returns — {form.name}</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={analysis.data.slice(0,15)}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
          <XAxis dataKey="year" stroke="#6B7280" fontSize={10}/>
          <YAxis stroke="#6B7280" fontSize={10} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
          <Tooltip {...TT} formatter={v=>[`$${v.toLocaleString()}`]}/>
          <Bar dataKey="revenue" fill={analysis.crop.color} fillOpacity={0.7} name="Revenue"/>
          <Bar dataKey="profit" fill={C.green} fillOpacity={0.8} name="60% Farmer Share"/>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <button onClick={()=>setSubmitted(false)} style={{marginTop:16,padding:"9px 20px",background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"#9CA3AF",cursor:"pointer",fontSize:13}}>← Register Another Farm</button>
  </div>);
  return(<div>
    <SectionHeader title="Farmer Registration Portal" sub="Register your land, water access, and crop preference. Our team will assess your suitability and connect you to the cooperative network."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:15,fontWeight:700,marginBottom:20}}>Your Land Profile</div>
        {inp("Full Name","name")}{inp("Phone / WhatsApp","phone")}{inp("Location (Village / Area)","location")}{inp("Land Size (Hectares)","landSize","number")}
        {inp("Water Source","waterSource","select",[["borehole","Borehole (existing)"],["river","River / Stream Access"],["dam","Dam / Reservoir"],["none","None (need installation)"],["municipal","Municipal / ZINWA"]])}
        {inp("Land Type","landType","select",[["a1","A1 Resettlement"],["a2","A2 Medium Farm"],["communal","Communal Land"],["commercial","Commercial Farm"]])}
        {inp("Experience","experience","select",[["none","None — starting fresh"],["subsistence","Subsistence farming"],["commercial","Some commercial experience"],["expert","Experienced commercial farmer"]])}
        {inp("Preferred Crop","cropChoice","select",Object.entries(PLATFORM_CROPS).map(([k,c])=>[k,`${c.emoji} ${c.name}`]))}
        <button onClick={handleSubmit} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.amber},${C.orange})`,border:"none",borderRadius:8,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:6}}>Calculate My Returns →</button>
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:15,fontWeight:700,marginBottom:16}}>What Joining Means</div>
        {[["🌱","AgriVenture installs irrigation on credit","No upfront cash needed"],["📊","We handle all export logistics & buyers","You focus on growing"],["💵","Revenue split: 60% farmer / 40% coop","After repayment: 75% / 25%"],["📱","Monthly SMS updates on your crop","Full transparency"],["🌍","Your produce goes to UAE, Zambia, DRC+","Premium international prices"],["🤝","AGRITEX training provided","Upskill as you earn"]].map(([icon,title,sub],i)=>(
          <div key={i} style={{display:"flex",gap:12,marginBottom:14,padding:"10px 14px",background:"rgba(245,158,11,0.05)",borderRadius:8,border:"1px solid rgba(245,158,11,0.1)"}}>
            <span style={{fontSize:20}}>{icon}</span>
            <div><div style={{color:"#F9FAFB",fontSize:12,fontWeight:600}}>{title}</div><div style={{color:"#6B7280",fontSize:11,marginTop:2}}>{sub}</div></div>
          </div>
        ))}
      </Card>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — DIASPORA INVESTOR RETURNS
// ═══════════════════════════════════════════════════════════════════════════════
function DiasporaReturns(){
  const [monthly,setMonthly]=useState(100);
  const [investors,setInvestors]=useState(500);
  const data=useMemo(()=>buildDiasporaReturns(monthly,investors),[monthly,investors]);
  const yr5=data[4];
  return(<div>
    <SectionHeader title="Diaspora Investor Returns" sub="Profit-sharing, not just interest. Your capital grows crops. The crops generate real trade income. A defined share of that income returns to you annually."/>
    <Card style={{marginBottom:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Your monthly contribution (£)</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}><input type="range" min={25} max={1000} step={25} value={monthly} onChange={e=>setMonthly(+e.target.value)} style={{flex:1,accentColor:C.amber}}/><span style={{color:C.amber,fontWeight:800,fontSize:22,minWidth:55}}>£{monthly}</span></div>
          <div style={{color:"#4B5563",fontSize:11,marginTop:4}}>Annual: £{(monthly*12).toLocaleString()}</div></div>
        <div><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Number of investors in pool</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}><input type="range" min={50} max={5000} step={50} value={investors} onChange={e=>setInvestors(+e.target.value)} style={{flex:1,accentColor:C.green}}/><span style={{color:C.green,fontWeight:800,fontSize:22,minWidth:55}}>{investors.toLocaleString()}</span></div>
          <div style={{color:"#4B5563",fontSize:11,marginTop:4}}>Monthly pool: £{(monthly*investors).toLocaleString()}</div></div>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      <KPI lbl="Annual Pool" val={fmtGBP(monthly*investors*12)} sub="Total diaspora capital/year" color={C.amber}/>
      <KPI lbl="Your Y5 Profit Share" val={fmtGBP(yr5.perInvestorGBP)} sub="Annual profit distribution" color={C.green}/>
      <KPI lbl="Y5 Return on Capital" val={`${yr5.roi}%`} sub="of your annual £ contribution" color={C.orange}/>
      <KPI lbl="Profit Share Model" val="25%" sub="Of coop net profit to investors" color={C.purple}/>
    </div>
    <Card style={{marginBottom:20}}>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Your Returns Year by Year — Profit Share Model</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            {["Year","Coop Capital","Coop Net Profit","25% Investor Pool",`Per Investor (£${monthly}/mo)`,"ROI"].map(h=><th key={h} style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:1,padding:"8px 10px",textAlign:"left"}}>{h}</th>)}
          </tr></thead>
          <tbody>{data.map((row,i)=>(
            <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:i===4?"rgba(245,158,11,0.05)":"transparent"}}>
              <td style={{color:i===4?C.amber:"#F9FAFB",fontWeight:i===4?700:400,padding:"10px",fontSize:13}}>{row.year}{i===4?" ★":""}</td>
              <td style={{color:"#9CA3AF",padding:"10px",fontSize:13}}>£{(row.capitalPoolUSD/1.27/1000).toFixed(0)}K</td>
              <td style={{color:"#9CA3AF",padding:"10px",fontSize:13}}>{row.coopNetProfit>0?fmt(row.coopNetProfit):"—"}</td>
              <td style={{color:C.green,padding:"10px",fontSize:13,fontWeight:600}}>{row.investorPoolUSD>0?fmt(row.investorPoolUSD):"—"}</td>
              <td style={{color:C.amber,padding:"10px",fontSize:14,fontWeight:700}}>{row.perInvestorGBP>0?`£${row.perInvestorGBP.toLocaleString()}`:"Maturing"}</td>
              <td style={{padding:"10px"}}>{row.roi>0?<span style={{color:C.green,fontWeight:700,fontSize:13}}>{row.roi}%</span>:<span style={{color:"#4B5563",fontSize:12}}>Capital building</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Per-Investor Annual Profit Share (£)</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="year" stroke="#4B5563" fontSize={11}/><YAxis stroke="#4B5563" fontSize={11} tickFormatter={v=>`£${v}`}/><Tooltip {...TT} formatter={v=>[`£${v.toLocaleString()}`]}/><Bar dataKey="perInvestorGBP" fill={C.amber} radius={[4,4,0,0]} name="Profit Share (£)"/></BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Investor Pool Growth (5 Years)</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs><linearGradient id="poolG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.4}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="year" stroke="#4B5563" fontSize={11}/><YAxis stroke="#4B5563" fontSize={11} tickFormatter={v=>`£${(v/1.27/1000).toFixed(0)}K`}/>
            <Tooltip {...TT} formatter={v=>[`£${(v/1.27).toLocaleString()}`]}/><Area type="monotone" dataKey="investorPoolUSD" stroke={C.green} fill="url(#poolG)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6 — FARMER JOURNEY (peasant income)
// ═══════════════════════════════════════════════════════════════════════════════
function PeasantFarmer(){
  const [cropKey,setCropKey]=useState("vegetables");
  const [ha,setHa]=useState(1);
  const crop=CROPS[cropKey];
  const milestones=useMemo(()=>buildPeasantEarnings(cropKey,ha),[cropKey,ha]);
  const timeline=useMemo(()=>buildFarmerTimeline(cropKey,ha),[cropKey,ha]);
  const cycleData=cropKey==="vegetables"?[
    {cycle:"Cycle 1 (Feb)",gross:Math.round(ha*16800*0.3),cost:Math.round(ha*3700),net:Math.round(ha*16800*0.3-ha*3700)},
    {cycle:"Cycle 2 (Jun)",gross:Math.round(ha*16800*0.35),cost:Math.round(ha*3200),net:Math.round(ha*16800*0.35-ha*3200)},
    {cycle:"Cycle 3 (Oct)",gross:Math.round(ha*16800*0.35),cost:Math.round(ha*3300),net:Math.round(ha*16800*0.35-ha*3300)},
  ]:null;
  return(<div>
    <SectionHeader title="Farmer Income Journey" sub="From 90 days to 50 years — how a smallholder transforms idle land into generational income."/>
    <Card style={{marginBottom:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Choose your crop</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
            {Object.entries(CROPS).map(([k,c])=>(
              <button key={k} onClick={()=>setCropKey(k)} style={{padding:"6px 12px",borderRadius:16,cursor:"pointer",fontSize:12,fontWeight:600,border:`2px solid ${cropKey===k?c.color:"rgba(255,255,255,0.1)"}`,background:cropKey===k?c.color+"22":"transparent",color:cropKey===k?c.color:"#6B7280"}}>
                {c.emoji} {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Your land size (hectares)</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}><input type="range" min={0.5} max={20} step={0.5} value={ha} onChange={e=>setHa(+e.target.value)} style={{flex:1,accentColor:crop.color}}/><span style={{color:crop.color,fontWeight:800,fontSize:22,minWidth:55}}>{ha}ha</span></div>
          <div style={{color:"#4B5563",fontSize:11,marginTop:4}}>{crop.peasant90Days.desc}</div>
        </div>
      </div>
    </Card>
    {cycleData&&<Card style={{marginBottom:20}}>
      <div style={{color:crop.color,fontSize:14,fontWeight:700,marginBottom:14}}>90-Day Cash Cycles — {ha}ha Baby Vegetables</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
        {cycleData.map((c,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:14,border:`1px solid ${crop.color}33`}}>
            <div style={{color:crop.color,fontSize:12,fontWeight:700}}>{c.cycle}</div>
            <div style={{color:"#F9FAFB",fontSize:18,fontWeight:800,margin:"5px 0 2px",fontFamily:"'Playfair Display',serif"}}>{fmt(c.gross)}</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{color:C.red,fontSize:11}}>Cost: {fmt(c.cost)}</span><span style={{color:C.green,fontSize:12,fontWeight:700}}>Net: {fmt(c.net)}</span></div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={cycleData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="cycle" stroke="#4B5563" fontSize={11}/><YAxis stroke="#4B5563" fontSize={11} tickFormatter={v=>`$${(v/1000).toFixed(1)}K`}/><Tooltip {...TT} formatter={v=>[fmt(v)]}/><Legend/><Bar dataKey="gross" fill={crop.color} fillOpacity={0.7} radius={[3,3,0,0]} name="Revenue"/><Bar dataKey="cost" fill={C.red} fillOpacity={0.6} radius={[3,3,0,0]} name="Cost"/><Bar dataKey="net" fill={C.green} fillOpacity={0.8} radius={[3,3,0,0]} name="Net Profit"/></BarChart>
      </ResponsiveContainer>
    </Card>}
    <Card style={{marginBottom:20}}>
      <div style={{color:crop.color,fontSize:14,fontWeight:700,marginBottom:14}}>Income at Every Milestone — {crop.emoji} {crop.name} on {ha}ha</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:16}}>
        {milestones.map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"12px 8px",border:`1px solid ${crop.color}${i>2?"55":"22"}`,textAlign:"center"}}>
            <div style={{color:"#6B7280",fontSize:9,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{m.period}</div>
            <div style={{color:m.earning>0?crop.color:"#4B5563",fontSize:15,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{m.earning>0?fmt(m.earning):"—"}</div>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={milestones.map(m=>({name:m.period,earning:m.earning}))}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="name" stroke="#4B5563" fontSize={10}/><YAxis stroke="#4B5563" fontSize={10} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><Tooltip {...TT} formatter={v=>[fmt(v),"Annual Earnings"]}/>
          <Bar dataKey="earning" radius={[5,5,0,0]}>{milestones.map((_,i)=><Cell key={i} fill={crop.color} fillOpacity={0.3+i*0.12}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>25-Year Farmer Income Trajectory — 60% Profit Share</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={timeline}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="year" stroke="#4B5563" fontSize={10} interval={2}/><YAxis yAxisId="l" stroke="#4B5563" fontSize={10} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><YAxis yAxisId="r" orientation="right" stroke="#4B5563" fontSize={10} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/>
          <Tooltip {...TT} formatter={v=>[fmt(v)]}/><Legend/>
          <Bar yAxisId="l" dataKey="farmerShare" fill={crop.color} fillOpacity={0.7} radius={[2,2,0,0]} name="Annual Farmer Share"/>
          <Line yAxisId="r" type="monotone" dataKey="cumFarmer" stroke={C.amber} strokeWidth={2} dot={false} name="Cumulative"/>
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:12}}>
        {[["5-Year Total",fmt(timeline[4]?.cumFarmer||0),C.orange],["10-Year Total",fmt(timeline[9]?.cumFarmer||0),C.amber],["25-Year Total",fmt(timeline[24]?.cumFarmer||0),C.green]].map(([l,v,col],i)=>(
          <div key={i} style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"10px 14px",textAlign:"center"}}><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{l}</div><div style={{color:col,fontSize:18,fontWeight:800}}>{v}</div></div>
        ))}
      </div>
    </Card>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7 — INVEST / DIASPORA PORTAL
// ═══════════════════════════════════════════════════════════════════════════════
function InvestPortal(){
  const [investors,setInvestors]=useState(500);
  const [monthly,setMonthly]=useState(100);
  const totalMonthly=investors*monthly;
  const totalAnnual=totalMonthly*12;
  const deploymentData=[{name:"Irrigation Infrastructure",pct:30,color:"#0EA5E9"},{name:"Planting Stock & Inputs",pct:25,color:"#16A34A"},{name:"Cold Chain Equipment",pct:20,color:"#7C3AED"},{name:"Pack House & Grading",pct:12,color:"#F97316"},{name:"Export Logistics",pct:8,color:"#EC4899"},{name:"Working Capital Reserve",pct:5,color:"#F59E0B"}];
  return(<div>
    <SectionHeader title="Diaspora Investment Portal" sub="Every pound from the African diaspora becomes a seed for generational wealth on African soil."/>
    <Card style={{marginBottom:20,background:"linear-gradient(135deg,rgba(245,158,11,0.08),rgba(16,185,129,0.08))"}}>
      <div style={{color:C.amber,fontSize:17,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:16}}>Model the Impact</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:20}}>
        <div><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2}}>Number of Investors</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}><input type="range" min={10} max={5000} value={investors} onChange={e=>setInvestors(+e.target.value)} style={{flex:1,accentColor:C.amber}}/><span style={{color:C.amber,fontWeight:800,fontSize:20,minWidth:55}}>{investors.toLocaleString()}</span></div></div>
        <div><div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:2}}>Monthly Contribution (£)</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}><input type="range" min={25} max={1000} step={25} value={monthly} onChange={e=>setMonthly(+e.target.value)} style={{flex:1,accentColor:C.green}}/><span style={{color:C.green,fontWeight:800,fontSize:20,minWidth:55}}>£{monthly}</span></div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[["Monthly Capital",`£${totalMonthly.toLocaleString()}`,C.amber],["Annual Capital",`£${totalAnnual.toLocaleString()}`,C.green],["Hectares Y1",`${Math.floor(totalAnnual/5000)}ha`,C.purple]].map(([l,v,col],i)=>(
          <div key={i} style={{textAlign:"center",padding:14,background:"rgba(0,0,0,0.3)",borderRadius:10}}>
            <div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{l}</div>
            <div style={{color:col,fontSize:24,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {INVESTMENT_TIERS.map((tier,i)=>(
        <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:18,border:`1px solid ${COLORS[i]}44`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:COLORS[i]}}/>
          <div style={{color:COLORS[i],fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{tier.name}</div>
          <div style={{color:"#F9FAFB",fontSize:22,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>£{tier.monthly}<span style={{fontSize:11,color:"#6B7280"}}>/mo</span></div>
          <div style={{color:C.green,fontSize:12,fontWeight:600,margin:"6px 0"}}>{tier.return}</div>
          <div style={{color:"#6B7280",fontSize:11}}>{tier.perk}</div>
        </div>
      ))}
    </div>
    <Card>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Capital Deployment Plan</div>
      {deploymentData.map((item,i)=>(
        <div key={i} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:"#D1D5DB",fontSize:12}}>{item.name}</span><span style={{color:item.color,fontSize:12,fontWeight:600}}>{item.pct}%</span></div>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:`${item.pct}%`,height:"100%",background:item.color,borderRadius:4}}/></div>
        </div>
      ))}
    </Card>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8 — MARKETS
// ═══════════════════════════════════════════════════════════════════════════════
function Markets(){
  const oCol={"Very High":C.green,"High":C.amber,"Medium":C.orange};
  const cropMarketMatrix=[
    {crop:"Citrus",uae:95,zambia:90,drc:85,saudi:80,botswana:88},
    {crop:"Roses",uae:90,zambia:40,drc:30,saudi:85,botswana:35},
    {crop:"Avocado",uae:88,zambia:70,drc:60,saudi:82,botswana:65},
    {crop:"Blueberry",uae:85,zambia:20,drc:15,saudi:75,botswana:25},
    {crop:"Vegetables",uae:80,zambia:95,drc:98,saudi:70,botswana:90},
  ];
  return(<div>
    <SectionHeader title="Global Market Intelligence" sub="The world eats. Africa's 1.5 billion population is the fastest-growing food market on earth."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      <KPI lbl="African Population 2030" val="1.7 Billion" sub="Fastest growing food demand" color={C.amber}/>
      <KPI lbl="UAE Food Import Value" val="$20B+/yr" sub="95% imported — massive deficit" color={C.orange}/>
      <KPI lbl="DRC Food Deficit" val="Critical" sub="105M people, minimal local production" color={C.green}/>
    </div>
    <Card style={{marginBottom:20}}>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Target Market Opportunity Map</div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:540}}>
          <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
            {["Market","Population","Key Deficit","Opportunity","Distance"].map(h=><th key={h} style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:1,padding:"8px 10px",textAlign:"left"}}>{h}</th>)}
          </tr></thead>
          <tbody>{AFRICAN_MARKETS.map((m,i)=>(
            <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
              <td style={{color:"#F9FAFB",fontSize:13,fontWeight:600,padding:"9px 10px"}}>{m.country}</td>
              <td style={{color:"#9CA3AF",fontSize:12,padding:"9px 10px"}}>{m.pop}M</td>
              <td style={{color:"#D1D5DB",fontSize:12,padding:"9px 10px"}}>{m.deficit}</td>
              <td style={{padding:"9px 10px"}}><span style={{color:oCol[m.opportunity],fontSize:11,fontWeight:600,background:oCol[m.opportunity]+"22",padding:"2px 8px",borderRadius:10}}>{m.opportunity}</span></td>
              <td style={{color:"#6B7280",fontSize:12,padding:"9px 10px"}}>{m.distance}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
    <Card>
      <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Crop × Market Suitability Score</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={cropMarketMatrix} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/><XAxis type="number" domain={[0,100]} stroke="#6B7280" fontSize={10} tickFormatter={v=>`${v}%`}/><YAxis type="category" dataKey="crop" stroke="#6B7280" fontSize={11} width={65}/>
          <Tooltip {...TT} formatter={v=>[`${v}%`]}/><Legend/>
          <Bar dataKey="uae" name="UAE" fill="#F97316" radius={[0,2,2,0]}/><Bar dataKey="zambia" name="Zambia" fill="#10B981" radius={[0,2,2,0]}/><Bar dataKey="drc" name="DRC" fill="#0EA5E9" radius={[0,2,2,0]}/><Bar dataKey="saudi" name="Saudi" fill="#F59E0B" radius={[0,2,2,0]}/><Bar dataKey="botswana" name="Botswana" fill="#7C3AED" radius={[0,2,2,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 9 — COLD CHAIN
// ═══════════════════════════════════════════════════════════════════════════════
function ColdChain(){
  const lossData=[{crop:"Tomatoes",withoutCC:45,withCC:8},{crop:"Roses",withoutCC:80,withCC:5},{crop:"Blueberries",withoutCC:60,withCC:4},{crop:"Avocados",withoutCC:35,withCC:6},{crop:"Citrus",withoutCC:25,withCC:3},{crop:"Baby Veg",withoutCC:55,withCC:7}];
  return(<div>
    <SectionHeader title="Cold Chain & Value Addition" sub="Zimbabwe loses ~40–60% of annual horticulture produce to post-harvest losses. Cold chain infrastructure is not cost — it is the entire revenue unlock."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
      <KPI lbl="Annual Produce Lost" val="$180M+" sub="Without cold chain infrastructure" color={C.red}/>
      <KPI lbl="Revenue Recovery" val="3–8×" sub="Per kilogram preserved" color={C.green}/>
      <KPI lbl="Hub Cold Room Required" val="10 Tonne" sub="Minimum for export-grade aggregation" color={C.blue}/>
    </div>
    <Card style={{marginBottom:20}}>
      <div style={{color:"#F9FAFB",fontSize:14,fontWeight:700,marginBottom:20}}>The Cold Chain: Farm to Export Market</div>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:18,top:0,bottom:0,width:2,background:"linear-gradient(to bottom,#0EA5E9,transparent)"}}/>
        {COLD_CHAIN.map((stage,i)=>(
          <div key={i} style={{display:"flex",gap:16,marginBottom:18,paddingLeft:44,position:"relative"}}>
            <div style={{position:"absolute",left:6,top:4,width:24,height:24,borderRadius:"50%",background:`hsl(${200+i*20},70%,45%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{stage.icon}</div>
            <div>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:3}}>
                <span style={{color:"#F9FAFB",fontSize:13,fontWeight:600}}>{stage.stage}</span>
                <span style={{color:C.blue,fontSize:11,background:"rgba(14,165,233,0.15)",padding:"2px 8px",borderRadius:10}}>{stage.temp}</span>
                <span style={{color:"#6B7280",fontSize:11}}>⏱ {stage.time}</span>
              </div>
              <div style={{color:"#9CA3AF",fontSize:12}}>{stage.action}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Post-Harvest Loss: With vs Without Cold Chain (%)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={lossData} layout="vertical"><XAxis type="number" domain={[0,90]} stroke="#6B7280" fontSize={10} tickFormatter={v=>`${v}%`}/><YAxis type="category" dataKey="crop" stroke="#6B7280" fontSize={11} width={65}/><Tooltip {...TT} formatter={v=>[`${v}%`]}/><Legend/><Bar dataKey="withoutCC" name="Without Cold Chain" fill="#EF4444" fillOpacity={0.7} radius={[0,3,3,0]}/><Bar dataKey="withCC" name="With Cold Chain" fill="#10B981" fillOpacity={0.8} radius={[0,3,3,0]}/></BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:13,fontWeight:700,marginBottom:14}}>Value Addition Multiplier Chain</div>
        {VALUE_ADDITION_CHAIN.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:"9px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8,border:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{fontSize:11,fontWeight:700,color:COLORS[i],minWidth:30}}>{item.level}</div>
            <div style={{flex:1}}><div style={{color:"#D1D5DB",fontSize:12}}>{item.example}</div><div style={{color:"#6B7280",fontSize:11}}>{item.price}</div></div>
            <div style={{color:C.green,fontSize:13,fontWeight:700}}>{item.margin}</div>
          </div>
        ))}
      </Card>
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 10 — LEGAL COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════════════
function Compliance(){
  const [stage,setStage]=useState(null);
  const stages=[
    {num:1,title:"UK Co-operative Registration",risk:"CRITICAL",color:C.red,timeframe:"2–4 months",body:"Register a Co-operative Society under the Co-operative and Community Benefit Societies Act 2014 with the FCA (as registrar of mutuals). This is your primary legal vehicle for raising capital from UK-based diaspora members.",howTo:["Draft society rules — purpose, membership rights, share structure, profit distribution","Apply to FCA Mutuals team at fca.org.uk/firms/mutuals","Pay £40–£950 registration fee depending on asset size","Must have minimum 3 members at registration","Agricultural co-operatives have specific guidance under RFCCBS Chapter 6"],key:"Community shares in a registered co-operative are NOT regulated investments under FSMA. You can offer shares and profit distributions to members WITHOUT FCA authorisation.",warning:"Your promotion must still comply with contract law and not be misleading. Use the Community Shares Standard Mark for credibility."},
    {num:2,title:"Financial Promotion Rules",risk:"HIGH",color:C.orange,timeframe:"Ongoing",body:"Section 21 of FSMA 2000 makes it a criminal offence to communicate an invitation to invest unless FCA-authorised OR exempt. As a registered co-operative issuing withdrawable, non-transferable shares, you benefit from a key exemption.",howTo:["Your shares are withdrawable and non-transferable → falls OUTSIDE transferable securities → no prospectus required","You can promote your share offer to potential members WITHOUT FCA approval","All material must: clearly state risk of losing capital, include registered number, not promise guaranteed returns","DO NOT use language like 'guaranteed returns', 'risk-free', or 'fixed interest rate'","Profit share language is fine: 'investors receive a proportional share of audited annual profits'"],key:"Use the Community Shares Unit's template offer document — pre-reviewed against FCA requirements. Available at communityshares.org.uk/resources",warning:"If you invite investment from non-members, you re-enter regulated territory. Every investor MUST become a member first."},
    {num:3,title:"Zimbabwe End — Corporate Structure",risk:"HIGH",color:C.orange,timeframe:"1–3 months",body:"You need a Zimbabwe-registered private limited company (Pvt Ltd) to receive funds from the UK co-operative and operate the agricultural business.",howTo:["Register with ZIMRA and Companies Registry under COBE Act 2019","Apply for ZIMRA tax clearance","Open USD business account at CBZ, Stanbic, or Ecobank","Apply to RBZ for Capital Inflows Registration — required for FDI above $500,000","Declare all inflows on CD1 forms as foreign direct investment — NOT as remittances","Register with ZIMRA for export incentive rebates"],key:"RBZ circular on diaspora investment (2021) specifically encourages diaspora capital into agriculture. Use ZIMRA Approved Exporter status for preferential treatment.",warning:"Never route UK funds through personal accounts. Always through corporate Zimbabwe bank account with a signed investment agreement."},
    {num:4,title:"UK Money Transmission & Banking",risk:"HIGH",color:C.orange,timeframe:"1–2 months",body:"Collecting monthly contributions from multiple UK investors and transmitting to Zimbabwe requires a compliant payment channel.",howTo:["DO NOT collect cash or use personal bank accounts","Use FCA-authorised payment provider — Stripe, GoCardless, or specialist platform","For Zimbabwe transfers: use licensed IMTO — WorldRemit Business, Mukuru Business, Wise Business","Maintain full records of all transfers for 7 years (AML requirements)","If collective monthly transfers exceed £10,000, prepare a business purpose letter","Register with HMRC as High Value Dealer if individual transactions exceed £10,000"],key:"Cleanest structure: UK co-op holds Wise Business account. Members pay via GoCardless direct debit. Co-op sends quarterly tranches to Zimbabwe Pvt Ltd via Wise. Full audit trail.",warning:"Do not describe inflows as 'donations' or 'gifts' on bank forms. Always: 'inter-company investment' or 'co-operative member share capital remittance'."},
    {num:5,title:"Anti-Money Laundering (AML)",risk:"MEDIUM",color:C.amber,timeframe:"Before launch",body:"Even as a co-operative, you must have basic AML controls. The Money Laundering Regulations 2017 apply to certain financial activities.",howTo:["Implement a written AML policy (1–2 pages is fine for a small co-op)","Collect proof of identity for every member: passport/driving licence + proof of address","Keep KYC records for 5 years after membership ends","Appoint a Money Laundering Reporting Officer (MLRO)","File Suspicious Activity Reports (SARs) with the NCA if you suspect criminal funds","DO NOT accept cash contributions of any amount"],key:"Use a digital KYC tool like Veriff or Onfido (~£50/month) to automate passport verification. Makes your platform scalable and compliant as membership grows.",warning:"Failure to have AML controls is a criminal offence even for small organisations. Implementation is simple and cheap."},
    {num:6,title:"Tax — UK Side",risk:"MEDIUM",color:C.amber,timeframe:"From Y1",body:"Your UK co-operative will have tax obligations. Profit distributions to members are treated differently from dividends.",howTo:["Register the co-operative for UK Corporation Tax with HMRC","Profit share payments to members treated as 'member transactions' — taxable as income in members' hands","Members receiving profit share declare it on self-assessment as 'other income'","The co-op pays Corporation Tax (25%) on any retained profits","Apply for EIS (Enterprise Investment Scheme) — agricultural businesses can qualify","EIS gives members 30% income tax relief on investments up to £1M"],key:"EIS (Enterprise Investment Scheme) approval from HMRC is a game-changer — members get 30% income tax relief. An EIS-qualifying agricultural fund would be very attractive to diaspora.",warning:"Get an accountant who understands cooperatives and agricultural businesses. Try Co-operatives UK's list of specialist advisers."},
    {num:7,title:"Zimbabwe Agric & Export Licences",risk:"MEDIUM",color:C.lime,timeframe:"Before first export",body:"To legally export from Zimbabwe you need a specific chain of licences and registrations.",howTo:["Register as Agro-producer with Agricultural Marketing Authority (AMA) — 8 Leman Road, Harare","Apply for Export Permit from Ministry of Lands, Agriculture — Ngungunyana Building, Borrowdale Road","Obtain Phytosanitary Certificate from Plant Quarantine Services for each shipment","Register with ZimTrade as an exporter — free, gives access to market intelligence","Register with ZIMRA as an exporter — mandatory for CD1 forex declaration","Apply for GLOBALG.A.P. certification (via South Africa body)"],key:"ZimTrade runs a free 'Exporter Development Programme'. Contact: info@tradezimbabwe.com | +263 242 791512",warning:"Export permits are crop-specific and time-limited. Do not ship without a valid phytosanitary certificate — shipments will be rejected and you lose the entire load."},
    {num:8,title:"SAFE LAUNCH PATH — 100% Compliant",risk:"LOW",color:C.green,timeframe:"Recommended sequence",body:"The exact sequence to launch legally from Day 1, without FCA authorisation, without a prospectus, and without legal risk.",howTo:["MONTH 1–2: Register UK Agricultural Co-operative Society (FCA Mutuals team) · Cost: ~£170","MONTH 1–2: Register Zimbabwe Private Limited Company (COBE Act) · Cost: ~$300","MONTH 2–3: Open Wise Business account (UK) + USD business bank account (Zimbabwe)","MONTH 3: Develop share offer document using Community Shares Unit template — reviewed by Bates Wells LLP or Anthony Collins Solicitors","MONTH 4: Launch member recruitment — emphasise MEMBERSHIP first, investment second","MONTH 4–6: Collect first tranche of member share capital — transfer quarterly to Zimbabwe Pvt Ltd","MONTH 6+: Register with AMA, ZimTrade, and ZIMRA in Zimbabwe","ONGOING: Annual accounts, member meetings, profit share by independent accountant","YEAR 2+: Apply for EIS advance assurance from HMRC"],key:"Total setup cost: £2,000–£5,000 for legal/accountancy fees. Timeline to compliant launch: 4–6 months. The co-operative structure is specifically designed for community capital raising.",warning:"DO NOT start collecting money before the co-op is registered and the offer document is finalised. One week of impatience could create a criminal liability. Follow the sequence."},
  ];
  return(<div>
    <SectionHeader title="100% Compliant Fundraising" sub="You have a significant structural advantage: UK Co-operative Society community shares are specifically exempt from FSMA financial promotion rules."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      <KPI lbl="FCA Authorisation Needed?" val="NO" sub="Co-op shares are exempt from FSMA" color={C.green}/>
      <KPI lbl="Prospectus Required?" val="NO" sub="Non-transferable shares are exempt" color={C.green}/>
      <KPI lbl="Profit Sharing Allowed?" val="YES" sub="Co-op structure permits this" color={C.green}/>
      <KPI lbl="Setup Cost" val="£2–5K" sub="4–6 month compliant launch" color={C.amber}/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {stages.map((s,i)=>(
        <div key={i}>
          <div onClick={()=>setStage(stage===i?null:i)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 18px",background:stage===i?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",border:`1px solid ${stage===i?s.color+"55":"rgba(255,255,255,0.06)"}`,borderRadius:stage===i?"10px 10px 0 0":10,cursor:"pointer"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:s.color+"33",border:`2px solid ${s.color}`,display:"flex",alignItems:"center",justifyContent:"center",color:s.color,fontSize:11,fontWeight:800,flexShrink:0}}>{s.num}</div>
            <div style={{flex:1}}><span style={{color:"#F9FAFB",fontSize:13,fontWeight:600}}>{s.title}</span><span style={{color:"#4B5563",fontSize:12,marginLeft:10}}>{s.timeframe}</span></div>
            <span style={{fontSize:10,padding:"2px 8px",background:s.color+"22",color:s.color,borderRadius:10,marginRight:8}}>{s.risk}</span>
            <span style={{color:"#4B5563",fontSize:14}}>{stage===i?"▲":"▼"}</span>
          </div>
          {stage===i&&<div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${s.color}33`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:20}}>
            <p style={{color:"#9CA3AF",fontSize:13,marginBottom:14}}>{s.body}</p>
            {s.howTo.map((step,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:s.color,fontSize:12,fontWeight:700,flexShrink:0}}>→</span><span style={{color:"#D1D5DB",fontSize:13}}>{step}</span></div>)}
            <div style={{padding:"10px 14px",background:s.color+"11",border:`1px solid ${s.color}33`,borderRadius:8,margin:"12px 0 8px"}}><span style={{color:s.color,fontWeight:700,fontSize:12}}>KEY: </span><span style={{color:"#D1D5DB",fontSize:13}}>{s.key}</span></div>
            <div style={{padding:"9px 12px",background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:8}}><span style={{color:C.red,fontWeight:700,fontSize:12}}>⚠ CAUTION: </span><span style={{color:"#9CA3AF",fontSize:12}}>{s.warning}</span></div>
          </div>}
        </div>
      ))}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 11 — MEETING SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════════
function MeetingScheduler(){
  const [form,setForm]=useState({name:"",email:"",phone:"",role:"farmer",country:"",topic:"general",date:"",time:"",message:""});
  const [submitted,setSubmitted]=useState(false);
  const TOPICS=[["general","General Enquiry"],["farmer_join","Join as Farmer / Landowner"],["investor_diaspora","Diaspora Investment"],["uae_buyer","UAE / Middle East Buyer"],["african_buyer","African Market Buyer"],["partnership","Strategic Partnership"],["funding","Funding / Grant Proposal"],["cold_chain","Cold Chain / Infrastructure"],["export_logistics","Export & Logistics"]];
  const TIMES=["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];
  const inp=(label,key,type="text",options=null,placeholder="")=>(<div style={{marginBottom:14}}>
    <label style={{color:"#9CA3AF",fontSize:11,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:5}}>{label}</label>
    {options?<select value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#F9FAFB",fontSize:13,outline:"none"}}>
      {options.map(([v,l])=><option key={v} value={v} style={{background:"#111"}}>{l}</option>)}
    </select>:type==="textarea"?<textarea value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} rows={3} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#F9FAFB",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>:<input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder} style={{width:"100%",padding:"9px 12px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,color:"#F9FAFB",fontSize:13,outline:"none",boxSizing:"border-box"}}/>}
  </div>);
  if(submitted)return(<div style={{textAlign:"center",padding:"50px 30px",background:"rgba(255,255,255,0.03)",borderRadius:16,border:"1px solid rgba(16,185,129,0.3)"}}>
    <div style={{fontSize:48,marginBottom:14}}>✅</div>
    <h3 style={{color:C.green,fontSize:22,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:8}}>Meeting Requested!</h3>
    <p style={{color:"#9CA3AF",fontSize:14,maxWidth:440,margin:"0 auto 20px"}}>Thank you, <strong style={{color:"#F9FAFB"}}>{form.name}</strong>. Your request has been received. We will confirm via email to <strong style={{color:"#9CA3AF"}}>{form.email}</strong> within 24 hours.</p>
    <button onClick={()=>setSubmitted(false)} style={{padding:"9px 24px",background:"transparent",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,color:"#9CA3AF",cursor:"pointer",fontSize:13}}>← Book Another Meeting</button>
  </div>);
  return(<div>
    <SectionHeader title="Book a Meeting" sub="Whether you are a farmer with land, a diaspora investor, a UAE buyer, or a potential partner — let's talk."/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:14,fontWeight:700,marginBottom:18}}>Your Details</div>
        {inp("Full Name","name","text",null,"Your name")}{inp("Email Address","email","email",null,"your@email.com")}{inp("WhatsApp / Phone","phone","text",null,"+263 or +44...")}
        {inp("Country / Location","country","text",null,"Zimbabwe / UK / UAE...")}
        {inp("I am a...","role","select",[["farmer","Farmer / Landowner"],["investor","Diaspora Investor"],["uae_buyer","UAE / Gulf Buyer"],["african_buyer","African Buyer / Distributor"],["partner","Potential Partner / NGO"],["govt","Government / Regulatory Body"],["media","Media / Press"]])}
      </Card>
      <Card>
        <div style={{color:"#F9FAFB",fontSize:14,fontWeight:700,marginBottom:18}}>Meeting Details</div>
        {inp("Topic / Purpose","topic","select",TOPICS)}{inp("Preferred Date","date","date")}
        {inp("Preferred Time (CAT)","time","select",[["","Select time..."],...TIMES.map(t=>[t,t+" (Central Africa Time)"])])}
        {inp("Additional Notes","message","textarea",null,"Tell us about your land, investment interest, buying requirements...")}
        <button onClick={()=>{if(form.name&&form.email&&form.date)setSubmitted(true);}} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${C.amber},${C.orange})`,border:"none",borderRadius:8,color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4}}>Request Meeting →</button>
      </Card>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:20}}>
      {[["📞","WhatsApp","+263 77 XXX XXXX"],["📧","Email","info@agriventure.co.zw"],["🌐","Website","agriventure.co.zw"],["📍","Office","Mupandawana Growth Point"]].map(([icon,label,val],i)=>(
        <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.07)",textAlign:"center"}}>
          <div style={{fontSize:20,marginBottom:5}}>{icon}</div>
          <div style={{color:"#6B7280",fontSize:10,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
          <div style={{color:"#D1D5DB",fontSize:11,marginTop:2}}>{val}</div>
        </div>
      ))}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP — ALL 11 TABS
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_TABS = [
  {id:"overview",label:"Overview",icon:"◈"},
  {id:"crops",label:"Crop Lifecycles",icon:"🌱"},
  {id:"financials",label:"Financials",icon:"📈"},
  {id:"farmer_reg",label:"Farmer Portal",icon:"🌾"},
  {id:"diaspora",label:"Investor Returns",icon:"💷"},
  {id:"farmer_journey",label:"Farmer Journey",icon:"🚜"},
  {id:"invest",label:"Invest Portal",icon:"🤝"},
  {id:"markets",label:"Markets",icon:"🌍"},
  {id:"coldchain",label:"Cold Chain",icon:"❄️"},
  {id:"compliance",label:"Legal",icon:"⚖️"},
  {id:"schedule",label:"Book Meeting",icon:"📅"},
];

export default function App(){
  const [active,setActive]=useState("overview");
  const MAP={overview:<Overview/>,crops:<CropLifecycles/>,financials:<Financials/>,farmer_reg:<FarmerPortal/>,diaspora:<DiasporaReturns/>,farmer_journey:<PeasantFarmer/>,invest:<InvestPortal/>,markets:<Markets/>,coldchain:<ColdChain/>,compliance:<Compliance/>,schedule:<MeetingScheduler/>};
  return(<div style={{minHeight:"100vh",background:"#080E08",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#F9FAFB"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#0D140D;}::-webkit-scrollbar-thumb{background:#2D3D2D;border-radius:4px;}select option{background:#111;color:#f9fafb;}input[type=range]{cursor:pointer;height:4px;}`}</style>
    <div style={{background:"rgba(0,0,0,0.88)",backdropFilter:"blur(10px)",borderBottom:"1px solid rgba(255,255,255,0.05)",position:"sticky",top:0,zIndex:100,padding:"0 20px"}}>
      <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",height:56}}>
        <div style={{marginRight:16}}>
          <div style={{color:C.amber,fontSize:14,fontWeight:800,fontFamily:"'Playfair Display',serif",whiteSpace:"nowrap"}}>AgriVenture Zimbabwe</div>
          <div style={{color:"#2D3D2D",fontSize:9,letterSpacing:2,textTransform:"uppercase"}}>Gutu · Mupandawana · Chatsworth · Zimuto</div>
        </div>
        <div style={{display:"flex",gap:2,flexWrap:"wrap",overflow:"hidden"}}>
          {ALL_TABS.map(t=>(
            <button key={t.id} onClick={()=>setActive(t.id)} style={{padding:"5px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:600,transition:"all 0.15s",background:active===t.id?"rgba(245,158,11,0.15)":"transparent",color:active===t.id?C.amber:"#4B5563",whiteSpace:"nowrap"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div style={{background:"linear-gradient(90deg,#0A1A0A,#0F1F0A,#0A150A)",borderBottom:"1px solid rgba(245,158,11,0.12)",padding:"10px 20px",overflowX:"auto"}}>
      <div style={{maxWidth:1300,margin:"0 auto",display:"flex",gap:28}}>
        {[["🌍","Gutu District","Zimbabwe"],["🌾","5 Export Crops","Citrus · Roses · Avocado · Blueberry · Veg"],["💷","£600K/year","500 × £100/month diaspora capital"],["✈️","11 Markets","UAE · Saudi · DRC · Zambia · China + more"],["❄️","Cold Chain","Harvest-to-market traceability"]].map(([icon,title,sub])=>(
          <div key={title} style={{display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap"}}>
            <span style={{fontSize:16}}>{icon}</span>
            <div><div style={{color:"#F9FAFB",fontSize:11,fontWeight:600}}>{title}</div><div style={{color:"#4B5563",fontSize:10}}>{sub}</div></div>
          </div>
        ))}
      </div>
    </div>
    <div style={{maxWidth:1300,margin:"0 auto",padding:"28px 20px 80px"}}>{MAP[active]}</div>
    <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",padding:"16px 20px",textAlign:"center"}}>
      <div style={{color:"#2D3D2D",fontSize:11}}>AgriVenture Zimbabwe — Unlocking Africa's Agricultural Potential · Mupandawana–Chatsworth–Zimuto Corridor · Gutu District, Masvingo Province</div>
    </div>
  </div>);
}
