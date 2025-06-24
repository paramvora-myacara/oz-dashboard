export const nationalKpis = {
  totalMarketSize:     { title: "Total Market Size",      value: "$100+ B", description: "Invested since 2018" },
  q12025Fundraising:   { title: "Q1 2025 Fundraising",      value: "$810 M", description: "Current pace" },
  activeQOFs:          { title: "Active QOFs",             value: "2,800+", description: "Funds nationwide" },
  geoDistribution:     { title: "Geo Distribution",         value: "54% / 46%", description: "Nat'l / Regional" },
  housingProduction:   { title: "Housing Production",       value: "313,000", description: "New units ('19-'24)" },
  costEfficiency:      { title: "Cost Efficiency / Unit",   value: "$26,000", description: "Lower cost" },
  employmentImpact:    { title: "Employment Impact",       value: "+1.5%", description: "In OZ metros" },
  realEstateAppreciation: { title: "RE Appreciation",       value: "10%", description: "49% of zones" },
};

export const getStateInvestmentAttractivenessScore = (stateName) => {
  if (!stateName) return 0;
  let hash = 0;
  for (let c of stateName) hash = ((hash << 5) - hash) + c.charCodeAt(0), hash |= 0;
  return Math.abs(hash) % 100 + 1;
};

export const exampleStateHoverData = (stateName) => {
  const base = getStateInvestmentAttractivenessScore(stateName);
  return {
    StateName: stateName,
    "Total Capital Deployed": `$${(base*0.6 + Math.random()*8 + 2).toFixed(1)}B`,
    "Active QOFs": Math.floor(base*0.25 + Math.random()*15 + 3),
    "Key Industries": base > 70 ? "Tech, Health" : base > 40 ? "Manufacturing" : "Tourism",
    "Population Growth (YoY)": `${(Math.random()*1.5 + 0.2).toFixed(1)}%`,
    "Unemployment Rate": `${(Math.random()*2 + 3).toFixed(1)}%`
  };
};

export const investmentTimelineData = {
  labels: ["2019","2020","2021","2022","2023","2024"],
  datasets: [{
    label: "Cumulative Investment",
    data: [10,28,45,65,85,105],
    fill: true, tension:0.3,
    borderColor: "#0D47A1", backgroundColor: "rgba(13,71,161,0.2)",
  }]
};

export const sectorAllocationData = {
  labels: ["Commercial","Multifamily","Small Biz","Infra","Other"],
  datasets: [{
    data: [45,35,10,5,5],
    backgroundColor: ["#0D47A1","#1976D2","#FFC107","#64B5F6","#BDBDBD"],
    borderWidth: 2, hoverOffset: 4
  }]
};

export const housingProductionData = {
  labels: ["2019","2020","2021","2022","2023","2024"],
  datasets: [{ label:"Units (k)", data:[25,45,60,75,80,90], borderRadius:4 }]
};

export const ozPerformanceVsNonOz = {
  labels:["Job Growth","Biz Formation","Property ↑"],
  datasets:[
    { label:"OZ",    data:[3.7,5.1,12.4] },
    { label:"Non-OZ",data:[2.5,3.0,7.8] }
  ]
}; 