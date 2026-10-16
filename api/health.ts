import type { Request, Response } from 'express';

/**
 * Health check endpoint for the MAS Exchange Rate Serverless API
 * Route: GET /api/health
 */
export default async function handler(req: Request, res: Response) {
  const masKeyConfigured = Boolean(process.env.MAS_KEY_ID || process.env.MAS_API_KEY);

  res.status(200).json({
    status: 'ok',
    service: 'MAS Exchange Rates Serverless API',
    timestamp: new Date().toISOString(),
    masKeyConfigured,
    masCatalogueEndpoint: 'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
    endpoints: {
      health: '/api/health',
      exchangeRates: '/api/exchangerates?end_of_day=YYYY-MM-DD',
    },
  });
}
