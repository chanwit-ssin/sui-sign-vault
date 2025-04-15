import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';

export const ConnectButton = () => {
  const { isConnected, account, connectWallet, disconnectWallet } = useWallet();

  if (isConnected && account) {
    return (
      <Button variant="outline" onClick={disconnectWallet}>
        {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
      </Button>
    );
  }

  return (
    <Button onClick={() => connectWallet()}>
      Connect Wallet
    </Button>
  );
};