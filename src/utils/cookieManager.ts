import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'crypto_portfolio_user_id';
const WALLETS_KEY = 'crypto_portfolio_wallets';
const SETTINGS_KEY = 'crypto_portfolio_settings';

// ユーザーIDの管理
export const getUserId = (): string => {
  let userId = Cookies.get(USER_ID_KEY);
  if (!userId) {
    userId = uuidv4();
    Cookies.set(USER_ID_KEY, userId, { expires: 365 });
  }
  return userId;
};

// ウォレット情報の管理
export const getWallets = (): any[] => {
  const wallets = Cookies.get(WALLETS_KEY);
  return wallets ? JSON.parse(wallets) : [];
};

export const saveWallets = (wallets: any[]) => {
  Cookies.set(WALLETS_KEY, JSON.stringify(wallets), { expires: 365 });
};

// 設定情報の管理
export const getSettings = (): any => {
  const settings = Cookies.get(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {};
};

export const saveSettings = (settings: any) => {
  Cookies.set(SETTINGS_KEY, JSON.stringify(settings), { expires: 365 });
};

// 設定情報の管理（新しい関数名）
export const getPreferences = (): any => {
  const preferences = Cookies.get(SETTINGS_KEY);
  return preferences ? JSON.parse(preferences) : {
    theme: 'light',
    currency: 'USD',
    dashboardLayout: [],
  };
};

export const savePreferences = (preferences: any) => {
  Cookies.set(SETTINGS_KEY, JSON.stringify(preferences), { expires: 365 });
};

// 全データのクリア
export const clearAllData = () => {
  Cookies.remove(USER_ID_KEY);
  Cookies.remove(WALLETS_KEY);
  Cookies.remove(SETTINGS_KEY);
};

// Wallet validation
export const validateWalletAddress = (address: string, network: string): boolean => {
  if (network === 'Ethereum') {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  if (network === 'Solana') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  return false;
};

export const detectNetwork = (address: string): string | null => {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return 'Ethereum';
  }
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return 'Solana';
  }
  return null;
};

export const addWallet = (wallet: any) => {
  const wallets = getWallets();
  if (wallets.some(w => w.address === wallet.address)) {
    throw new Error('This wallet address is already registered.');
  }
  saveWallets([...wallets, wallet]);
};

export const updateWallet = (updatedWallet: any) => {
  const wallets = getWallets();
  const newWallets = wallets.map(w => (w.address === updatedWallet.address ? updatedWallet : w));
  saveWallets(newWallets);
};

export const deleteWallet = (address: string) => {
  const wallets = getWallets();
  const newWallets = wallets.filter(w => w.address !== address);
  saveWallets(newWallets);
};

