
// API service for fetching token and price data
export interface TokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  logo?: string;
  decimals: number;
  balance: string;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
  usd_price_24hr_percent_change?: number;
  possible_spam: boolean;
  verified_contract: boolean;
}

export interface NativeBalance {
  balance: string;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
  usd_price_24hr_percent_change?: number;
}

export interface WalletPortfolioData {
  address: string;
  network: string;
  nativeBalance: NativeBalance;
  tokens: TokenBalance[];
  totalUsdValue: number;
  lastUpdated: Date;
  loading: boolean;
  error?: string;
}

class APIService {
  private moralisApiKey: string;
  private coinGeckoApiKey: string | null;

  constructor() {
    this.moralisApiKey = process.env.REACT_APP_MORALIS_API_KEY || '';
    this.coinGeckoApiKey = process.env.REACT_APP_COINGECKO_API_KEY || null;
  }

  // Moralis API for EVM networks (Ethereum, Polygon, BSC, etc.)
  async getEVMTokenBalances(address: string, chain: string = 'eth'): Promise<TokenBalance[]> {
    if (!this.moralisApiKey) {
      throw new Error('Moralis API key not configured');
    }

    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${chain}&exclude_spam=true`,
        {
          headers: {
            'X-API-Key': this.moralisApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error fetching EVM token balances:', error);
      throw error;
    }
  }

  // Get native token balance for EVM networks
  async getEVMNativeBalance(address: string, chain: string = 'eth'): Promise<NativeBalance> {
    if (!this.moralisApiKey) {
      throw new Error('Moralis API key not configured');
    }

    try {
      const response = await fetch(
        `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${chain}`,
        {
          headers: {
            'X-API-Key': this.moralisApiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Moralis API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        balance: data.balance,
        balance_formatted: (parseFloat(data.balance) / Math.pow(10, 18)).toFixed(6),
        usd_price: 0,
        usd_value: 0,
        usd_price_24hr_percent_change: 0,
      };
    } catch (error) {
      console.error('Error fetching EVM native balance:', error);
      throw error;
    }
  }

  // Get ETH price from CoinGecko
  async getETHPrice(): Promise<any> {
    try {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true';
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (this.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.coinGeckoApiKey;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      return data.ethereum;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return { usd: 0, usd_24h_change: 0 };
    }
  }

  // Get token prices from CoinGecko
  async getTokenPrices(tokenAddresses: string[], vsPurrency: string = 'usd'): Promise<Record<string, any>> {
    try {
      const addresses = tokenAddresses.join(',');
      const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=${vsPurrency}&include_24hr_change=true`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      if (this.coinGeckoApiKey) {
        headers['x-cg-demo-api-key'] = this.coinGeckoApiKey;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  // Get complete wallet portfolio data
  async getWalletPortfolio(address: string, network: string): Promise<WalletPortfolioData> {
    console.log(`Fetching portfolio for ${address} on ${network}`);
    console.log(`Moralis API Key configured: ${!!this.moralisApiKey}`);
    console.log(`CoinGecko API Key configured: ${!!this.coinGeckoApiKey}`);
    
    try {
      if (!this.moralisApiKey) {
        throw new Error('Moralis API key not configured. Please set REACT_APP_MORALIS_API_KEY in Secrets.');
      }

      const chainMapping: Record<string, string> = {
        'ethereum': 'eth',
        'polygon': 'polygon',
        'bsc': 'bsc',
        'avalanche': 'avalanche',
      };

      const chain = chainMapping[network.toLowerCase()] || 'eth';
      console.log(`Using chain: ${chain}`);
      
      // Get native balance and tokens in parallel
      const [nativeBalance, tokens] = await Promise.all([
        this.getEVMNativeBalance(address, chain),
        this.getEVMTokenBalances(address, chain),
      ]);

      // Get prices for tokens
      const tokenAddresses = tokens.map(token => token.token_address);
      const prices = tokenAddresses.length > 0 ? await this.getTokenPrices(tokenAddresses) : {};

      // Get ETH price for native balance
      const ethPrice = await this.getETHPrice();

      // Update native balance with price
      if (ethPrice && ethPrice.usd) {
        nativeBalance.usd_price = ethPrice.usd;
        nativeBalance.usd_value = parseFloat(nativeBalance.balance_formatted) * ethPrice.usd;
        nativeBalance.usd_price_24hr_percent_change = ethPrice.usd_24h_change || 0;
      }

      // Update tokens with prices
      const tokensWithPrices = tokens.map(token => {
        const priceData = prices[token.token_address.toLowerCase()];
        if (priceData) {
          const balanceFormatted = parseFloat(token.balance) / Math.pow(10, token.decimals);
          return {
            ...token,
            balance_formatted: balanceFormatted.toFixed(6),
            usd_price: priceData.usd,
            usd_value: balanceFormatted * priceData.usd,
            usd_price_24hr_percent_change: priceData.usd_24h_change,
          };
        }
        return {
          ...token,
          balance_formatted: (parseFloat(token.balance) / Math.pow(10, token.decimals)).toFixed(6),
        };
      });

      // Calculate total USD value
      const totalUsdValue = nativeBalance.usd_value + 
        tokensWithPrices.reduce((sum, token) => sum + (token.usd_value || 0), 0);

      console.log(`Portfolio fetch successful for ${address}:`, {
        totalUsdValue,
        nativeBalance: nativeBalance.balance_formatted,
        tokenCount: tokensWithPrices.length
      });

      return {
        address,
        network,
        nativeBalance,
        tokens: tokensWithPrices,
        totalUsdValue,
        lastUpdated: new Date(),
        loading: false,
      };
    } catch (error) {
      console.error('Error fetching wallet portfolio:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        address,
        network,
        moralisKeyPresent: !!this.moralisApiKey
      });
      throw error;
    }
  }
}

export const apiService = new APIService();
