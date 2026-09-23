export type TxType = "BUY" | "SELL";
export type TxStatus = "Completed" | "Processing" | "Failed";

export interface Transaction {
  id: string;
  type: TxType;
  ts: number; // epoch ms
  grams: number;
  pricePerGram: number; // buy price for BUY, sell price for SELL
  gross: number; // grams * price
  fee: number;
  net: number; // BUY: total paid (gross + fee); SELL: proceeds (gross - fee)
  status: TxStatus;
  paymentMethod: string;
  cashBefore: number;
  cashAfter: number;
  goldBefore: number;
  goldAfter: number;
  realizedPnl?: number; // SELL only
}

export interface Customer {
  name: string;
  mobile: string;
  nationalIdMasked: string;
  dob: string;
  address: string | null; // null => KYC incomplete (demo toggle)
  nationality: string;
  accountStatus: string;
}

export interface WalletSummary {
  grams: number;
  costBasis: number; // cost of gold currently held (average-cost method)
  avgBuyPrice: number;
  marketValue: number; // grams * sell price (what the customer would receive before fees)
  unrealizedPnl: number;
  unrealizedPct: number;
  realizedPnl: number;
  totalPnl: number;
}

export interface Quote {
  side: TxType;
  price: number;
  expiresAt: number;
  mid: number;
}

export interface PricePoint { t: number; p: number }
export type Range = "1D" | "1W" | "1M" | "3M" | "1Y";

/** Contract for any market-data source (mock today, provider API later). */
export interface MarketDataProvider {
  getCurrentGoldPrice(): number; // mid-market EGP/gram
  getHistoricalGoldPrices(range: Range): PricePoint[];
  getBuyPrice(): number;
  getSellPrice(): number;
  isAvailable(): boolean;
}
