import type { Inputs, Input } from "../types";

const I = (
  key: string, label: string, group: string, value: number | null, unit: string,
  source: string, type: Input["type"], confidence: Input["confidence"]
): Input => ({ key, label, group, value, unit, source, type, confidence });

const PM = "Product Manager input (session 1)";
const PLACE = "AI placeholder — replace with Aman data";

export const DEFAULT_INPUTS: Inputs = Object.fromEntries([
  // Customer base
  I("totalCustomers", "Total customers (active this year)", "Aman Customer Base", 550000, "customers", PM, "ACTUAL", "Medium"),
  I("mau", "MAU", "Aman Customer Base", 360000, "users", PM, "ACTUAL", "Medium"),
  I("finServiceCustomers", "Existing investment-product customers", "Aman Customer Base", 0, "customers", PM + " (no investment section today)", "ACTUAL", "Medium"),
  I("cfCustomers", "Consumer Finance customers", "Aman Customer Base", 65000, "customers", PM, "ACTUAL", "Medium"),
  I("cardCustomers", "Card customers", "Aman Customer Base", 0, "customers", PM + " (prepaid card not yet live)", "ACTUAL", "Medium"),
  I("cardLaunchMonths", "Aman prepaid card go-live (months from now)", "Product", 1, "months", PM + " (live in less than a month)", "ASSUMPTION", "Medium"),
  I("superAppUsers", "Super App users", "Aman Customer Base", 1000000, "users", PM, "ACTUAL", "Medium"),
  // Acquisition
  I("adoption", "Adoption (% of MAU engaging with Gold)", "Customer Acquisition", 30, "%", "Internal Product Estimate (PM)", "ASSUMPTION", "Low"),
  I("onboarding", "Onboarding completion (% of adopters)", "Customer Acquisition", 20, "%", "Internal Product Estimate (PM)", "ASSUMPTION", "Low"),
  I("firstPurchase", "First-purchase conversion (% of onboarded)", "Customer Acquisition", 10, "%", "Internal Product Estimate (PM)", "ASSUMPTION", "Low"),
  I("repeat", "Repeat purchase rate (% of first buyers)", "Customer Acquisition", 8, "%", "Internal Product Estimate (PM)", "ASSUMPTION", "Low"),
  I("cac", "CAC (per acquired customer)", "Customer Acquisition", 10, "EGP", "PM: Aman CAC confirmed at EGP 10", "ACTUAL", "High"),
  I("cacUsd", "Reference only: fintech CAC benchmark (investing & trading)", "Customer Acquisition", 166, "USD", "First Page Sage (US-centric); not used in the calculation", "BENCHMARK", "Low"),
  I("fx", "USD/EGP exchange rate", "Customer Acquisition", 52, "EGP per USD", "Wise market rate, 14–16 Sep 2026 (51.35–52.24)", "EXTERNAL FACT", "Medium"),
  // Behaviour
  I("firstInvestment", "Average first investment", "Customer Investment Behavior", 1000, "EGP", PM, "ASSUMPTION", "Low"),
  I("monthlyInvestment", "Average monthly investment (per repeat investor)", "Customer Investment Behavior", 6000, "EGP", PM, "ASSUMPTION", "Low"),
  I("goldPrice", "Gold market price (24k)", "Pricing", null, "EGP/gram", "Not entered — live price feed required", "UNKNOWN", "None"),
  I("txnFreq", "Average transactions per year", "Customer Investment Behavior", null, "txn/yr", "PM will provide", "UNKNOWN", "None"),
  I("holdingMonths", "Average holding period", "Customer Investment Behavior", null, "months", "PM will provide", "UNKNOWN", "None"),
  I("buySellRatio", "Buy/sell ratio (buy value per 1 of sell value)", "Customer Investment Behavior", null, "ratio", "PM will provide — sell side excluded until entered", "UNKNOWN", "None"),
  // Pricing
  I("spread", "Spread per transaction (each side)", "Pricing", 0.5, "%", PM, "ASSUMPTION", "Medium"),
  I("fee", "Transaction fee", "Pricing", 0, "%", PM + " (no fees)", "ASSUMPTION", "Medium"),
  I("minTxn", "Minimum transaction", "Pricing", null, "EGP", "PM will provide", "UNKNOWN", "None"),
  I("maxTxn", "Maximum transaction", "Pricing", null, "EGP", "PM will provide", "UNKNOWN", "None"),
  // Costs
  I("pgw", "Payment gateway cost (purchases via prepaid card balance)", "Costs", 0, "%", PM + " (purchase debits Aman prepaid card balance; no PGW involved)", "ASSUMPTION", "Medium"),
  I("topupCost", "Prepaid card top-up cost to Aman (via InstaPay)", "Costs", 0, "%", PM + " (no cost for feeding the card)", "ASSUMPTION", "Medium"),
  I("cashShare", "Share of in-house team cost that is incremental cash", "Costs", 0, "%", PM + " (team is in-house; no additional cost)", "ASSUMPTION", "Medium"),
  I("providerRegulatory", "Provider carries regulatory/licensing responsibility (1 = yes)", "Product", 1, "flag", PM + " (provider handles everything; no outside certificate needed)", "ASSUMPTION", "Low"),
  I("providerCost", "Gold provider cost (mngm/Evolve)", "Costs", 0, "%", PM + " (no fees)", "ASSUMPTION", "Medium"),
  I("custodyCost", "Custody cost", "Costs", 0, "%", PM + " (no fees)", "ASSUMPTION", "Medium"),
  I("opsTeamFte", "Run team (ops + support + tech), in-house, FTE", "Costs", 3, "FTE", "AI estimate of minimum run team (opportunity-cost view)", "ESTIMATE", "Low"),
  I("fteMonthCost", "Loaded cost per FTE-month", "Costs", 60000, "EGP", PLACE + " (used for opportunity cost only; cash impact = cash share x this)", "ESTIMATE", "Low"),
  // Product
  I("mvpFteMonths", "MVP build effort", "Product", 22, "FTE-months", "AI estimate: 1 PM, 1 designer, 2 BE, 2 mobile, 1 QA, 0.5 risk/finance × ~4 mo", "ESTIMATE", "Low"),
  I("integrationFteMonths", "Provider integration effort (mngm/Evolve API + recon)", "Product", 6, "FTE-months", "AI estimate; requires provider API scoping", "ESTIMATE", "Low"),
  I("launchMonths", "Launch timeline", "Product", 5, "months", "AI estimate (build + provider/legal onboarding)", "ESTIMATE", "Low"),
  // Modelling parameters
  I("churn", "Monthly churn of repeat investors", "Modelling Parameters", 4, "%/month", "AI placeholder — no Aman data on holding/retention", "ESTIMATE", "Low"),
  I("cohortY2", "Year-2 new-cohort size vs Year 1", "Modelling Parameters", 50, "%", "AI placeholder: addressable-pool saturation", "ESTIMATE", "Low"),
  I("cohortY3", "Year-3 new-cohort size vs Year 1", "Modelling Parameters", 25, "%", "AI placeholder: addressable-pool saturation", "ESTIMATE", "Low"),
  I("failureRate", "Transaction failure rate", "Modelling Parameters", 0, "%", "No data - 0% assumed; stress-tested at +5%", "ASSUMPTION", "Low"),
].map((i) => [i.key, i]));
