import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Wallet, UserPreferences, WalletPortfolio } from '../types';
import { getUserId, getWallets, getPreferences, savePreferences, saveWallets } from '../utils/cookieManager';
import { apiService, WalletPortfolioData } from '../services/api';

// アクションの型定義
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null }
  | { type: 'SET_WALLETS'; payload: Wallet[] }
  | { type: 'ADD_WALLET'; payload: Wallet }
  | { type: 'UPDATE_WALLET'; payload: { id: string; updates: Partial<Wallet> } }
  | { type: 'DELETE_WALLET'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'SET_PORTFOLIO'; payload: { walletId: string; portfolio: WalletPortfolio } }
  | { type: 'SET_PORTFOLIO_LOADING'; payload: { walletId: string; loading: boolean } }
  | { type: 'SET_PORTFOLIO_ERROR'; payload: { walletId: string; error: string } };

// 初期状態
const initialState: AppState = {
  user: {
    id: '',
    preferences: {
      theme: 'light',
      currency: 'USD',
      dashboardLayout: [],
    },
  },
  wallets: [],
  portfolios: {},
  ui: {
    sidebarOpen: false,
    activeModal: null,
    loading: false,
  },
};

// リデューサー
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload },
      };

    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload },
      };

    case 'SET_ACTIVE_MODAL':
      return {
        ...state,
        ui: { ...state.ui, activeModal: action.payload },
      };

    case 'SET_WALLETS':
      return {
        ...state,
        wallets: action.payload,
      };

    case 'ADD_WALLET':
      const updatedWallets = [...state.wallets, action.payload];
      saveWallets(updatedWallets);
      return {
        ...state,
        wallets: updatedWallets,
      };

    case 'UPDATE_WALLET':
      const updatedWalletList = state.wallets.map(wallet =>
        wallet.id === action.payload.id
          ? { ...wallet, ...action.payload.updates }
          : wallet
      );
      saveWallets(updatedWalletList);
      return {
        ...state,
        wallets: updatedWalletList,
      };

    case 'DELETE_WALLET':
      const { [action.payload]: deletedPortfolio, ...remainingPortfolios } = state.portfolios;
      const filteredWallets = state.wallets.filter(wallet => wallet.id !== action.payload);
      saveWallets(filteredWallets);
      return {
        ...state,
        wallets: filteredWallets,
        portfolios: remainingPortfolios,
      };

    case 'SET_PREFERENCES':
      return {
        ...state,
        user: { ...state.user, preferences: action.payload },
      };

    case 'SET_PORTFOLIO':
      return {
        ...state,
        portfolios: {
          ...state.portfolios,
          [action.payload.walletId]: action.payload.portfolio,
        },
      };

    case 'SET_PORTFOLIO_LOADING':
      return {
        ...state,
        portfolios: {
          ...state.portfolios,
          [action.payload.walletId]: {
            ...state.portfolios[action.payload.walletId],
            loading: action.payload.loading,
          },
        },
      };

    case 'SET_PORTFOLIO_ERROR':
      return {
        ...state,
        portfolios: {
          ...state.portfolios,
          [action.payload.walletId]: {
            ...state.portfolios[action.payload.walletId],
            error: action.payload.error,
            loading: false,
          },
        },
      };

    default:
      return state;
  }
};

// コンテキストの型定義
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // ヘルパー関数
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  updatePreferences: (preferences: UserPreferences) => void;
  refreshWallets: () => void;
  fetchWalletPortfolio: (walletId: string) => Promise<void>;
  fetchAllPortfolios: () => Promise<void>;
}

// コンテキストの作成
const AppContext = createContext<AppContextType | undefined>(undefined);

// プロバイダーコンポーネント
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初期化処理
  useEffect(() => {
    const initializeApp = () => {
      try {
        // ユーザーIDの取得（初期化のため）
        getUserId();

        // ウォレットの読み込み
        const wallets = getWallets();

        // 設定の読み込み
        const preferences = getPreferences();

        // 状態の更新
        dispatch({ type: 'SET_WALLETS', payload: wallets });
        dispatch({ type: 'SET_PREFERENCES', payload: preferences });
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  // ヘルパー関数
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  };

  const setActiveModal = (modal: string | null) => {
    dispatch({ type: 'SET_ACTIVE_MODAL', payload: modal });
  };

  const updatePreferences = (preferences: UserPreferences) => {
    dispatch({ type: 'SET_PREFERENCES', payload: preferences });
    savePreferences(preferences);
  };

  const refreshWallets = () => {
    const wallets = getWallets();
    dispatch({ type: 'SET_WALLETS', payload: wallets });
  };

  const fetchWalletPortfolio = async (walletId: string) => {
    const wallet = state.wallets.find(w => w.id === walletId);
    if (!wallet) return;

    dispatch({ type: 'SET_PORTFOLIO_LOADING', payload: { walletId, loading: true } });

    try {
      const portfolioData = await apiService.getWalletPortfolio(wallet.address, wallet.network);

      const portfolio: WalletPortfolio = {
        totalValue: portfolioData.totalUsdValue,
        tokens: portfolioData.tokens.map(token => ({
          address: token.token_address,
          symbol: token.symbol,
          name: token.name,
          balance: parseFloat(token.balance_formatted),
          value: token.usd_value || 0,
          price: token.usd_price || 0,
          change24h: token.usd_price_24hr_percent_change || 0,
          logoUrl: token.logo,
        })),
        nativeToken: {
          symbol: wallet.network === 'ethereum' ? 'ETH' : 'SOL',
          balance: parseFloat(portfolioData.nativeBalance.balance_formatted),
          value: portfolioData.nativeBalance.usd_value || 0,
          price: portfolioData.nativeBalance.usd_price || 0,
          change24h: portfolioData.nativeBalance.usd_price_24hr_percent_change || 0,
        },
        lastUpdated: portfolioData.lastUpdated,
        loading: false,
      };

      dispatch({ type: 'SET_PORTFOLIO', payload: { walletId, portfolio } });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      dispatch({ 
        type: 'SET_PORTFOLIO_ERROR', 
        payload: { walletId, error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  };

  const fetchAllPortfolios = async () => {
    setLoading(true);
    try {
      await Promise.all(state.wallets.map(wallet => fetchWalletPortfolio(wallet.id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.wallets.length > 0) {
      fetchAllPortfolios();
    }
  }, [state.wallets.length]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    setLoading,
    setSidebarOpen,
    setActiveModal,
    updatePreferences,
    refreshWallets,
    fetchWalletPortfolio,
    fetchAllPortfolios,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// カスタムフック
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// useAppContextのエイリアス（後方互換性のため）
export const useAppContext = useApp;

// 個別のカスタムフック
export const useWallets = () => {
  const { state } = useApp();
  return state.wallets;
};

export const usePortfolios = () => {
  const { state } = useApp();
  return state.portfolios;
};

export const usePreferences = () => {
  const { state } = useApp();
  return state.user.preferences;
};

export const useUI = () => {
  const { state } = useApp();
  return state.ui;
};