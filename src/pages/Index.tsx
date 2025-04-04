
import React, { useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import Login from './Login';
import Dashboard from './Dashboard';

const Index = () => {
  const { isConnected } = useWallet();
  
  useEffect(() => {
    // You could add any initial loading here
  }, []);

  if (!isConnected) {
    return <Login />;
  }

  return <Dashboard />;
};

export default Index;
