// ウォレット関連の型定義
export interface Wallet {
  id: string;
  address: string;
  alias: string;
  network: 'ethereum' | 'polygon' | 'arbitrum' | 'base' | 'optimism' | 'bsc' | 'avalanche' | 'solana';
  createdAt: Date;
}

// トークン関連の型定義
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  usdPrice?: number;
  usdValue?: number;
  percentChange24h?: number;
  logo?: string;
}

// NFT関連の型定義
export interface NFT {
  tokenId: string;
  contractAddress: string;
  name: string;
  description?: string;
  image?: string;
  collection?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

// ポートフォリオデータの型定義
export interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  tokens: Token[];
  nfts: NFT[];
  nativeBalance: {
    balance: string;
    balanceFormatted: string;
    usdPrice?: number;
    usdValue?: number;
  };
}

// ウォレットポートフォリオの型定義
export interface WalletPortfolio {
  totalValue: number;
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: number;
    value: number;
    price: number;
    change24h: number;
    logoUrl?: string;
  }>;
  nativeToken: {
    symbol: string;
    balance: number;
    value: number;
    price: number;
    change24h: number;
  };
  lastUpdated: Date;
  loading: boolean;
  error?: string;
}

// ダッシュボードレイアウト項目の型定義
export interface DashboardLayoutItem {
  id: string;
  isVisible: boolean;
  order: number;
}

// ユーザー設定の型定義
export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: 'USD' | 'JPY';
  dashboardLayout: DashboardLayoutItem[];
}

// アプリケーション全体の状態の型定義
export interface AppState {
  user: {
    id: string;
    preferences: UserPreferences;
  };
  wallets: Wallet[];
  portfolios: { [walletId: string]: WalletPortfolio };
  ui: {
    sidebarOpen: boolean;
    activeModal: string | null;
    loading: boolean;
  };
}

// API レスポンスの型定義
export interface MoralisTokenResponse {
  token_address: string;
  symbol: string;
  name: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  total_supply?: string;
  total_supply_formatted?: string;
  percentage_relative_to_total_supply?: number;
  usd_price?: number;
  usd_price_24hr_percent_change?: number;
  usd_price_24hr_usd_change?: number;
  usd_value?: number;
  usd_value_24hr_usd_change?: number;
  native_token?: boolean;
  portfolio_percentage?: number;
}

export interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

// エラーの型定義
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface TokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  balance_formatted: string;
  possible_spam: boolean;
  verified_contract?: boolean;
  usd_price?: number;
  usd_value?: number;
  usd_price_24hr_percent_change?: number;
}