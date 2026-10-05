import type { AnalyticsReport, AssetIntelligence, ChatReply } from '../types/insights';
import { api } from './api';

export const insightsService = {
  intelligence(portfolioId?: string) {
    const query = portfolioId ? `?portfolioId=${portfolioId}` : '';
    return api<{ assets: AssetIntelligence[] }>(`/intelligence${query}`);
  },
  analytics(input: { portfolioId?: string; range: string; benchmark: string }) {
    const params = new URLSearchParams({ range: input.range, benchmark: input.benchmark });
    if (input.portfolioId) {
      params.set('portfolioId', input.portfolioId);
    }
    return api<AnalyticsReport>(`/analytics?${params.toString()}`);
  },
  chat(message: string, history: { role: 'user' | 'assistant'; content: string }[]) {
    return api<ChatReply>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },
};
