import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const { state, fetchAllPortfolios } = useAppContext();

  useEffect(() => {
    if (state.wallets.length > 0) {
      fetchAllPortfolios();
    }
  }, [state.wallets.length]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getChainName = (network: string) => {
    return network === 'ethereum' ? 'Ethereum' : 'Solana';
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

  const totalPortfolioValue = Object.values(state.portfolios).reduce((sum, portfolio) => {
    return sum + (portfolio ? portfolio.totalValue : 0);
  }, 0);

  return (
    <div className="flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p>
      </div>

      {/* Total Portfolio Value */}
      {state.wallets.length > 0 && (
        <div className="mx-4 mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Total Portfolio Value</h2>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPortfolioValue)}</p>
          {state.ui.loading && <p className="text-sm text-gray-600 mt-1">Updating...</p>}
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