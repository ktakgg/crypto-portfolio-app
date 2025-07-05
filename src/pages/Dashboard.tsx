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
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '7d' | '14d' | '30d'>('30d');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');

  useEffect(() => {
    if (state.wallets.length > 0) {
      fetchAllPortfolios();
    }
  }, [state.wallets.length, fetchAllPortfolios]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 3)}`;
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
    const sign = value > 0 ? '+' : '';
    const color = value >= 0 ? 'text-green-500' : 'text-red-500';
    return <span className={color}>{sign}{value.toFixed(1)}%</span>;
  };

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

    // Get portfolio distribution data
    const getAssetDistribution = () => {
      const assets: { [key: string]: number } = {};
  
      Object.values(state.portfolios).forEach(portfolio => {
        if (portfolio && !portfolio.loading && !portfolio.error) {
          // Add native token
          const nativeSymbol = portfolio.nativeToken.symbol;
          assets[nativeSymbol] = (assets[nativeSymbol] || 0) + portfolio.nativeToken.value;
  
          // Add other tokens
          portfolio.tokens.forEach(token => {
            assets[token.symbol] = (assets[token.symbol] || 0) + token.value;
          });
        }
      });
  
      return Object.entries(assets)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    };
  
    const assetDistribution = getAssetDistribution();
  
    // Asset distribution chart data
    const distributionData = {
      labels: assetDistribution.map(([symbol]) => symbol),
      datasets: [
        {
          data: assetDistribution.map(([, value]) => value),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
          borderWidth: 0,
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
      case '7d':
        dataPoints = 7; // 7 days
        dateIncrement = 24 * 60 * 60 * 1000; // 1 day
        labelFormat = { weekday: 'short' };
        break;
      case '14d':
        dataPoints = 14;
        dateIncrement = 24 * 60 * 60 * 1000; // 1 day
        labelFormat = { month: 'short', day: 'numeric' };
        break;
      case '30d':
      default:
        dataPoints = 30; // 30 days
        dateIncrement = 24 * 60 * 60 * 1000; // 1 day
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

    // Mock performance data
    const generatePerformanceData = () => {
      const data = [];
      const labels = [];
      let dataPoints: number;
  
      switch (selectedPeriod) {
        case '1d':
          dataPoints = 24;
          break;
        case '7d':
          dataPoints = 7;
          break;
        case '14d':
          dataPoints = 14;
          break;
        case '30d':
        default:
          dataPoints = 30;
          break;
      }
  
      for (let i = dataPoints - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  
        // Generate mock data with some variation
        const variation = (Math.random() - 0.5) * 0.2;
        const value = totalPortfolioValue * (1 + variation);
        data.push(Math.max(0, value));
      }
  
      return { labels, data };
    };

  const historicalData = generateHistoricalData();
  const performanceData = generatePerformanceData();

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

  const performanceChartData = {
    labels: performanceData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceData.data,
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
        display: false,
      },
    },
    cutout: '70%',
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  return (
    <div className="flex flex-col max-w-[1200px] flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-6">
        <h1 className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">Dashboard</h1>
      </div>

      {state.wallets.length === 0 ? (
        <div className="flex items-center gap-4 bg-white mx-6 rounded-lg p-8 text-center">
          <p className="text-[#49739c] text-base">No wallets added yet. Go to Wallet Management to add your first wallet.</p>
        </div>
      ) : (
        <div className="px-6 space-y-6">
          {/* Wallets Table */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Wallets</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change (24h)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.wallets.map((wallet, index) => {
                    const portfolio = state.portfolios[wallet.id];
                    const mockChange = Math.random() * 6 - 3; // Mock change between -3% and +3%

                    return (
                      <tr key={wallet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {wallet.alias || `Wallet ${index + 1}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-600">{formatAddress(wallet.address)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getChainName(wallet.network)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {portfolio?.loading ? (
                            <div className="text-sm text-gray-500">Loading...</div>
                          ) : portfolio?.error ? (
                            <div className="text-sm text-red-500">Error</div>
                          ) : portfolio ? (
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(portfolio.totalValue)}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">-</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatPercentage(mockChange)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asset Allocation and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalPortfolioValue)}</div>
              <div className="text-sm text-blue-600 mb-6">Total</div>

              <div className="flex items-center justify-center mb-6">
                <div className="w-32 h-32">
                  <Doughnut data={distributionData} options={doughnutOptions} />
                </div>
              </div>

              <div className="space-y-2">
                {assetDistribution.map(([symbol, value], index) => (
                  <div key={symbol} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">{symbol}</span>
                    </div>
                    <span className="text-sm text-gray-600">{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <div className="flex space-x-2">
                  {['1d', '7d', '14d', '30d'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period as any)}
                      className={`px-3 py-1 text-xs rounded ${
                        selectedPeriod === period
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {period.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalPortfolioValue)}</div>
              <div className="text-sm text-blue-600 mb-6">Last {selectedPeriod === '1d' ? 'Day' : selectedPeriod.replace('d', ' Days')}</div>

              <div className="h-32">
                <Line data={performanceChartData} options={lineChartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;