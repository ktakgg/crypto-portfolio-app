
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const Dashboard: React.FC = () => {
  const { state, fetchAllPortfolios } = useAppContext();
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '1w' | '1m' | '1y'>('1y');

  useEffect(() => {
    if (state.wallets.length > 0) {
      fetchAllPortfolios();
    }
  }, [state.wallets.length, fetchAllPortfolios]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getChainName = (network: string) => {
    const chainNames: Record<string, string> = {
      'ethereum': 'Ethereum',
      'polygon': 'Polygon',
      'arbitrum': 'Arbitrum',
      'base': 'Base',
      'optimism': 'Optimism',
      'bsc': 'BSC',
      'avalanche': 'Avalanche',
      'solana': 'Solana',
    };
    return chainNames[network.toLowerCase()] || network;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const formattedValue = (value > 0 ? '+' : '') + value.toFixed(2) + '%';
    return <span className={value >= 0 ? "text-green-500" : "text-red-500"}>{formattedValue}</span>
  }

  // Calculate total portfolio value
  const totalPortfolioValue = Object.values(state.portfolios).reduce((sum, portfolio) => {
    return sum + (portfolio ? portfolio.totalValue : 0);
  }, 0);

  // Get portfolio value for selected wallet
  const getSelectedPortfolioValue = () => {
    if (selectedWallet === 'all') {
      return totalPortfolioValue;
    }
    const portfolio = state.portfolios[selectedWallet];
    return portfolio ? portfolio.totalValue : 0;
  };

  // Get tokens for portfolio distribution
  const getPortfolioTokens = () => {
    const allTokens: any[] = [];
    
    if (selectedWallet === 'all') {
      // All wallets
      Object.values(state.portfolios).forEach(portfolio => {
        if (portfolio && !portfolio.loading && !portfolio.error) {
          // Add native token
          const existingNative = allTokens.find(t => t.symbol === portfolio.nativeToken.symbol);
          if (existingNative) {
            existingNative.value += portfolio.nativeToken.value;
            existingNative.balance += portfolio.nativeToken.balance;
          } else {
            allTokens.push({
              symbol: portfolio.nativeToken.symbol,
              value: portfolio.nativeToken.value,
              balance: portfolio.nativeToken.balance,
            });
          }
          
          // Add other tokens
          portfolio.tokens.forEach(token => {
            const existingToken = allTokens.find(t => t.symbol === token.symbol);
            if (existingToken) {
              existingToken.value += token.value;
              existingToken.balance += token.balance;
            } else {
              allTokens.push({
                symbol: token.symbol,
                value: token.value,
                balance: token.balance,
              });
            }
          });
        }
      });
    } else {
      // Selected wallet only
      const portfolio = state.portfolios[selectedWallet];
      if (portfolio && !portfolio.loading && !portfolio.error) {
        // Add native token
        allTokens.push({
          symbol: portfolio.nativeToken.symbol,
          value: portfolio.nativeToken.value,
          balance: portfolio.nativeToken.balance,
        });
        
        // Add other tokens
        portfolio.tokens.forEach(token => {
          allTokens.push({
            symbol: token.symbol,
            value: token.value,
            balance: token.balance,
          });
        });
      }
    }
    
    return allTokens.sort((a, b) => b.value - a.value);
  };

  const portfolioTokens = getPortfolioTokens();

  // Portfolio distribution chart data
  const tokenDistributionData = {
    labels: portfolioTokens.slice(0, 8).map(token => token.symbol),
    datasets: [
      {
        data: portfolioTokens.slice(0, 8).map(token => token.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Mock historical data for portfolio value
  const generateHistoricalData = () => {
    const currentValue = getSelectedPortfolioValue();
    const data = [];
    const labels = [];
    
    let dataPoints: number;
    let dateIncrement: number;
    let labelFormat: Intl.DateTimeFormatOptions;
    
    switch (selectedPeriod) {
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
  };

  const historicalData = generateHistoricalData();

  const portfolioHistoryData = {
    labels: historicalData.labels,
    datasets: [
      {
        label: 'Portfolio Value (USD)',
        data: historicalData.data,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          },
        },
      },
    },
  };

  return (
    <div className="flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
      </div>

      {/* Wallet Selection */}
      {state.wallets.length > 0 && (
        <div className="mx-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Wallet</label>
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Wallets</option>
            {state.wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.alias || formatAddress(wallet.address)} ({getChainName(wallet.network)})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Total Portfolio Value */}
      {state.wallets.length > 0 && (
        <div className="mx-4 mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {selectedWallet === 'all' ? 'Total Portfolio Value' : 'Wallet Portfolio Value'}
          </h2>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(getSelectedPortfolioValue())}</p>
          {state.ui.loading && <p className="text-sm text-gray-600 mt-1">Updating...</p>}
        </div>
      )}

      {/* Charts Section */}
      {state.wallets.length > 0 && portfolioTokens.length > 0 && (
        <div className="mx-4 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Distribution Chart */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedWallet === 'all' ? 'Total Portfolio Distribution' : 'Wallet Portfolio Distribution'}
            </h3>
            <div className="h-64">
              <Doughnut data={tokenDistributionData} options={doughnutOptions} />
            </div>
          </div>

          {/* Portfolio History Chart */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Portfolio Value History</h3>
              <div className="flex gap-1">
                {[
                  { label: '1D', value: '1d' as const },
                  { label: '1W', value: '1w' as const },
                  { label: '1M', value: '1m' as const },
                  { label: '1Y', value: '1y' as const },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-3 py-1 text-sm rounded ${
                      selectedPeriod === period.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <Line data={portfolioHistoryData} options={lineChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* My Wallets Section */}
      <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">My Wallets</h3>
      {state.wallets.length === 0 ? (
        <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2">
          <p className="text-[#49739c] text-base">No wallets added yet. Go to Wallet Management to add your first wallet.</p>
        </div>
      ) : (
        state.wallets.map((wallet) => {
          const portfolio = state.portfolios[wallet.id];
          return (
            <div key={wallet.id} className="bg-white border rounded-lg p-4 mx-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M216,72H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,64V192a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm0,128H56a8,8,0,0,1-8-8V86.63A23.84,23.84,0,0,0,56,88H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,140Z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#0d141c] text-base font-medium">
                      {wallet.alias || formatAddress(wallet.address)}
                    </p>
                    <p className="text-[#49739c] text-sm">
                      {formatAddress(wallet.address)} • {getChainName(wallet.network)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {portfolio?.loading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : portfolio?.error ? (
                    <p className="text-sm text-red-500">Error loading</p>
                  ) : portfolio ? (
                    <div>
                      <p className="text-lg font-semibold">{formatCurrency(portfolio.totalValue)}</p>
                      <p className="text-sm text-gray-600">
                        {portfolio.tokens.length + 1} assets
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Token Holdings */}
              {portfolio && !portfolio.loading && !portfolio.error && (
                <div className="space-y-2">
                  {/* Native Token */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">{portfolio.nativeToken.symbol}</span>
                      </div>
                      <span className="font-medium">{portfolio.nativeToken.symbol}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(portfolio.nativeToken.value)}</p>
                      <p className="text-sm text-gray-600">
                        {portfolio.nativeToken.balance.toFixed(4)} {portfolio.nativeToken.symbol}
                      </p>
                    </div>
                  </div>

                  {/* Top 3 Tokens */}
                  {portfolio.tokens
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3)
                    .map((token, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          {token.logoUrl ? (
                            <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold">{token.symbol.slice(0, 2)}</span>
                            </div>
                          )}
                          <span className="font-medium">{token.symbol}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(token.value)}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-gray-600">{token.balance.toFixed(4)}</span>
                            {formatPercentage(token.change24h)}
                          </div>
                        </div>
                      </div>
                    ))}

                  {portfolio.tokens.length > 3 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      +{portfolio.tokens.length - 3} more tokens
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default Dashboard;
