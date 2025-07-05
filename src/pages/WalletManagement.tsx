import React, { useState } from 'react';
import Modal from '../components/common/Modal';
import AddWalletForm from '../components/wallet/AddWalletForm';
import WalletList from '../components/wallet/WalletList';

const WalletManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Wallets</p>
      </div>
      <WalletList />
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
