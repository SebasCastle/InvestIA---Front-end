import { api } from './api';
import type { Fundamentals, NewsArticle } from '../types/insights';

export type SymbolHit = {
  symbol: string;
  name: string;
  type: string;
  exchange: string | null;
  currency: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
};

export type Candle = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
};

export type TradingSession = {
  symbol: string;
  requestedDate: string;
  sessionDate: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  usedPreviousClose: boolean;
  message: string | null;
};

export const marketDataService = {
  search(query: string) {
    return api<SymbolHit[]>(`/market-data/search?q=${encodeURIComponent(query)}`);
  },
  history(symbol: string, from: string, to: string) {
    return api<{ symbol: string; prices: Candle[] }>(
      `/market-data/history/${encodeURIComponent(symbol)}?from=${from}&to=${to}`,
    );
  },
  quotes(symbols: string[]) {
    return api<{ quotes: Record<string, { symbol: string; price: number; change: number; changePercent: number; lastUpdated: string }>; pricesStatus: string; error: string | null }>(
      `/market-data/quotes?symbols=${encodeURIComponent(symbols.join(','))}`,
    );
  },
  fundamentals(symbol: string) {
    return api<Fundamentals>(`/market-data/fundamentals/${encodeURIComponent(symbol)}`);
  },
  news(symbol: string) {
    return api<{ articles: NewsArticle[] }>(`/market-data/news/${encodeURIComponent(symbol)}`);
  },
  session(symbol: string, date: string) {
    return api<TradingSession>(
      `/market-data/history/${encodeURIComponent(symbol)}/session?date=${date}`,
    );
  },
};
