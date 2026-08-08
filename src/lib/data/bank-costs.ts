/**
 * Standard trade finance costs (based on ICC Banking Commission surveys).
 * These are world-average rates — users can modify per negotiation with their bank.
 */

export interface BankCostItem {
  id: string;
  label: string;
  description: string;
  basis: "percent" | "per_drawing" | "fixed" | "per_period";
  defaultValue: number; // percentage or fixed amount
  appliesTo: "lc_issuance" | "lc_advising" | "lc_confirmation" | "lc_discount" | "bank_guarantee" | "standby_lc" | "transfer_lc";
  applicablePaymentMethods: string[]; // which payment methods trigger this cost
}

export const BANK_COSTS: BankCostItem[] = [
  {
    id: "lc_issuance_fee",
    label: "LC Issuance Fee",
    description: "Fee for issuing a Letter of Credit (paid by buyer/applicant)",
    basis: "percent",
    defaultValue: 0.125, // 0.125% of LC value per quarter (typical)
    appliesTo: "lc_issuance",
    applicablePaymentMethods: ["lc_sight", "lc_30", "lc_60", "lc_90", "lc_confirmed", "lc_transferable"],
  },
  {
    id: "lc_advising_fee",
    label: "LC Advising Fee",
    description: "Fee for advising an LC (paid by beneficiary/seller)",
    basis: "fixed",
    defaultValue: 100, // $100-$500 typical flat fee
    appliesTo: "lc_advising",
    applicablePaymentMethods: ["lc_sight", "lc_30", "lc_60", "lc_90", "lc_confirmed", "lc_transferable"],
  },
  {
    id: "lc_confirmation_fee",
    label: "LC Confirmation Fee",
    description: "Fee for confirming an LC by the advising bank (adds bank's payment guarantee)",
    basis: "percent",
    defaultValue: 0.2, // 0.1-0.3% of LC value per quarter
    appliesTo: "lc_confirmation",
    applicablePaymentMethods: ["lc_confirmed"],
  },
  {
    id: "lc_discount_fee",
    label: "LC Discount/Negotiation Fee",
    description: "Fee for discounting/negotiating LC documents (getting paid before maturity)",
    basis: "percent",
    defaultValue: 0.15, // 0.1-0.25% of drawing amount
    appliesTo: "lc_discount",
    applicablePaymentMethods: ["lc_30", "lc_60", "lc_90"],
  },
  {
    id: "lc_amendment_fee",
    label: "LC Amendment Fee",
    description: "Fee for amending an LC (per amendment)",
    basis: "fixed",
    defaultValue: 50, // $50-$200 per amendment
    appliesTo: "lc_issuance",
    applicablePaymentMethods: ["lc_sight", "lc_30", "lc_60", "lc_90", "lc_confirmed", "lc_transferable"],
  },
  {
    id: "lc_discrepancy_fee",
    label: "Discrepancy Fee",
    description: "Fee per discrepancy in documents under LC (if any)",
    basis: "fixed",
    defaultValue: 75, // $50-$100 per discrepancy
    appliesTo: "lc_issuance",
    applicablePaymentMethods: ["lc_sight", "lc_30", "lc_60", "lc_90", "lc_confirmed", "lc_transferable"],
  },
  {
    id: "bank_guarantee_fee",
    label: "Bank Guarantee Fee",
    description: "Fee for issuing a bank guarantee (performance, advance payment, etc.)",
    basis: "percent",
    defaultValue: 1.0, // 0.5-2% per year of guarantee amount
    appliesTo: "bank_guarantee",
    applicablePaymentMethods: ["advance_100", "tt_advance", "30_70_bl", "20_80_bl", "50_50"],
  },
  {
    id: "swift_charges",
    label: "SWIFT/Telex Charges",
    description: "Per-message SWIFT charges for LC/bank communication",
    basis: "fixed",
    defaultValue: 25, // $15-$40 per message
    appliesTo: "lc_issuance",
    applicablePaymentMethods: ["lc_sight", "lc_30", "lc_60", "lc_90", "lc_confirmed", "lc_transferable"],
  },
  {
    id: "correspondent_bank_fee",
    label: "Correspondent Bank Fee",
    description: "Fee charged by correspondent banks for LC processing",
    basis: "fixed",
    defaultValue: 50, // $25-$100
    appliesTo: "lc_issuance",
    applicablePaymentMethods: ["lc_sight", "lc_30", "lc_60", "lc_90", "lc_confirmed", "lc_transferable"],
  },
  {
    id: "standby_lc_fee",
    label: "Standby LC Fee",
    description: "Fee for issuing a Standby Letter of Credit",
    basis: "percent",
    defaultValue: 0.5, // 0.25-1% per year
    appliesTo: "standby_lc",
    applicablePaymentMethods: ["advance_100", "tt_advance", "30_70_bl", "20_80_bl", "50_50"],
  },
  {
    id: "transfer_lc_fee",
    label: "Transfer LC Fee",
    description: "Fee for transferring an LC to a second beneficiary (back-to-back)",
    basis: "percent",
    defaultValue: 0.1, // 0.1% of transferred amount
    appliesTo: "transfer_lc",
    applicablePaymentMethods: ["lc_transferable"],
  },
];

export interface BankCostResult {
  id: string;
  label: string;
  amount: number;
  basis: string;
}

/**
 * Calculate bank costs based on payment method + transaction value.
 * Returns a list of cost items with calculated amounts.
 */
export function calculateBankCosts(
  paymentMethod: string,
  transactionValue: number, // total deal value in the payment currency
  customRates?: Record<string, number>, // override defaults
  numDrawings?: number, // for per_drawing costs
): BankCostResult[] {
  const results: BankCostResult[] = [];

  for (const cost of BANK_COSTS) {
    // Check if this cost applies to the selected payment method
    if (!cost.applicablePaymentMethods.includes(paymentMethod)) continue;

    const rate = customRates?.[cost.id] ?? cost.defaultValue;
    let amount = 0;

    switch (cost.basis) {
      case "percent":
        amount = (transactionValue * rate) / 100;
        break;
      case "fixed":
        amount = rate;
        break;
      case "per_drawing":
        amount = rate * (numDrawings || 1);
        break;
      case "per_period":
        // Per quarter — assume 1 quarter for now
        amount = (transactionValue * rate) / 100;
        break;
    }

    results.push({
      id: cost.id,
      label: cost.label,
      amount: Math.round(amount * 100) / 100,
      basis: cost.basis,
    });
  }

  return results;
}

/**
 * Get applicable bank costs for a payment method (for UI display).
 */
export function getBankCostsForPaymentMethod(paymentMethod: string): BankCostItem[] {
  return BANK_COSTS.filter((c) => c.applicablePaymentMethods.includes(paymentMethod));
}
