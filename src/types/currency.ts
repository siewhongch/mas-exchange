export type CurrencyRegion = 'ASEAN' | 'Major' | 'Asia-Pacific' | 'Europe' | 'Americas' | 'Middle East';

export interface Currency {
  code: string;
  name: string;
  country: string;
  flag: string;
  symbol: string;
  region: CurrencyRegion;
  rateToSGD: number;       // SGD per 1 unit of foreign currency (e.g., USD = 1.3480)
  rateFromSGD: number;     // Foreign units per 1 SGD (e.g., 1 SGD = 0.7418 USD)
  masUnit: 1 | 100;        // MAS standard quotation unit (e.g., JPY, IDR, KRW quoted per 100 units)
  change24h: number;       // Percentage change over 24h (e.g., +0.24)
  high24h: number;         // 24h high in rateFromSGD
  low24h: number;          // 24h low in rateFromSGD
  sparkline: number[];     // 7 days historical trend
  popularityRank: number;  // 1 = highest in Singapore (MYR, USD, JPY, etc.)
  travelNote?: string;
  isPeggedToSGD?: boolean; // True for BND (Brunei Dollar CIA)
  masFieldKey: string;     // MAS API datastore column key, e.g., 'usd_sgd' or 'myr_sgd_100'
}

export type RateDisplayMode = 'fromSGD' | 'toSGD' | 'masFormat';
export type ViewMode = 'table' | 'cards';

export interface MasApiConfig {
  apiKey: string;
  endpointUrl: string;
  useBackendProxy: boolean;
  proxyEndpoint: string;
}
