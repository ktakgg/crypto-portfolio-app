import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { detectNetwork, validateWalletAddress } from '../../utils/cookieManager';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';

const WalletList: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [editAlias, setEditAlias] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [deleteWallet, setDeleteWallet] = useState<string | null>(null);

  const handleEditStart = (walletId: string, currentAlias: string, currentAddress: string) => {
    setEditingWallet(walletId);
    setEditAlias(currentAlias);
    setEditAddress(currentAddress);
  };

  const handleEditSave = () => {
    if (editingWallet) {
      dispatch({
        type: 'UPDATE_WALLET',
        payload: {
          id: editingWallet,
          updates: { 
            alias: editAlias.trim() || '未設定',
            address: editAddress.trim()
          }
        }
      });
      setEditingWallet(null);
      setEditAlias('');
      setEditAddress('');
    }
  };

  const handleEditCancel = () => {
    setEditingWallet(null);
    setEditAlias('');
    setEditAddress('');
  };

  const handleDelete = (walletId: string) => {
    dispatch({ type: 'DELETE_WALLET', payload: walletId });
    setDeleteWallet(null);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (state.wallets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">ウォレットが登録されていません</h3>
        <p className="text-gray-600">上記のフォームからウォレットを追加してください。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">登録済みウォレット</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {state.wallets.map((wallet) => (
          <div key={wallet.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`h-3 w-3 rounded-full ${wallet.network === 'ethereum' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                  </div>
                  <div className="flex-1">
                    {editingWallet === wallet.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-16">エイリアス:</label>
                          <Input
                            value={editAlias}
                            onChange={(value: string) => setEditAlias(value)}
                            className="flex-1"
                            maxLength={50}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-16">アドレス:</label>
                          <Input
                            value={editAddress}
                            onChange={(value: string) => setEditAddress(value)}
                            className="flex-1"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleEditSave}>保存</Button>
                          <Button size="sm" variant="secondary" onClick={handleEditCancel}>キャンセル</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{wallet.alias}</h4>
                        <p className="text-sm text-gray-500">{formatAddress(wallet.address)}</p>
                        <p className="text-xs text-gray-400 capitalize">{wallet.network}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {editingWallet !== wallet.id && (
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleEditStart(wallet.id, wallet.alias, wallet.address)}
                  >
                    編集
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => setDeleteWallet(wallet.id)}
                  >
                    削除
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteWallet && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteWallet(null)}
          title="ウォレットの削除"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              このウォレットを削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex space-x-3">
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteWallet)}
                className="flex-1"
              >
                削除
              </Button>
              <Button
                variant="secondary"
                onClick={() => setDeleteWallet(null)}
                className="flex-1"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WalletList;