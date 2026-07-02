export const EXCLUDED_INDUSTRIES = [
  "Restaurant",
  "Food Service",
  "Staffing Agency",
  "Temp Labor",
  "Trucking",
  "Freight",
  "Transportation",
  "Retail",
  "General Contractor",
  "Healthcare",
  "Cannabis",
  "Firearms"
];

export const DEAL_1_SDE_MIN = 175000;
export const DEAL_1_SDE_MAX = 300000;
export const DEALS_2_5_SDE_MIN = 225000;
export const DEALS_2_5_SDE_MAX = 350000;

export const DEAL_1_MULTIPLE_CEILING = {
  PHYSICAL: 3.0,
  DIGITAL: 3.25
};

export const DEALS_2_5_MULTIPLE_CEILING = {
  PHYSICAL: 3.25,
  DIGITAL: 3.5
};

export const DEAL_1_DSCR_FLOOR = 1.75;
export const DEAL_1_STRESS_DSCR_FLOOR = 1.40;
export const DEALS_2_5_DSCR_FLOOR = 1.50;
export const DEALS_2_5_STRESS_DSCR_FLOOR = 1.25;

export const DEAL_1_OFCF_FLOOR = 60000;
export const DEALS_2_5_OFCF_FLOOR = 80000;

export const ADMIN_CO_FEE_RANGES = [
  { maxSDE: 300000, fee: 30000 },
  { maxSDE: 350000, fee: 36000 }
];

export const DEFAULT_DEAL_INPUT = {
  businessName: "",
  dealSequence: "Deal #1",
  businessType: "Physical Service",
  industry: "",
  businessState: "",
  yearsInOperation: 0,
  sourcingChannel: "BizBuySell",
  ttmNetProfit: 0,
  sdeTTM: 0,
  revenueTTM: 0,
  ownerW2Comp: 0,
  ownerBenefits: 0,
  itemizedAddBacks: [],
  maintenanceCapEx3YrAvg: 0,
  askingPrice: 0,
  sellerNotePercentage: 0.15,
  sellerNoteRate: 6,
  sellerNoteDuration: 5,
  sbaLoanAmount: 0,
  sbaMonthlyDebtService: 0,
  sbaInterestRate: 10.5,
  sbaTermYears: 10,
  revenueY1: 0,
  revenueY2: 0,
  revenueY3: 0,
  sdeY1: 0,
  sdeY2: 0,
  sdeY3: 0,
  customerConcentrationMaxPct: 0,
  hasCustomerOver10PctContracted: true,
  bankStatementsAvailable: true,
  taxReturnsAvailable: true,
  pnlAvailable: true,
  bankDepositsMatchPnl: true,
  bankDepositVariancePct: 0,
  sba7aEligible: "Pending",
  veteransAdvantageApplied: true,
  platformConcentrationMaxPct: 0,
  platformName: "",
  paymentProcessorIssue: false,
  sellerIdentityDependencePct: 0,
  ownerDependencePathway: "A",
  keyEmployeeRisk: false,
  keyEmployeeRetentionPlan: false,
  remoteManageable: true,
  operatorProxyIdentified: false,
  communicationAccessConfirmed: false,
  capitalConfirmed: false,
  noCompetingLOI: false,
  isEcommerceSubscription: false,
  ecommerceRecurringRevenuePct: 0,
  governmentRevenuePct: 0,
  arAgingReportAvailable: true,
  customerListAvailable: true,
  hasVagueAddBacks: false,
  maxEarnoutAmount: 0,
  earnoutDurationMonths: 0,
  equityInjectionIsLiquid: true,
  sdePeakLast5Years: 0,
  monthlyFixedOpCosts: 0,
  workingCapitalReplenishmentAnnual: 0,
  capexDeferredMoreThan2Years: false,
  undisclosedPaymentTermination: false,
  referralSourceDependency: false,
  hiddenConcentrationRisk: false,
  pathwayA_GMInPlace: false,
  pathwayA_GMAgreement: false,
  pathwayA_GMPnlHistory: false,
  pathwayB_OwnerReplaceCost: 0,
  pathwayC_WrittenSOPs: false,
  pathwayC_IndependentExecution30Days: false,
  pathwayC_PostClose90DayPlan: false,
  ownerPerformsSalesAndOpsNoPlan: false,
  ownerControlsPayrollSchedulingNoPlan: false,
  keyEmployeeResponsibleFor20Pct: false,
  keyEmployeeAgreementExists: false,
  keyEmployeeBonusEscrowed: false,
  keyEmployeeWillingToStay: false,
  criticalEmployeeRefusesToStay: false,
  remoteFinancialOversightLess2Hrs: true,
  remoteBlackoutSurvival72Hrs: true,
  ownerMustSignPermitsOrLicense: false,
  ownerValueAddConfirmation: false,
  minimalSoftwareInUse: false,
  manualProcessesIn3CoreWorkflows: false,
  staffTimeReplaceableByAutomation: false,
  recurringModelAvailable: false,
  customerRetentionOver60PctNoContract: false,
  noServiceContractsOffered: false,
  noOnlineBookingOrPortal: false,
  noDigitalMarketingInfrastructure: false,
  laborCostsOver40Pct: false,
  pricingNotRaisedIn2Years: false,
  dealBriefAvailable: false,
  bankDepositSupportAvailable: false,
  orgChartAvailable: false,
  sopsAvailable: false,
  ninetyDayPlanAvailable: false,
  sellerIdentityEvidenceAvailable: false,
  platformConcentrationEvidenceAvailable: false,
  additionalDdDocsAvailable: false,
};
