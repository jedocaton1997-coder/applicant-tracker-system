import { 
  DealInput, 
  ScreeningStepResult, 
  CalculationResults, 
  DealTier, 
  BusinessType, 
  Verdict,
} from '../types';
import { 
  EXCLUDED_INDUSTRIES, 
  DEAL_1_SDE_MIN, 
  DEAL_1_SDE_MAX,
  DEALS_2_5_SDE_MIN,
  DEALS_2_5_SDE_MAX,
  DEAL_1_MULTIPLE_CEILING,
  DEALS_2_5_MULTIPLE_CEILING,
  DEAL_1_DSCR_FLOOR,
  DEAL_1_STRESS_DSCR_FLOOR,
  DEALS_2_5_DSCR_FLOOR,
  DEALS_2_5_STRESS_DSCR_FLOOR,
  DEAL_1_OFCF_FLOOR,
  DEALS_2_5_OFCF_FLOOR,
} from '../constants';

const asRatio = (value: number | undefined) => {
  const normalized = Number(value || 0);
  return normalized > 1 ? normalized / 100 : normalized;
};

const amortizedMonthlyPayment = (principal: number, annualRatePct: number, termYears: number) => {
  if (principal <= 0 || termYears <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  const months = termYears * 12;
  if (monthlyRate <= 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
};

const requiredDocuments: { key: keyof DealInput; label: string; isDigital?: boolean }[] = [
  { key: "dealBriefAvailable", label: "Deal Brief" },
  { key: "pnlAvailable", label: "P&L" },
  { key: "bankDepositSupportAvailable", label: "Bank deposit support" },
  { key: "orgChartAvailable", label: "Org chart" },
  { key: "sopsAvailable", label: "SOPs" },
  { key: "ninetyDayPlanAvailable", label: "90-day plan" },
  { key: "sellerIdentityEvidenceAvailable", label: "Seller identity evidence" },
  { key: "platformConcentrationEvidenceAvailable", label: "Platform concentration evidence", isDigital: true },
];

export function runScreening(deal: DealInput): { 
  steps: ScreeningStepResult[], 
  results: CalculationResults, 
  verdict: Verdict 
} {
  const steps: ScreeningStepResult[] = [];
  
  // 0. Data Collection Check
  const requiredFields: { key: keyof DealInput, label: string, isDigital?: boolean }[] = [
    { key: "businessName", label: "Business Name / Deal ID" },
    { key: "dealSequence", label: "Deal Sequence" },
    { key: "businessType", label: "Business Type" },
    { key: "industry", label: "Industry" },
    { key: "businessState", label: "Business State" },
    { key: "yearsInOperation", label: "Years in Operation" },
    { key: "sourcingChannel", label: "Sourcing Channel" },
    { key: "sdeTTM", label: "SDE TTM" },
    { key: "revenueTTM", label: "Revenue TTM" },
    { key: "ownerW2Comp", label: "Owner W-2 Compensation" },
    { key: "ownerBenefits", label: "Owner Benefits" },
    { key: "maintenanceCapEx3YrAvg", label: "Maintenance CapEx (3-year avg)" },
    { key: "askingPrice", label: "Asking Price" },
    { key: "sellerNotePercentage", label: "Seller Note Offered (%)" },
    { key: "sellerNoteRate", label: "Seller Note Rate" },
    { key: "sellerNoteDuration", label: "Seller Note Duration" },
    { key: "sbaLoanAmount", label: "SBA Loan Amount" },
    { key: "sbaInterestRate", label: "SBA Interest Rate" },
    { key: "sbaTermYears", label: "SBA Term" },
    { key: "revenueY1", label: "Revenue — Year 1" },
    { key: "revenueY2", label: "Revenue — Year 2" },
    { key: "sdeY1", label: "SDE — Year 1" },
    { key: "sdeY2", label: "SDE — Year 2" },
    { key: "customerConcentrationMaxPct", label: "Customer Concentration" },
    { key: "ownerDependencePathway", label: "Owner Dependence Pathway" },
    { key: "platformConcentrationMaxPct", label: "Platform Concentration %", isDigital: true },
    { key: "platformName", label: "Platform Name", isDigital: true },
    { key: "sellerIdentityDependencePct", label: "Seller Identity Dependence", isDigital: true },
    { key: "operatorProxyIdentified", label: "Operator Proxy Identified" },
    { key: "communicationAccessConfirmed", label: "Communication Access Confirmed" },
    { key: "capitalConfirmed", label: "Capital Confirmed" },
    { key: "noCompetingLOI", label: "No Competing Active LOI" },
    { key: "governmentRevenuePct", label: "Government Revenue %" },
    { key: "ecommerceRecurringRevenuePct", label: "E-commerce Recurring Revenue %", isDigital: true },
    { key: "maxEarnoutAmount", label: "Max Earnout Amount" },
    { key: "sdePeakLast5Years", label: "SDE Peak (Last 5 Yrs)" },
    { key: "monthlyFixedOpCosts", label: "Monthly Fixed OpCosts" },
    { key: "workingCapitalReplenishmentAnnual", label: "WC Replenishment (Annual)" },
  ];

  const isDigital = deal.businessType === BusinessType.DIGITAL_ONLINE || deal.businessType === BusinessType.SAAS_ADJACENT || deal.businessType === BusinessType.B2B_PROFESSIONAL;
  
  const positiveNumberFields = new Set<keyof DealInput>([
    "yearsInOperation",
    "sdeTTM",
    "revenueTTM",
    "askingPrice",
    "sellerNoteRate",
    "sellerNoteDuration",
    "sbaLoanAmount",
    "sbaInterestRate",
    "sbaTermYears",
    "revenueY1",
    "revenueY2",
    "sdeY1",
    "sdeY2",
  ]);

  const missingFields = requiredFields
    .filter(f => f.isDigital ? isDigital : true)
    .filter(f => {
      const val = deal[f.key];
      if (typeof val === 'string') return val.trim() === '';
      if (typeof val === 'number') return positiveNumberFields.has(f.key) && val === 0;
      return false;
    })
    .map(f => f.label);

  const totalPossible = requiredFields.filter(f => f.isDigital ? isDigital : true).length;
  const dataCompleteness = ((totalPossible - missingFields.length) / totalPossible) * 100;
  const missingDocuments = requiredDocuments
    .filter(doc => doc.isDigital ? isDigital : true)
    .filter(doc => !deal[doc.key])
    .map(doc => doc.label);

  // 1. Calculations
  const totalAddBacks = deal.itemizedAddBacks.reduce((acc, curr) => acc + curr.amount, 0);
  const sdeTTM = deal.sdeTTM || deal.ttmNetProfit + deal.ownerW2Comp + deal.ownerBenefits + totalAddBacks;
  const revenueTTM = deal.revenueTTM || deal.revenueY3;
  const adjustedSDE = sdeTTM - deal.maintenanceCapEx3YrAvg;
  const addBackPct = adjustedSDE > 0 ? totalAddBacks / adjustedSDE : 0;
  const threeYearAvgSDE = (sdeTTM + deal.sdeY1 + deal.sdeY2) / 3;
  const ttmVsThreeYearVariancePct = threeYearAvgSDE > 0 ? (sdeTTM - threeYearAvgSDE) / threeYearAvgSDE : 0;
  const sdePeak = Math.max(sdeTTM, deal.sdeY1, deal.sdeY2, deal.sdeY3, deal.sdePeakLast5Years);

  const totalConsideration = deal.askingPrice;
  const purchaseMultiple = adjustedSDE > 0 ? totalConsideration / adjustedSDE : 99;
  
  const sbaMonthlyPayment = deal.sbaMonthlyDebtService || amortizedMonthlyPayment(deal.sbaLoanAmount, deal.sbaInterestRate || 10.5, deal.sbaTermYears || 10);
  const annualSBADebtService = sbaMonthlyPayment * 12;
  const closeDayDSCR = annualSBADebtService > 0 ? adjustedSDE / annualSBADebtService : 0;
  
  // Seller Note Amortization
  const sellerNotePrincipal = asRatio(deal.sellerNotePercentage) * deal.askingPrice;
  const monthlySellerNotePayment = amortizedMonthlyPayment(sellerNotePrincipal, deal.sellerNoteRate, deal.sellerNoteDuration);
  const annualSellerNotePayment = monthlySellerNotePayment * 12;
  
  const month25DSCR = (annualSBADebtService + annualSellerNotePayment) > 0 
    ? adjustedSDE / (annualSBADebtService + annualSellerNotePayment) 
    : 0;

  // Stress SDE calculation (-15% Revenue)
  // Industry rule: SDE decline is nonlinear. Model conservatively.
  const revenueDrop = 0.15;
  const variableCostPct = 0.40; // Default assumption for variable costs
  const marginDecline = revenueDrop * (1 - variableCostPct); 
  const stressSDE = adjustedSDE - (revenueTTM * marginDecline);
  const stressDSCR = annualSBADebtService > 0 ? stressSDE / annualSBADebtService : 0;

  const adminCoFee = adjustedSDE <= 300000 ? 30000 : 36000;
  const reserves = Math.max(15000, revenueTTM * 0.05);

  const closeDayOFCF = adjustedSDE - adminCoFee - reserves - annualSBADebtService - deal.workingCapitalReplenishmentAnnual;
  const month25OFCF = adjustedSDE - adminCoFee - reserves - annualSBADebtService - annualSellerNotePayment - deal.workingCapitalReplenishmentAnnual;
  const stressOFCF = stressSDE - adminCoFee - reserves - annualSBADebtService - deal.workingCapitalReplenishmentAnnual;

  // Value Add Score Calculation
  let valueAddScore = 0;
  if (deal.minimalSoftwareInUse) valueAddScore += 5;
  if (deal.manualProcessesIn3CoreWorkflows) valueAddScore += 5;
  if (deal.staffTimeReplaceableByAutomation) valueAddScore += 5;
  if (deal.recurringModelAvailable) valueAddScore += 5;
  if (deal.customerRetentionOver60PctNoContract) valueAddScore += 5;
  if (deal.noServiceContractsOffered) valueAddScore += 5;
  if (deal.noOnlineBookingOrPortal) valueAddScore += 5;
  if (deal.noDigitalMarketingInfrastructure) valueAddScore += 5;
  if (deal.laborCostsOver40Pct) valueAddScore += 5;
  if (deal.pricingNotRaisedIn2Years) valueAddScore += 5;

  const calcResults: CalculationResults = {
    adjustedSDE,
    threeYearAvgSDE,
    ttmVsThreeYearVariancePct,
    totalConsideration,
    purchaseMultiple,
    annualSBADebtService,
    annualSellerNotePayment,
    closeDayDSCR,
    month25DSCR,
    stressDSCR,
    closeDayOFCF,
    month25OFCF,
    baseOFCF: closeDayOFCF,
    stressOFCF,
    stressSDE,
    valueAddScore,
    adminCoFee,
    reserves,
    dataCompleteness,
    missingFields,
    missingDocuments,
    killReasons: [],
    holdReasons: [],
    addBackPct
  };

  // Skip step evaluation if data is critically missing
  if (dataCompleteness < 100) {
    steps.push({
      step: 0,
      name: "Data Collection Protocol",
      verdict: "INCOMPLETE",
      message: `Missing ${missingFields.length} required fields. Please complete: ${missingFields.join(', ')}`
    });
  }

  if (missingDocuments.length > 0) {
    steps.push({
      step: 0,
      name: "Required Document Gate",
      verdict: "INCOMPLETE",
      message: `Missing required intake documents: ${missingDocuments.join(', ')}`
    });
  }

  // 2. Sequential Screening
  
  // STEP 1: Industry Exclusion
  let industryVerdict: "PASS" | "KILL" = "PASS";
  let industryMessage = "Industry cleared.";
  
  const isOnExclusionList = EXCLUDED_INDUSTRIES.some(ind => deal.industry.toLowerCase().includes(ind.toLowerCase()));
  const isGovernmentDependent = asRatio(deal.governmentRevenuePct) > 0.50;
  
  if (isOnExclusionList) {
    industryVerdict = "KILL";
    industryMessage = `Business in excluded industry: ${deal.industry}`;
  } else if (isGovernmentDependent) {
    industryVerdict = "KILL";
    industryMessage = "More than 50% of revenue is from a single government contract.";
  } else if (deal.businessType === BusinessType.E_COMMERCE) {
    const isEcomPass = deal.isEcommerceSubscription && asRatio(deal.ecommerceRecurringRevenuePct) > 0.60;
    if (!isEcomPass) {
      industryVerdict = "KILL";
      industryMessage = "E-commerce must be subscription-based with >60% recurring revenue.";
    }
  }

  steps.push({
    step: 1,
    name: "Industry Exclusion Check",
    verdict: industryVerdict,
    message: industryMessage
  });

  steps.push({ step: 2, name: "Deal Intake Gate", verdict: missingDocuments.length ? "INCOMPLETE" : "PASS", message: missingDocuments.length ? "Required documents must be uploaded before advancement." : "Required intake package is present." });

  // STEP 3: Operating History
  const historyPass = deal.yearsInOperation >= 5;
  steps.push({
    step: 3,
    name: "Operating History Check",
    verdict: historyPass ? "PASS" : "KILL",
    message: historyPass ? "5+ continuous years confirmed." : "Fewer than 5 continuous years of operation without waiver."
  });

  // STEP 4: SBA 7(a) Eligibility
  steps.push({
    step: 4,
    name: "SBA 7(a) Eligibility Gate",
    verdict: deal.sba7aEligible === "Yes" ? "PASS" : (deal.sba7aEligible === "Pending" ? "PAUSE" : "KILL"),
    message: deal.sba7aEligible === "Yes" ? "Eligibility confirmed." : (deal.sba7aEligible === "Pending" ? "Eligibility is Pending — deal cannot advance to LOI." : "Does not qualify for SBA 7(a) financing.")
  });

  // STEP 5: Financial Document Integrity
  let integrityVerdict: "PASS" | "KILL" = "PASS";
  let integrityMessage = "Documents reconcile and are available.";
  
  const depositVariance = Math.abs(asRatio(deal.bankDepositVariancePct));
  if (!deal.bankStatementsAvailable) {
    integrityVerdict = "KILL";
    integrityMessage = "Seller refuses to provide bank statements.";
  } else if (!deal.bankDepositsMatchPnl || depositVariance > 0.05) {
    integrityVerdict = "KILL";
    integrityMessage = `Bank deposits do not reconcile to P&L within ±5%${depositVariance ? ` (${(depositVariance * 100).toFixed(1)}% variance)` : ""}.`;
  } else if (!deal.taxReturnsAvailable || !deal.pnlAvailable) {
    integrityVerdict = "KILL";
    integrityMessage = "Missing 3 years of tax returns or P&L statements.";
  } else if (deal.hasVagueAddBacks) {
    integrityVerdict = "KILL";
    integrityMessage = "Undocumented or vague add-backs detected.";
  } else if (!deal.arAgingReportAvailable || !deal.customerListAvailable) {
    integrityVerdict = "KILL";
    integrityMessage = "Missing AR aging report or customer list.";
  }

  steps.push({
    step: 5,
    name: "Financial Document Integrity",
    verdict: integrityVerdict,
    message: integrityMessage
  });

  // STEP 6: SDE CALCULATION & VALIDATION
  const sdeMin = deal.dealSequence === DealTier.DEAL_1 ? DEAL_1_SDE_MIN : DEALS_2_5_SDE_MIN;
  const sdeMax = deal.dealSequence === DealTier.DEAL_1 ? DEAL_1_SDE_MAX : DEALS_2_5_SDE_MAX;
  const sdeRangePass = adjustedSDE >= sdeMin && adjustedSDE <= sdeMax;
  
  if (!sdeRangePass) {
    steps.push({ step: 6, name: "SDE Validation", verdict: "KILL", message: `SDE ($${adjustedSDE.toLocaleString()}) outside allowed range for ${deal.dealSequence}.` });
  } else if (addBackPct > 0.3) {
    steps.push({ step: 6, name: "SDE Validation", verdict: "PAUSE", message: `Add-backs (${(addBackPct*100).toFixed(1)}%) exceed 30% of SDE - requires documentation review.` });
  } else if (ttmVsThreeYearVariancePct > 0.15) {
    steps.push({ step: 6, name: "SDE Validation", verdict: "PAUSE", message: `TTM SDE is ${(ttmVsThreeYearVariancePct * 100).toFixed(1)}% above the 3-year average.` });
  } else {
    steps.push({ step: 6, name: "SDE Validation", verdict: "PASS", message: "SDE calculation and range validated." });
  }

  // STEP 7: Revenue Trend Test
  const revenuePeriods = [deal.revenueY1, deal.revenueY2, revenueTTM].filter(v => v > 0);
  const singleYearRevenueDecline = revenuePeriods.reduce((worst, current, index) => {
    if (index === 0) return worst;
    const prior = revenuePeriods[index - 1];
    const decline = prior > 0 ? (prior - current) / prior : 0;
    return Math.max(worst, decline);
  }, 0);
  const cumulativeSDEDecline = sdePeak > 0 ? (sdePeak - sdeTTM) / sdePeak : 0;
  
  if (cumulativeSDEDecline > 0.20) {
    steps.push({ step: 7, name: "Revenue Trend Test", verdict: "KILL", message: `3-year cumulative SDE decline (${(cumulativeSDEDecline*100).toFixed(1)}%) > 20% from peak.` });
  } else if (singleYearRevenueDecline > 0.15) {
    steps.push({ step: 7, name: "Revenue Trend Test", verdict: "KILL", message: `Single-year revenue decline (${(singleYearRevenueDecline * 100).toFixed(1)}%) > 15%.` });
  } else {
    steps.push({ step: 7, name: "Revenue Trend Test", verdict: "PASS", message: "Revenue and SDE trends stable." });
  }

  // STEP 8: Purchase Multiple Check
  const tierCeiling = deal.dealSequence === DealTier.DEAL_1 
    ? (isDigital ? 3.25 : 3.0)
    : (isDigital ? 3.5 : 3.25);
    
  if (purchaseMultiple > tierCeiling) {
    steps.push({ step: 8, name: "Purchase Multiple", verdict: "KILL", message: `Total consideration multiple (${purchaseMultiple.toFixed(2)}x) exceeds ${tierCeiling}x ceiling.` });
  } else if (deal.dealSequence === DealTier.DEAL_1 && totalConsideration > 500000) {
    steps.push({ step: 8, name: "Purchase Multiple", verdict: "KILL", message: "Deal #1 price > $500,000. $500k ceiling governs for SBA Small Loan eligibility." });
  } else if (deal.maxEarnoutAmount > deal.askingPrice * 0.15) {
    steps.push({ step: 8, name: "Purchase Multiple", verdict: "PAUSE", message: "Earnout exceeds 15% of base purchase price." });
  } else {
    steps.push({ step: 8, name: "Purchase Multiple", verdict: "PASS", message: "Multiple and deal structure within range." });
  }

  // STEP 9: Financing Stack Validation
  const sellerNotePass = asRatio(deal.sellerNotePercentage) >= 0.15;
  const equityPass = deal.equityInjectionIsLiquid;
  
  if (!sellerNotePass) {
    steps.push({ step: 9, name: "Financing Stack", verdict: "KILL", message: "Seller refuses to provide a note of at least 15% (Mandatory)." });
  } else if (!equityPass) {
    steps.push({ step: 9, name: "Financing Stack", verdict: "KILL", message: "Equity injection is not from liquid personal assets (borrowed funds detected)." });
  } else if (!deal.veteransAdvantageApplied) {
    steps.push({ step: 9, name: "Financing Stack", verdict: "PAUSE", message: "Veterans Advantage not applied (Required on every deal)." });
  } else {
    steps.push({ step: 9, name: "Financing Stack", verdict: "PASS", message: "Financing stack meets HoldCo standards." });
  }

  // STEP 10: DSCR Calculation
  const dscrFloor = deal.dealSequence === DealTier.DEAL_1 ? 1.75 : 1.50;
  const stressFloor = deal.dealSequence === DealTier.DEAL_1 ? 1.40 : 1.25;
  
  if (closeDayDSCR < dscrFloor) {
    steps.push({ step: 10, name: "DSCR Gate", verdict: "KILL", message: `Close-Day DSCR (${closeDayDSCR.toFixed(2)}x) below floor (${dscrFloor}x).` });
  } else if (month25DSCR < dscrFloor) {
    steps.push({ step: 10, name: "DSCR Gate", verdict: "KILL", message: `Month 25 DSCR (${month25DSCR.toFixed(2)}x) below floor.` });
  } else if (stressDSCR < stressFloor) {
    steps.push({ step: 10, name: "DSCR Gate", verdict: "KILL", message: `Stress DSCR (${stressDSCR.toFixed(2)}x) below floor (${stressFloor}x).` });
  } else {
    steps.push({ step: 10, name: "DSCR Gate", verdict: "PASS", message: "All DSCR scenarios clear debt coverage floors." });
  }

  // STEP 11: OFCF Gate
  const ofcfFloor = deal.dealSequence === DealTier.DEAL_1 ? 60000 : 80000;
  if (closeDayOFCF < ofcfFloor) {
    steps.push({ step: 11, name: "OFCF Gate", verdict: "KILL", message: `Close-Day OFCF ($${closeDayOFCF.toLocaleString()}) below floor ($${ofcfFloor.toLocaleString()}) after all deductions.` });
  } else if (month25OFCF < ofcfFloor) {
    steps.push({ step: 11, name: "Month 25 OFCF Gate", verdict: "KILL", message: `Month 25 OFCF ($${month25OFCF.toLocaleString()}) below floor after seller note begins.` });
  } else if (closeDayOFCF > 150000) {
    steps.push({ step: 11, name: "OFCF Performance", verdict: "FLAG", message: "OFCF exceeds $150,000. Above ceiling suggests deal may be underpriced or high-risk." });
  } else if (stressOFCF <= 0) {
    steps.push({ step: 11, name: "Stress OFCF Gate", verdict: "KILL", message: "Business insolvent in stress case (OFCF <= 0)." });
  } else {
    steps.push({ step: 11, name: "OFCF Gate", verdict: "PASS", message: "OFCF clears floor for deal tier." });
  }

  // STEP 12: Customer Concentration
  const customerConcentration = asRatio(deal.customerConcentrationMaxPct);
  if (customerConcentration > 0.20) {
    steps.push({ step: 12, name: "Customer Concentration", verdict: "KILL", message: "Single customer >20% of revenue." });
  } else if (customerConcentration >= 0.10 && !deal.hasCustomerOver10PctContracted) {
    steps.push({ step: 12, name: "Customer Concentration", verdict: "PAUSE", message: "Customer >10% on month-to-month - requires Owner approval + mitigation plan." });
  } else if (deal.referralSourceDependency) {
    steps.push({ step: 12, name: "Source Concentration", verdict: "PAUSE", message: "Dependency on a single referral source detected." });
  } else if (deal.hiddenConcentrationRisk) {
    steps.push({ step: 12, name: "Concentration Risk", verdict: "KILL", message: "Hidden customer or supplier concentration risk detected." });
  } else {
    steps.push({ step: 12, name: "Customer Concentration", verdict: "PASS", message: "Concentration levels acceptable." });
  }

  // STEP 13: CapEx Normalization
  if (deal.maintenanceCapEx3YrAvg / adjustedSDE > 0.10) {
    steps.push({ step: 13, name: "Maintenance CapEx", verdict: "PAUSE", message: "CapEx >10% of SDE - requires Owner review." });
  } else if (deal.capexDeferredMoreThan2Years) {
    steps.push({ step: 13, name: "Maintenance CapEx", verdict: "PAUSE", message: "CapEx deferred >2 years - requires third-party assessment before LOI." });
  } else {
    steps.push({ step: 13, name: "Maintenance CapEx", verdict: "PASS", message: "CapEx within normal limits." });
  }

  // STEP 14: Platform Concentration (Digital Only)
  if (isDigital) {
    const platformConcentration = asRatio(deal.platformConcentrationMaxPct);
    const sellerIdentityDependence = asRatio(deal.sellerIdentityDependencePct);
    if (platformConcentration > 0.60) {
      steps.push({ step: 14, name: "Platform Concentration", verdict: "KILL", message: "Single platform >60% revenue." });
    } else if (platformConcentration > 0.40) {
      steps.push({ step: 14, name: "Platform Concentration", verdict: "HOLD", message: "40-60% platform concentration - diversification plan required before LOI." });
    } else if (deal.undisclosedPaymentTermination) {
      steps.push({ step: 14, name: "Processor Integrity", verdict: "KILL", message: "Undisclosed prior payment processor account termination detected." });
    } else if (sellerIdentityDependence > 0.20) {
      steps.push({ step: 14, name: "Seller Identity Screen", verdict: "KILL", message: "Seller personal brand drives >20% of traffic." });
    } else {
      steps.push({ step: 14, name: "Platform Concentration", verdict: "PASS", message: "Platform risk managed." });
    }
  }

  // STEP 15: Seller Identity (Digital Only)
  if (isDigital) {
    if (deal.undisclosedPaymentTermination) {
      steps.push({ step: 15, name: "Payment Processor Risk", verdict: "KILL", message: "Prior payment processor termination was not disclosed." });
    } else {
      steps.push({ step: 15, name: "Payment Processor Risk", verdict: "PASS", message: "No undisclosed processor termination." });
    }
  }

  // STEP 16: Owner Dependence
  let pathwayAPass = deal.pathwayA_GMInPlace && deal.pathwayA_GMAgreement && deal.pathwayA_GMPnlHistory;
  let pathwayBPass = deal.pathwayB_OwnerReplaceCost <= (adjustedSDE * 0.3);
  let pathwayCPass = deal.pathwayC_WrittenSOPs && deal.pathwayC_IndependentExecution30Days && deal.pathwayC_PostClose90DayPlan;
  
  let dependenceVerdict: "PASS" | "KILL" = "PASS";
  let dependenceMessage = "Meets owner independence standards.";

  const anyPathwayPass = pathwayAPass || pathwayBPass || pathwayCPass;
  
  if (deal.ownerPerformsSalesAndOpsNoPlan || deal.ownerControlsPayrollSchedulingNoPlan) {
    dependenceVerdict = "KILL";
    dependenceMessage = "Owner controls mission-critical functions without succession plan.";
  } else if (!anyPathwayPass) {
    dependenceVerdict = "KILL";
    dependenceMessage = "Business fails all three owner-independence pathways.";
  } else {
    let activePathways = [];
    if (pathwayAPass) activePathways.push("A (GM)");
    if (pathwayBPass) activePathways.push("B (Replacement Cost)");
    if (pathwayCPass) activePathways.push("C (Systemization)");
    dependenceMessage = `Qualified via Pathway ${activePathways.join(', ')}.`;
  }

  steps.push({
    step: 16,
    name: "Owner Dependence Screen",
    verdict: dependenceVerdict,
    message: dependenceMessage
  });

  // STEP 17: Key Employee
  const requiresRetentionCheck = deal.keyEmployeeResponsibleFor20Pct || deal.operatorProxyIdentified;
  if (requiresRetentionCheck) {
    const retentionPass = deal.keyEmployeeAgreementExists && deal.keyEmployeeBonusEscrowed && deal.keyEmployeeWillingToStay;
    if (deal.criticalEmployeeRefusesToStay) {
      steps.push({ step: 17, name: "Key Employee Retention", verdict: "KILL", message: "Critical employee refuses to remain post-close." });
    } else if (!retentionPass) {
      steps.push({ step: 17, name: "Key Employee Retention", verdict: "KILL", message: "Missing retention agreement, escrowed bonus, or confirmed willingness." });
    } else {
      steps.push({ step: 17, name: "Key Employee Retention", verdict: "PASS", message: "Staff risk mitigated via retention protocol." });
    }
  } else {
    steps.push({ step: 17, name: "Key Employee Retention", verdict: "PASS", message: "No critical key employee risks identified." });
  }

  // STEP 18: Remote-Manageability
  const remoteConditionsMet = deal.communicationAccessConfirmed && deal.remoteFinancialOversightLess2Hrs && deal.remoteBlackoutSurvival72Hrs;
  if (deal.ownerMustSignPermitsOrLicense) {
    steps.push({ step: 18, name: "Remote-Manageability", verdict: "DISQUALIFIED", message: "Owner must hold credentials or sign site permits in-person." });
  } else if (!remoteConditionsMet) {
    steps.push({ step: 18, name: "Remote-Manageability", verdict: "KILL", message: "Fails remote standards for financial oversight or blackout survival." });
  } else {
    steps.push({ step: 18, name: "Remote-Manageability", verdict: "PASS", message: "Meets remote management standards." });
  }

  // STEP 19: State Labor Flag
  const isCA = deal.businessState.toUpperCase() === "CA" || deal.businessState.toLowerCase() === "california";
  const isNY = deal.businessState.toUpperCase() === "NY" || deal.businessState.toLowerCase() === "new york";
  const isIL = deal.businessState.toUpperCase() === "IL" || deal.businessState.toLowerCase() === "illinois";

  if (isCA) {
    steps.push({ step: 19, name: "State Labor Law Flag", verdict: "PAUSE", message: "CA labor law audit required before LOI (PAGA risk)." });
  } else if (isNY) {
    steps.push({ step: 19, name: "State Labor Law Flag", verdict: "PAUSE", message: "NY labor law review required before LOI." });
  } else if (isIL) {
    steps.push({ step: 19, name: "State Labor Law Flag", verdict: "PAUSE", message: "Additional IL labor law review required before LOI." });
  } else {
    steps.push({ step: 19, name: "State Labor Law Flag", verdict: "PASS", message: "Standard risk state labor environment." });
  }

  // STEP 20: Value-Add Score
  let scoreVerdict: "PASS" | "PAUSE" | "KILL" | "HOLD" = "PASS";
  let scoreMessage = `Score: ${valueAddScore}/50.`;
  
  if (valueAddScore >= 35) {
    scoreVerdict = "PASS";
    scoreMessage += " Priority deal — execute fast.";
  } else if (valueAddScore >= 30) {
    scoreVerdict = "PASS";
    scoreMessage += " Standard deal — proceed normally.";
  } else if (valueAddScore >= 25) {
    if (deal.ownerValueAddConfirmation) {
      scoreVerdict = "PASS";
      scoreMessage += " Cash flow play — Owner confirmation logged.";
    } else {
      scoreVerdict = "PAUSE";
      scoreMessage += " Cash flow play — Progress BLOCKED until Owner confirmation logged.";
    }
  } else {
    scoreVerdict = "HOLD"; // Using HOLD for deprioritize as per classification
    scoreMessage += " Deprioritize — Pause and review.";
  }

  steps.push({
    step: 20,
    name: "Value-Add Filter Score",
    verdict: scoreVerdict,
    message: scoreMessage
  });

  // STEP 21: Buyer Readiness
  const readiness = deal.operatorProxyIdentified && deal.communicationAccessConfirmed && deal.capitalConfirmed && deal.noCompetingLOI;
  steps.push({
    step: 21,
    name: "Buyer Readiness Gate",
    verdict: readiness ? "PASS" : "PAUSE",
    message: readiness ? "Buyer prepared." : "Missing proxy, capital, or time commitment."
  });

  // FINAL VERDICT
  const killReasons = steps.filter(s => s.verdict === "KILL" || s.verdict === "DISQUALIFIED").map(s => s.message);
  const holdReasons = steps.filter(s => s.verdict === "PAUSE" || s.verdict === "HOLD" || s.verdict === "INCOMPLETE").map(s => s.message);
  calcResults.killReasons = killReasons;
  calcResults.holdReasons = holdReasons;

  let finalVerdict = Verdict.PASS;
  if (killReasons.length > 0) {
    finalVerdict = Verdict.KILL;
  } else if (holdReasons.length > 0) {
    finalVerdict = Verdict.PAUSE;
  }

  return { steps, results: calcResults, verdict: finalVerdict };
}
