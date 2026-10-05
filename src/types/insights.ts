export type NewsArticle = {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
};

export type Fundamentals = {
  symbol: string;
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  eps: number | null;
  dividendYield: number | null;
  beta: number | null;
  week52High: number | null;
  week52Low: number | null;
  lastUpdated: string;
};

export type AssetIntelligence = {
  asset: { id: string; symbol: string; name: string; type: string; exchange: string; currency: string };
  profile: { name: string; exchange: string; industry: string | null; weburl: string | null } | null;
  fundamentals: Fundamentals | null;
  news: NewsArticle[];
  error: string | null;
  lastUpdated: string | null;
};

export type AnalyticsReport = {
  portfolioId: string | null;
  name: string | null;
  currency: string | null;
  aggregated: boolean;
  range: string;
  benchmarkSymbol: string;
  performance: { date: string; value: number }[];
  benchmark: {
    available: boolean;
    portfolioReturn: number | null;
    benchmarkReturn: number | null;
    excessReturn: number | null;
    points: { date: string; portfolio: number; benchmark: number }[];
    error: string | null;
  };
  allocation: { symbol: string; name: string; value: number; percent: number }[];
  contributors: { symbol: string; name: string; pl: number }[];
  detractors: { symbol: string; name: string; pl: number }[];
  risk: {
    available: boolean;
    reason: string | null;
    observations: number;
    annualizedVolatility: number | null;
    maxDrawdownPercent: number | null;
    herfindahl: number | null;
    effectivePositions: number | null;
    largestWeight: number | null;
    sharpeRatio: number | null;
    beta: number | null;
  };
  pricesStatus: 'ok' | 'partial' | 'unavailable';
  pricesError: string | null;
};

export type ChatReply = {
  reply: string;
  toolsUsed: string[];
};
