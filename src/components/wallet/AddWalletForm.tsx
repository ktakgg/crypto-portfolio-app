import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { detectNetwork, validateWalletAddress } from '../../utils/cookieManager';
import { v4 as uuidv4 } from 'uuid';
import Button from '../common/Button';
import Input from '../common/Input';

const AddWalletForm: React.FC = () => {
  const { dispatch } = useAppContext();
  const [address, setAddress] = useState('');
  const [alias, setAlias] = useState('');
  const [network, setNetwork] = useState<'ethereum' | 'solana' | ''>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setError('');

    // Auto-detect network
    const detectedNetwork = detectNetwork(value);
    if (detectedNetwork) {
      setNetwork(detectedNetwork === 'Ethereum' ? 'ethereum' : 'solana');
    } else {
      setNetwork('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate address
      if (!address.trim()) {
        setError('ウォレットアドレスを入力してください');
        return;
      }

      if (!network) {
        setError('有効なウォレットアドレスを入力してください');
        return;
      }

      const networkName = network === 'ethereum' ? 'Ethereum' : 'Solana';
      if (!validateWalletAddress(address, networkName)) {
        setError('無効なウォレットアドレスです');
        return;
      }

      // Create new wallet
      const newWallet = {
        id: uuidv4(),
        address: address.trim(),
        alias: alias.trim() || `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        network,
        createdAt: new Date(),
      };

      // Add wallet to state
      dispatch({ type: 'ADD_WALLET', payload: newWallet });

      // Reset form
      setAddress('');
      setAlias('');
      setNetwork('');

    } catch (err) {
      setError('ウォレットの追加に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいウォレットを追加</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ウォレットアドレス
          </label>
          <Input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="0x... または Solanaアドレスを入力"
            className="w-full"
          />
          {network && (
            <p className="text-sm text-gray-600 mt-1">
              検出されたネットワーク: {network === 'ethereum' ? 'Ethereum' : 'Solana'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            エイリアス（任意）
          </label>
          <Input
            type="text"
            value={alias}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlias(e.target.value)}
            placeholder="例: メインウォレット、DeFi用"
            maxLength={50}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            最大50文字まで設定できます
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !address.trim()}
          className="w-full"
        >
          {isSubmitting ? 'ウォレットを追加中...' : 'ウォレットを追加'}
        </Button>
      </form>
    </div>
  );
};

export default AddWalletForm;