
import Moralis from 'moralis';

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
  private moralisInitialized: boolean = false;

  constructor() {
    this.moralisApiKey = process.env.REACT_APP_MORALIS_API_KEY || '';
    this.coinGeckoApiKey = process.env.REACT_APP_COINGECKO_API_KEY || null;
  }

  private async initializeMoralis() {
    if (!this.moralisInitialized && this.moralisApiKey) {
      try {
        await Moralis.start({
          apiKey: this.moralisApiKey
        });
        this.moralisInitialized = true;
        console.log('Moralis initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Moralis:', error);
        throw error;
      }
    }
  }

  // Moralis API for EVM networks (Ethereum, Polygon, BSC, etc.)
  async getEVMTokenBalances(address: string, chain: string = 'eth'): Promise<TokenBalance[]> {
    if (!this.moralisApiKey) {
      throw new Error('Moralis API key not configured');
    }

    try {
      await this.initializeMoralis();

      // Convert chain name to hex format expected by Moralis
      const chainMapping: Record<string, string> = {
        'eth': '0x1',
        'polygon': '0x89',
        'bsc': '0x38',
        'avalanche': '0xa86a',
        'arbitrum': '0xa4b1',
        'base': '0x2105',
        'optimism': '0xa',
      };

      const chainId = chainMapping[chain] || '0x1';

      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        chain: chainId,
        address: address,
        excludeSpam: true
      });

      const tokens = response.raw || [];
      
      // Format the response to match TokenBalance type
      return tokens.map(token => ({
        ...token,
        balance_formatted: parseFloat(token.balance) / Math.pow(10, token.decimals)
      }));
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
      await this.initializeMoralis();

      // Convert chain name to hex format expected by Moralis
      const chainMapping: Record<string, string> = {
        'eth': '0x1',
        'polygon': '0x89',
        'bsc': '0x38',
        'avalanche': '0xa86a',
        'arbitrum': '0xa4b1',
        'base': '0x2105',
        'optimism': '0xa',
      };

      const chainId = chainMapping[chain] || '0x1';

      const response = await Moralis.EvmApi.balance.getNativeBalance({
        chain: chainId,
        address: address
      });

      const data = response.raw;
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

  // Get native token price for specific network
  async getNativeTokenPrice(network: string): Promise<any> {
    try {
      const nativeTokenMapping: Record<string, string> = {
        'ethereum': 'ethereum',
        'polygon': 'matic-network',
        'bsc': 'binancecoin',
        'avalanche': 'avalanche-2',
        'arbitrum': 'ethereum', // Arbitrum uses ETH as native token
        'base': 'ethereum', // Base uses ETH as native token
        'optimism': 'ethereum', // Optimism uses ETH as native token
      };

      const tokenId = nativeTokenMapping[network.toLowerCase()] || 'ethereum';
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`;
      
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
      return data[tokenId];
    } catch (error) {
      console.error('Error fetching native token price:', error);
      return { usd: 0, usd_24h_change: 0 };
    }
  }

  // Get ETH price from CoinGecko (kept for backwards compatibility)
  async getETHPrice(): Promise<any> {
    return this.getNativeTokenPrice('ethereum');
  }

  // Get top 100 coins by market cap
  async getTopCoins(): Promise<Record<string, any>> {
    try {
      const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h';
      
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
      
      // Create mapping of contract addresses to price data
      const priceMap: Record<string, any> = {};
      data.forEach((coin: any) => {
        if (coin.platforms && coin.platforms.ethereum) {
          priceMap[coin.platforms.ethereum.toLowerCase()] = {
            usd: coin.current_price,
            usd_24h_change: coin.price_change_percentage_24h || 0,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
          };
        }
      });

      return priceMap;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      return {};
    }
  }

  // Get token prices from CoinGecko
  async getTokenPrices(tokenAddresses: string[], vsPurrency: string = 'usd'): Promise<Record<string, any>> {
    try {
      // First try to get prices from top coins list (better data coverage)
      const topCoins = await this.getTopCoins();
      const pricesFromTopCoins: Record<string, any> = {};
      
      tokenAddresses.forEach(address => {
        const addressLower = address.toLowerCase();
        if (topCoins[addressLower]) {
          pricesFromTopCoins[addressLower] = topCoins[addressLower];
        }
      });

      // For tokens not found in top coins, use the contract address endpoint
      const remainingAddresses = tokenAddresses.filter(addr => 
        !pricesFromTopCoins[addr.toLowerCase()]
      );

      let additionalPrices: Record<string, any> = {};
      if (remainingAddresses.length > 0) {
        const addresses = remainingAddresses.join(',');
        const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addresses}&vs_currencies=${vsPurrency}&include_24hr_change=true`;
        
        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };

        if (this.coinGeckoApiKey) {
          headers['x-cg-demo-api-key'] = this.coinGeckoApiKey;
        }

        const response = await fetch(url, { headers });

        if (response.ok) {
          additionalPrices = await response.json();
        }
      }

      // Combine results
      return {
        ...pricesFromTopCoins,
        ...additionalPrices,
      };
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  // Generate portfolio history data (mock implementation)
  generatePortfolioHistory(currentValue: number, period: '1d' | '1w' | '1m' | '1y' = '1y'): { labels: string[], data: number[] } {
    const data = [];
    const labels = [];
    
    let dataPoints: number;
    let dateIncrement: number;
    let labelFormat: Intl.DateTimeFormatOptions;
    
    switch (period) {
      case '1d':
        dataPoints = 24; // 24 hours
        dateIncrement = 60 * 60 * 1000; // 1 hour
        labelFormat = { hour: 'numeric' };
        break;
      case '1w':
        dataPoints = 7; // 7 days
        dateIncrement = 24 * 60 * 60 * 1000; // 1 day
        labelFormat = { weekday: 'short' };
        break;
      case '1m':
        dataPoints = 30; // 30 days
        dateIncrement = 24 * 60 * 60 * 1000; // 1 day
        labelFormat = { month: 'short', day: 'numeric' };
        break;
      case '1y':
      default:
        dataPoints = 52; // 52 weeks
        dateIncrement = 7 * 24 * 60 * 60 * 1000; // 1 week
        labelFormat = { month: 'short', day: 'numeric' };
        break;
    }
    
    for (let i = dataPoints - 1; i >= 0; i--) {
      const date = new Date();
      date.setTime(date.getTime() - (i * dateIncrement));
      labels.push(date.toLocaleDateString('en-US', labelFormat));
      
      // Simulate historical data with some variation
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      const historicalValue = currentValue * (1 + variation);
      data.push(Math.max(0, historicalValue));
    }
    
    return { labels, data };
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
        'arbitrum': 'arbitrum',
        'base': 'base',
        'optimism': 'optimism',
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

      // Get native token price for the specific chain
      const nativeTokenPrice = await this.getNativeTokenPrice(network);

      // Update native balance with price
      if (nativeTokenPrice && nativeTokenPrice.usd) {
        nativeBalance.usd_price = nativeTokenPrice.usd;
        nativeBalance.usd_value = parseFloat(nativeBalance.balance_formatted) * nativeTokenPrice.usd;
        nativeBalance.usd_price_24hr_percent_change = nativeTokenPrice.usd_24h_change || 0;
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
      const totalUsdValue = (nativeBalance.usd_value || 0) + 
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
