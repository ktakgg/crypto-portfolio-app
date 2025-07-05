import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Wallet } from '../../types';
import { useWallets } from '../../contexts/AppContext';
import { deleteWallet, updateWallet } from '../../utils/cookieManager';
import { useApp } from '../../contexts/AppContext';

interface WalletListProps {
  onAddWallet?: () => void;
}

const WalletList: React.FC<WalletListProps> = ({ onAddWallet }) => {
  const wallets = useWallets();
  const { refreshWallets } = useApp();
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const [editAlias, setEditAlias] = useState('');

  const formatAddress = (address: string): string => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkDisplayName = (network: string): string => {
    switch (network) {
      case 'ethereum':
        return 'Ethereum';
      case 'solana':
        return 'Solana';
      default:
        return network;
    }
  };

  const getNetworkColor = (network: string): string => {
    switch (network) {
      case 'ethereum':
        return 'bg-blue-100 text-blue-800';
      case 'solana':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setEditAlias(wallet.alias);
  };

  const handleSaveEdit = () => {
    if (!editingWallet || !editAlias.trim()) return;

    const updatedWallet = {
      ...editingWallet,
      alias: editAlias.trim(),
    };

    try {
      updateWallet(updatedWallet);
      refreshWallets();
      setEditingWallet(null);
      setEditAlias('');
    } catch (error) {
      console.error("Failed to save wallet", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingWallet(null);
    setEditAlias('');
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    setDeletingWallet(wallet);
  };

  const confirmDelete = () => {
    if (!deletingWallet) return;

    try {
      deleteWallet(deletingWallet.address);
      refreshWallets();
      setDeletingWallet(null);
    } catch (error) {
      console.error("Failed to delete wallet", error);
    }
  };

  const cancelDelete = () => {
    setDeletingWallet(null);
  };

  if (wallets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          ウォレットを追加
        </h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
          最初のウォレットを追加して、ポートフォリオの管理を始めましょう
        </p>
        <Button onClick={onAddWallet} className="px-6 py-3">
          ウォレットを追加
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          登録済みウォレット ({wallets.length})
        </h2>
        <Button onClick={onAddWallet} size="sm">
          ウォレットを追加
        </Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence>
          {wallets.map((wallet) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {wallet.alias}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getNetworkColor(wallet.network)}`}>
                        {getNetworkDisplayName(wallet.network)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg">
                      {formatAddress(wallet.address)}
                    </p>
                    <p className="text-xs text-gray-400">
                      追加日: {wallet.createdAt.toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                  <button
                    onClick={() => handleEditWallet(wallet)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="編集"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteWallet(wallet)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 編集モーダル */}
      <Modal
        isOpen={!!editingWallet}
        onClose={handleCancelEdit}
        title="ウォレット名を編集"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ウォレット名
            </label>
            <input
              type="text"
              value={editAlias}
              onChange={(e) => setEditAlias(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="ウォレット名を入力"
              maxLength={50}
            />
            <p className="mt-1 text-sm text-gray-500">
              {editAlias.length}/50文字
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveEdit}
              disabled={!editAlias.trim()}
              className="flex-1"
            >
              保存
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={!!deletingWallet}
        onClose={cancelDelete}
        title="ウォレットを削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            「{deletingWallet?.alias}」を削除してもよろしいですか？
          </p>
          <p className="text-sm text-gray-500">
            この操作は取り消すことができません。
          </p>
          <div className="flex space-x-3">
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1"
            >
              削除
            </Button>
            <Button
              variant="outline"
              onClick={cancelDelete}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WalletList;
