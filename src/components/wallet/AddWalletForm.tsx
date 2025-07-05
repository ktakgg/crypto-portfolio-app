import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import { validateWalletAddress, detectNetwork, addWallet } from '../../utils/cookieManager';
import { useApp } from '../../contexts/AppContext';

interface AddWalletFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AddWalletForm: React.FC<AddWalletFormProps> = ({ onSuccess, onCancel }) => {
  const { refreshWallets } = useApp();
  const [address, setAddress] = useState('');
  const [alias, setAlias] = useState('');
  const [network, setNetwork] = useState<'ethereum' | 'solana' | ''>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value.trim();
    setAddress(newAddress);
    
    // アドレスが入力されたらネットワークを自動判定
    if (newAddress) {
      const detectedNetwork = detectNetwork(newAddress);
      if (detectedNetwork) {
        setNetwork(detectedNetwork.toLowerCase() as 'ethereum' | 'solana');
        setErrors(prev => ({ ...prev, address: '' }));
      }
    } else {
      setNetwork('');
    }
    if (!detectNetwork(newAddress)) {
      setNetwork('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!address) {
      newErrors.address = 'ウォレットアドレスを入力してください';
    } else if (!network) {
      newErrors.address = '有効なウォレットアドレスを入力してください';
    } else if (!validateWalletAddress(address, network)) {
      newErrors.address = `${network}ネットワークに対して無効なアドレス形式です`;
    }

    if (!alias.trim()) {
      newErrors.alias = 'ウォレット名を入力してください';
    } else if (alias.trim().length > 50) {
      newErrors.alias = 'ウォレット名は50文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      addWallet({
        address,
        alias: alias.trim(),
        network: network as 'ethereum' | 'solana',
      });

      refreshWallets();
      setAddress('');
      setAlias('');
      setNetwork('');
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding wallet:', error);
      setErrors({ submit: 'ウォレットの追加に失敗しました。もう一度お試しください。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ネットワーク選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          ネットワーク
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setNetwork('ethereum')}
            className={`relative p-4 border-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              network === 'ethereum'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                network === 'ethereum' ? 'bg-blue-500' : 'bg-gray-100'
              }`}>
                <svg className={`h-4 w-4 ${network === 'ethereum' ? 'text-white' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                </svg>
              </div>
              <span>Ethereum</span>
            </div>
            {network === 'ethereum' && (
              <div className="absolute top-2 right-2">
                <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setNetwork('solana')}
            className={`relative p-4 border-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              network === 'solana'
                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                network === 'solana' ? 'bg-purple-500' : 'bg-gray-100'
              }`}>
                <svg className={`h-4 w-4 ${network === 'solana' ? 'text-white' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.4 5.6c.3.3.3.8 0 1.1L18.1 9c-.1.1-.3.2-.5.2H3.2c-.6 0-.9-.7-.5-1.1L5 5.8c.1-.1.3-.2.5-.2h12.4c.6 0 .9.7.5 1zm0 6.8c.3.3.3.8 0 1.1L18.1 16c-.1.1-.3.2-.5.2H3.2c-.6 0-.9-.7-.5-1.1L5 12.8c.1-.1.3-.2.5-.2h12.4c.6 0 .9.7.5 1zm-17.2 6.8c-.3-.3-.3-.8 0-1.1L5.5 15c.1-.1.3-.2.5-.2h12.4c.6 0 .9.7.5 1.1L16.6 18c-.1.1-.3.2-.5.2H3.7c-.6 0-.9-.7-.5-1z"/>
                </svg>
              </div>
              <span>Solana</span>
            </div>
            {network === 'solana' && (
              <div className="absolute top-2 right-2">
                <svg className="h-4 w-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* ウォレットアドレス */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
          ウォレットアドレス
        </label>
        <div className="relative">
          <input
            id="address"
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder={network === 'ethereum' ? '0x...' : network === 'solana' ? 'Base58アドレス' : 'ウォレットアドレスを入力'}
            className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-0 transition-colors ${
              errors.address 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
            }`}
          />
          {network && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                network === 'ethereum' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {network === 'ethereum' ? 'ETH' : 'SOL'}
              </div>
            </div>
          )}
        </div>
        {errors.address && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.address}
          </p>
        )}
      </div>

      {/* ウォレット名 */}
      <div>
        <label htmlFor="alias" className="block text-sm font-medium text-gray-900 mb-2">
          ウォレット名
        </label>
        <input
          id="alias"
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="例: メインウォレット"
          maxLength={50}
          className={`block w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none focus:ring-0 transition-colors ${
            errors.alias 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-blue-500'
          }`}
        />
        <div className="flex justify-between items-center mt-2">
          {errors.alias ? (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.alias}
            </p>
          ) : (
            <div></div>
          )}
          <p className="text-sm text-gray-500">
            {alias.length}/50
          </p>
        </div>
      </div>

      {/* エラーメッセージ */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="flex space-x-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-3"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              追加中...
            </div>
          ) : (
            'ウォレットを追加'
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="py-3"
          >
            キャンセル
          </Button>
        )}
      </div>
    </form>
  );
};

export default AddWalletForm;
