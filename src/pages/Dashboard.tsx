import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const Dashboard: React.FC = () => {
  const { state } = useAppContext();
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getChainName = (network: string) => {
    return network === 'ethereum' ? 'Ethereum' : 'Solana';
  };

  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4"><p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Dashboard</p></div>
            <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Wallets</h3>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-[#cedbe8] bg-white">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">Name</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">Address</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">Chain</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">Balance</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] text-sm font-medium leading-normal">Change (24h)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7edf4]">
                    {state.wallets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="h-[72px] px-4 py-2 text-center text-[#49739c] text-sm font-normal leading-normal">
                          ウォレットが登録されていません。ウォレット管理画面から追加してください。
                        </td>
                      </tr>
                    ) : (
                      state.wallets.map((wallet) => (
                        <tr key={wallet.id}>
                          <td className="h-[72px] px-4 py-2 text-[#0d141c] text-sm font-normal leading-normal">{wallet.alias}</td>
                          <td className="h-[72px] px-4 py-2 text-[#49739c] text-sm font-normal leading-normal">{formatAddress(wallet.address)}</td>
                          <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal">
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-full">
                              <span className="truncate">{getChainName(wallet.network)}</span>
                            </button>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#49739c] text-sm font-normal leading-normal">読み込み中...</td>
                          <td className="h-[72px] px-4 py-2 text-sm font-normal leading-normal text-gray-500">-</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Asset Allocation</h3>
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#cedbe8] bg-white p-6">
                <p className="text-[#0d141c] text-base font-medium leading-normal">Asset Allocation</p>
                <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight truncate">$5,480.35</p>
                <p className="text-[#49739c] text-base font-normal leading-normal">Total</p>
                <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
                  <div className="border-[#49739c] bg-[#e7edf4] border-t-2 w-full" style={{ height: '70%' }}></div>
                  <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">ETH</p>
                  <div className="border-[#49739c] bg-[#e7edf4] border-t-2 w-full" style={{ height: '80%' }}></div>
                  <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">SOL</p>
                  <div className="border-[#49739c] bg-[#e7edf4] border-t-2 w-full" style={{ height: '60%' }}></div>
                  <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">USDC</p>
                </div>
              </div>
            </div>
            <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Performance</h3>
            <div className="flex flex-wrap gap-4 px-4 py-6">
              <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-[#cedbe8] bg-white p-6">
                <p className="text-[#0d141c] text-base font-medium leading-normal">Portfolio Value</p>
                <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight truncate">$5,480.35</p>
                <p className="text-[#49739c] text-base font-normal leading-normal">Last 30 Days</p>
                <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
                  <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_1131_5935)"></path>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#49739c" strokeWidth="3" strokeLinecap="round"></path>
                    <defs>
                      <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#e7edf4"></stop>
                        <stop offset="1" stopColor="#e7edf4" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex justify-around">
                    <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">1D</p>
                    <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">7D</p>
                    <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">14D</p>
                    <p className="text-[#49739c] text-[13px] font-bold leading-normal tracking-[0.015em]">30D</p>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
};

export default Dashboard;
