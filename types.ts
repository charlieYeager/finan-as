export enum ValuationType {
  UNDERVALUED = 'Barato',
  FAIR = 'Justo',
  OVERVALUED = 'Caro',
  UNKNOWN = 'Desconhecido'
}

export interface Metric {
  name: string;
  value: string;
  score: number; // 0-100 for visualization
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url?: string;
}

export interface KeyStats {
  marketCap: string;      // Valor de Mercado
  peRatio: string;        // P/L
  dividendYield: string;  // Dividend Yield
  week52High: string;     // Máxima 52 sem
  week52Low: string;      // Mínima 52 sem
}

export interface StockData {
  symbol: string;
  companyName: string;
  currentPrice: string;
  currency: string;
  sector: string;
  description: string;
  pros: string[];
  cons: string[];
  keyStats: KeyStats; // Novos dados públicos
  news: NewsItem[];   // Novas notícias
  valuation: ValuationType;
  financialHealthScore: number; // 0-100
  metrics: Metric[];
  lastUpdated: string;
}

export interface MarketRecommendation {
  symbol: string;
  name: string;
  price: string;
  reason: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface SectorRecommendation {
  sectorName: string;
  stocks: MarketRecommendation[];
}

export type ViewState = 'search' | 'market';