
import React, { useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import Login from './Login';
import Dashboard from './Dashboard';
import Features from '@/components/Features';

const Index = () => {
  const { isConnected } = useWallet();
  
  useEffect(() => {
    // You could add any initial loading here
  }, []);

  if (!isConnected) {
    return <Features />;
  }

  return <Dashboard />;
};

export default Index;
