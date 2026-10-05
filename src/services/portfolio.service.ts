import type {
  CreateTransactionInput,
  Overview,
  Performance,
  PortfolioDetail,
  PortfolioItem,
  Transaction,
} from '../types/portfolio';
import { api } from './api';

export const portfolioService = {
  overview(range = '1Y') {
    return api<Overview>(`/portfolios/overview?range=${range}`);
  },
  list() {
    return api<PortfolioItem[]>('/portfolios');
  },
  get(id: string) {
    return api<PortfolioDetail>(`/portfolios/${id}`);
  },
  create(input: { name: string; currency: string }) {
    return api<{ id: string; name: string; currency: string }>('/portfolios', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  remove(id: string) {
    return api<void>(`/portfolios/${id}`, { method: 'DELETE' });
  },
  performance(id: string, range = '1Y') {
    return api<Performance>(`/portfolios/${id}/performance?range=${range}`);
  },
  transactions(id: string) {
    return api<Transaction[]>(`/portfolios/${id}/transactions`);
  },
  createTransaction(id: string, input: CreateTransactionInput) {
    return api<Transaction>(`/portfolios/${id}/transactions`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  removeTransaction(portfolioId: string, transactionId: string) {
    return api<void>(`/portfolios/${portfolioId}/transactions/${transactionId}`, {
      method: 'DELETE',
    });
  },
};
