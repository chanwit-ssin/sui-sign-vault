
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { WalletAccount } from '@/types';
import { toast } from '@/components/ui/sonner';

interface WalletContextType {
  isConnected: boolean;
  account: WalletAccount | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);

  const connectWallet = async () => {
    try {
      // In a real app, this would interact with Sui wallet
      console.log('Connecting to wallet...');
      
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful connection
      const mockAccount: WalletAccount = {
        address: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        publicKey: 'sui_public_key_' + Math.random().toString(36).substring(2, 15),
      };
      
      setAccount(mockAccount);
      setIsConnected(true);
      
      toast.success('Wallet connected!');
      return mockAccount;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
      throw error;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    toast.success('Wallet disconnected');
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!isConnected) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      // In a real app, this would request the wallet to sign
      console.log(`Signing message: ${message}`);
      
      // Mock signing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock transaction ID
      const transactionId = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      toast.success('Document signed successfully!');
      return transactionId;
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast.error('Failed to sign message');
      return null;
    }
  };

  const value = {
    isConnected,
    account,
    connectWallet,
    disconnectWallet,
    signMessage,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
