import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import AddWalletForm from '../components/wallet/AddWalletForm';

const WalletManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wallets = [
    { name: 'Wallet 1', address: '0x123...456' },
    { name: 'Wallet 2', address: '0x789...012' },
    { name: 'Wallet 3', address: '0x345...678' },
  ];

  return (
    <div className="flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Wallets</p>
      </div>
      <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">My Wallets</h3>
      {wallets.map((wallet, index) => (
        <div key={index} className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
          <div className="flex items-center gap-4">
            <div className="text-[#0d141c] flex items-center justify-center rounded-lg bg-[#e7edf4] shrink-0 size-12">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M216,72H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,64V192a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm0,128H56a8,8,0,0,1-8-8V86.63A23.84,23.84,0,0,0,56,88H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,140Z"></path>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-1">{wallet.name}</p>
              <p className="text-[#49739c] text-sm font-normal leading-normal line-clamp-2">{wallet.address}</p>
            </div>
          </div>
          <div className="shrink-0">
            <div className="text-[#0d141c] flex size-7 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
              </svg>
            </div>
          </div>
        </div>
      ))}
      <div className="flex px-4 py-3 justify-start">
        <button onClick={() => setIsModalOpen(true)} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0c7ff2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
          <span className="truncate">Add Wallet</span>
        </button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Wallet">
        <AddWalletForm onSuccess={() => setIsModalOpen(false)} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default WalletManagement;
