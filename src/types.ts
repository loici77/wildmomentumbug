export interface Stock {
  id: string;
  name: string;
  code: string;
  market: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  foreign_net: number;
  inst_net: number;
  indiv_net: number;
  momentum_score: number;
  per: number;
}

export interface NewsItem {
  id: number;
  stock_id: string;
  title: string;
  source: string;
  date: string;
  content?: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: number;
  percent: number;
}
