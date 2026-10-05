export type AssetType = 'STOCK' | 'ETF' | 'CRYPTO' | 'FOREX' | 'OTHER';
export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';
export type PricesStatus = 'ok' | 'partial' | 'unavailable';

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  exchange: string;
  currency: string;
};

export type Position = {
  asset: Asset | null;
  quantity: number;
  averageCost: number;
  investedAmount: number;
  marketPrice: number | null;
  marketValue: number;
  unrealizedPl: number;
  realizedPl: number;
  totalPl: number;
  dailyChange: number | null;
  priceAvailable: boolean;
  lastUpdated: string | null;
};

export type Summary = {
  currency: string;
  cash: number;
  investedAmount: number;
  marketValue: number;
  portfolioValue: number;
  realizedPl: number;
  unrealizedPl: number;
  totalPl: number;
  depositsIn: number;
  returnPercent: number | null;
  dailyChange: number | null;
  dailyChangePercent: number | null;
  pricesStatus: PricesStatus;
  pricesError: string | null;
  positions: Position[];
  allocation: { symbol: string; name: string; value: number; percent: number }[];
  plByAsset: { symbol: string; name: string; pl: number }[];
};

export type PortfolioItem = {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  summary: Summary;
};

export type PortfolioDetail = {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  summary: Summary;
};

export type Overview = {
  currency: string | null;
  aggregated: boolean;
  portfolios: PortfolioItem[];
  summary: Summary | null;
  performance: { date: string; value: number }[];
};

export type Performance = {
  range: string;
  pricesStatus: PricesStatus;
  pricesError: string | null;
  points: { date: string; value: number }[];
};

export type Transaction = {
  id: string;
  type: TransactionType;
  quantity: number;
  price: number;
  fees: number;
  currency: string;
  executedAt: string;
  createdAt: string;
  asset: Asset | null;
};

export type CreateTransactionInput = {
  type: TransactionType;
  symbol?: string;
  name?: string;
  assetType?: AssetType;
  exchange?: string;
  quantity: number;
  price: number;
  fees?: number;
  executedAt: string;
};
