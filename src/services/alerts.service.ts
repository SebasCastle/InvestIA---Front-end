import { api } from './api';

export type AlertKind = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'RETURN_ABOVE' | 'RETURN_BELOW';

export type AlertItem = {
  id: string;
  kind: AlertKind;
  symbol: string | null;
  threshold: number;
  enabled: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  portfolio: { id: string; name: string } | null;
};

export const alertsService = {
  list() {
    return api<AlertItem[]>('/alerts');
  },
  create(input: { kind: AlertKind; threshold: number; symbol?: string; portfolioId?: string }) {
    return api<AlertItem>('/alerts', { method: 'POST', body: JSON.stringify(input) });
  },
  remove(id: string) {
    return api<void>(`/alerts/${id}`, { method: 'DELETE' });
  },
};

export const notificationsService = {
  dailyReport() {
    return api<{ sent: boolean; reason?: string }>('/notifications/daily-report', { method: 'POST' });
  },
};
