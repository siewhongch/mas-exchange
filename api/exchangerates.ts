import type { Request, Response } from 'express';

const MAS_CATALOGUE_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily';

/**
 * Serverless API handler to pull live exchange rates from the MAS API Catalogue
 * Endpoint: GET /api/exchangerates
 *
 * Query Parameters:
 *   - end_of_day (optional): Date in format YYYY-MM-DD (e.g. 2026-10-14)
 *
 * Headers:
 *   - KeyId (optional if MAS_KEY_ID env var is set): Your MAS API Catalogue KeyId
 */
export default async function handler(req: Request, res: Response) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-key-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported on this endpoint.',
    });
  }

  // 1. Resolve MAS KeyId (do not hardcode: pull from env or request headers)
  const masKeyId =
    (req.headers['keyid'] as string) ||
    (req.headers['x-key-id'] as string) ||
    (req.query.key_id as string) ||
    process.env.MAS_KEY_ID ||
    process.env.MAS_API_KEY ||
    '';

  if (!masKeyId.trim()) {
    return res.status(401).json({
      error: 'Unauthorized / KeyId Missing',
      message:
        'MAS KeyId is not configured. Please set MAS_KEY_ID in your environment (.env) or pass the KeyId header in your request.',
      exampleHeader: 'KeyId: your_mas_api_key_id',
      documentation:
        'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily',
    });
  }

  // 2. Resolve target date (defaults to query param or formatted current/recent date)
  let targetDate = (req.query.end_of_day as string) || '';
  if (!targetDate) {
    // If not supplied, construct recent date (e.g., 2026-10-14 as per prompt example)
    const now = new Date();
    // Default to yesterday to ensure end-of-day market close availability
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    targetDate = yesterday.toISOString().split('T')[0];
  }

  const queryUrl = `${MAS_CATALOGUE_URL}?end_of_day=${encodeURIComponent(targetDate)}`;

  try {
    const upstreamResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        KeyId: masKeyId,
        Accept: 'application/json',
        'User-Agent': 'LionRate-MAS-Proxy/1.0',
      },
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';
    let responseData: any;

    if (contentType.includes('application/json')) {
      responseData = await upstreamResponse.json();
    } else {
      const text = await upstreamResponse.text();
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { rawResponse: text };
      }
    }

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        error: 'MAS API Upstream Error',
        statusCode: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        details: responseData,
        requestedUrl: queryUrl,
      });
    }

    // Return the live MAS exchange rates data
    return res.status(200).json({
      success: true,
      source: 'Monetary Authority of Singapore (MAS) API Catalogue',
      queryDate: targetDate,
      endpoint: queryUrl,
      data: responseData,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error connecting to MAS API:', error);
    return res.status(502).json({
      error: 'Bad Gateway / Connection Error',
      message: 'Failed to communicate with the MAS API catalogue.',
      details: error?.message || String(error),
      requestedUrl: queryUrl,
    });
  }
}
