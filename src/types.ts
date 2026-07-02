export enum DealTier {
  DEAL_1 = "Deal #1",
  DEALS_2_5 = "Deals #2-5"
}

export enum BusinessType {
  PHYSICAL_SERVICE = "Physical Service",
  B2B_PROFESSIONAL = "B2B Professional",
  DIGITAL_ONLINE = "Digital / Online",
  SAAS_ADJACENT = "SaaS-Adjacent",
  E_COMMERCE = "E-commerce"
}

export enum Verdict {
  PASS = "PASS — LOI Ready",
  PAUSE = "PAUSE — Condition Required",
  KILL = "KILL — Deal Dead"
}

export enum SourcingChannel {
  BIZBUYSELL = "BizBuySell",
  BIZQUEST = "BizQuest",
  ACQUIRE = "Acquire.com",
  EMPIRE_FLIPPERS = "Empire Flippers",
  FE_INTERNATIONAL = "FE International",
  QUIET_LIGHT = "Quiet Light",
  OFF_MARKET = "Off-market",
  OTHER = "Other"
}

export interface DealInput {
  businessName: string;
  dealSequence: DealTier;
  businessType: BusinessType;
  industry: string;
  businessState: string;
  yearsInOperation: number;
  sourcingChannel: SourcingChannel;
  
  // Financials
  sdeTTM?: number;
  revenueTTM?: number;
  ttmNetProfit: number;
  ownerW2Comp: number;
  ownerBenefits: number;
  itemizedAddBacks: { label: string; amount: number }[];
  maintenanceCapEx3YrAvg: number;
  askingPrice: number;
  sellerNotePercentage: number;
  sellerNoteRate: number;
  sellerNoteDuration: number; // in years
  sbaLoanAmount: number;
  sbaMonthlyDebtService: number;
  sbaInterestRate?: number;
  sbaTermYears?: number;
  
  // Historical
  revenueY1: number;
  revenueY2: number;
  revenueY3: number;
  sdeY1: number;
  sdeY2: number;
  sdeY3: number;
  
  // Concentration & Integrity
  customerConcentrationMaxPct: number;
  hasCustomerOver10PctContracted: boolean;
  bankStatementsAvailable: boolean;
  taxReturnsAvailable: boolean;
  pnlAvailable: boolean;
  bankDepositsMatchPnl: boolean;
  bankDepositVariancePct?: number;
  sba7aEligible: "Yes" | "No" | "Pending";
  veteransAdvantageApplied: boolean;
  
  // Digital specific
  platformConcentrationMaxPct: number;
  platformName: string;
  paymentProcessorIssue: boolean;
  sellerIdentityDependencePct: number;
  
  // Dependence
  ownerDependencePathway: "A" | "B" | "C";
  keyEmployeeRisk: boolean;
  keyEmployeeRetentionPlan: boolean;
  remoteManageable: boolean;
  
  // Buyer Readiness
  operatorProxyIdentified: boolean;
  communicationAccessConfirmed: boolean;
  capitalConfirmed: boolean;
  noCompetingLOI: boolean;

  // New fields for Step 1-5
  isEcommerceSubscription: boolean;
  ecommerceRecurringRevenuePct: number;
  governmentRevenuePct: number;
  arAgingReportAvailable: boolean;
  customerListAvailable: boolean;
  hasVagueAddBacks: boolean;
  
  // New fields for Step 6-10
  maxEarnoutAmount: number;
  earnoutDurationMonths: number;
  equityInjectionIsLiquid: boolean;
  sdePeakLast5Years: number;

  // New fields for Step 11-15
  monthlyFixedOpCosts: number;
  workingCapitalReplenishmentAnnual: number;
  capexDeferredMoreThan2Years: boolean;
  undisclosedPaymentTermination: boolean;
  referralSourceDependency: boolean;
  hiddenConcentrationRisk: boolean;

  // New fields for Step 16-20
  pathwayA_GMInPlace: boolean;
  pathwayA_GMAgreement: boolean;
  pathwayA_GMPnlHistory: boolean;
  pathwayB_OwnerReplaceCost: number;
  pathwayC_WrittenSOPs: boolean;
  pathwayC_IndependentExecution30Days: boolean;
  pathwayC_PostClose90DayPlan: boolean;
  ownerPerformsSalesAndOpsNoPlan: boolean;
  ownerControlsPayrollSchedulingNoPlan: boolean;
  
  keyEmployeeResponsibleFor20Pct: boolean;
  keyEmployeeAgreementExists: boolean;
  keyEmployeeBonusEscrowed: boolean;
  keyEmployeeWillingToStay: boolean;
  criticalEmployeeRefusesToStay: boolean;

  remoteFinancialOversightLess2Hrs: boolean;
  remoteBlackoutSurvival72Hrs: boolean;
  ownerMustSignPermitsOrLicense: boolean;

  ownerValueAddConfirmation: boolean;

  // Value-Add Scoring Inputs
  minimalSoftwareInUse: boolean;
  manualProcessesIn3CoreWorkflows: boolean;
  staffTimeReplaceableByAutomation: boolean;
  recurringModelAvailable: boolean;
  customerRetentionOver60PctNoContract: boolean;
  noServiceContractsOffered: boolean;
  noOnlineBookingOrPortal: boolean;
  noDigitalMarketingInfrastructure: boolean;
  laborCostsOver40Pct: boolean;
  pricingNotRaisedIn2Years: boolean;

  // Intake document checklist
  dealBriefAvailable?: boolean;
  bankDepositSupportAvailable?: boolean;
  orgChartAvailable?: boolean;
  sopsAvailable?: boolean;
  ninetyDayPlanAvailable?: boolean;
  sellerIdentityEvidenceAvailable?: boolean;
  platformConcentrationEvidenceAvailable?: boolean;
  additionalDdDocsAvailable?: boolean;
}

export enum PipelineStage {
  DEAL_INTAKE = "Deal Intake",
  SCREENING = "Screening",
  PIPELINE = "Pipeline",
  OUTREACH = "Outreach",
  LOI = "LOI",
  DUE_DILIGENCE = "Due Diligence",
  DEAD = "Dead"
}

export interface PipelineDeal {
  id: string;
  businessName: string;
  stage: PipelineStage;
  dealInput: DealInput;
  verdict: "PASS" | "PAUSE" | "KILL" | "HOLD" | "INCOMPLETE";
  score: number;
  adjustedSDE: number;
  askingPrice: number;
  purchaseMultiple: number;
  baseOFCF: number;
  month25OFCF?: number;
  closeDayDSCR: number;
  month25DSCR?: number;
  killReasons?: string[];
  holdReasons?: string[];
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

export enum OutreachType {
  BROKER = "Broker",
  DIRECT_CAMPAIGN = "Direct-to-Owner",
  COLD_OUTREACH = "Cold Outreach",
  OTHER = "Other"
}

export enum OutreachStatus {
  COLD = "Cold Lead",
  CONTACTED = "Contacted / In Discussion",
  NDA_SIGNED = "NDA Signed",
  CIM_REVIEW = "CIM Review",
  LOI_SENT = "LOI Sent",
  ENGAGED = "Active Diligence",
  PASSED = "Passed / Dead"
}

export interface OutreachContact {
  id: string;
  name: string;
  firm: string;
  type: OutreachType;
  email: string;
  phone: string;
  lastContactDate: string;
  status: OutreachStatus;
  notes: string;
  dealId?: string; // Optional links to pipeline
}

export interface ScreeningStepResult {
  step: number;
  name: string;
  verdict: "PASS" | "PAUSE" | "KILL" | "HOLD" | "NONE" | "FLAG" | "DISQUALIFIED" | "INCOMPLETE";
  message: string;
}

export interface CalculationResults {
  adjustedSDE: number;
  threeYearAvgSDE: number;
  ttmVsThreeYearVariancePct: number;
  totalConsideration: number;
  purchaseMultiple: number;
  annualSBADebtService: number;
  annualSellerNotePayment: number;
  closeDayDSCR: number;
  month25DSCR: number;
  stressDSCR: number;
  closeDayOFCF: number;
  month25OFCF: number;
  baseOFCF: number;
  stressOFCF: number;
  stressSDE: number;
  valueAddScore: number;
  adminCoFee: number;
  reserves: number;
  dataCompleteness: number; // 0 to 100
  missingFields: string[];
  missingDocuments: string[];
  killReasons: string[];
  holdReasons: string[];
  addBackPct: number;
}
