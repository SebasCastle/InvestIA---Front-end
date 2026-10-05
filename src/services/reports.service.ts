import { downloadFile } from './api';

export const reportsService = {
  pdf(portfolioId: string, name: string) {
    return downloadFile(`/reports/portfolios/${portfolioId}/pdf`, `investai-${name}.pdf`);
  },
  xlsx(portfolioId: string, name: string) {
    return downloadFile(`/reports/portfolios/${portfolioId}/xlsx`, `investai-${name}.xlsx`);
  },
};
