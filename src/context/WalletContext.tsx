
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { WalletAccount } from '@/types';
import { toast } from '@/lib/toast';

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
  const [walletType, setWalletType] = useState<string | null>(null);

  // Check if Sui wallet is available in window object
  const isSuiWalletAvailable = (): boolean => {
    return typeof window !== 'undefined' && 'suiWallet' in window;
  };

  // Connect to Sui wallet
  const connectToSuiWallet = async (): Promise<WalletAccount> => {
    try {
      if (!isSuiWalletAvailable()) {
        throw new Error('Sui wallet not found. Please install Sui wallet extension');
      }

      // @ts-ignore - Sui wallet types are not available
      const accounts = await window.suiWallet.getAccounts();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in Sui wallet');
      }
      
      // Use the first account
      const walletAddress = accounts[0];
      
      return {
        address: walletAddress,
        publicKey: walletAddress, // In a real implementation, you would get the actual public key
      };
    } catch (error) {
      console.error('Error connecting to Sui wallet:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    try {
      console.log('Connecting to wallet...');
      let connectedAccount: WalletAccount;
      
      if (isSuiWalletAvailable()) {
        connectedAccount = await connectToSuiWallet();
        setWalletType('sui');
      } else {
        // Fallback to mock wallet if Sui wallet is not available
        // This is helpful for development and testing
        console.log('Sui wallet not detected, using mock wallet');
        
        // Mock successful connection
        connectedAccount = {
          address: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          publicKey: 'sui_public_key_' + Math.random().toString(36).substring(2, 15),
        };
        
        setWalletType('mock');
      }
      
      setAccount(connectedAccount);
      setIsConnected(true);
      
      toast.success(`Wallet connected: ${walletType === 'sui' ? 'Sui Wallet' : 'Mock Wallet'}`);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount(null);
    setWalletType(null);
    toast.success('Wallet disconnected');
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!isConnected || !account) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      let signature;

      if (walletType === 'sui' && isSuiWalletAvailable()) {
        // @ts-ignore - Sui wallet types are not available
        signature = await window.suiWallet.signMessage({
          message: new TextEncoder().encode(message),
          account: account.address,
        });
        
        return signature.signature;
      } else {
        // Mock signing for development
        console.log(`Signing message: ${message}`);
        
        // Mock signing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock transaction ID
        const transactionId = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        return transactionId;
      }
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast.error('Failed to sign message: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
