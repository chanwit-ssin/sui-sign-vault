
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WalletConnectDialog = ({
  open,
  onOpenChange
}: WalletConnectDialogProps) => {
  const { connectWallet } = useWallet();

  const handleConnectWallet = async (walletType: string) => {
    try {
      await connectWallet(walletType);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Function to detect available wallets
  const isSuiWalletInstalled = (): boolean => {
    return typeof window !== 'undefined' && 'suiWallet' in window;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader className="text-center pb-0">
          <div className="absolute right-4 top-4">
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mx-auto mb-5">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1v3c0 .55-.45 1-1 1s-1-.45-1-1V8h-5v3c0 .55-.45 1-1 1s-1-.45-1-1V8H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2z" fill="white" />
                <path d="M14 5c0 1.1-.9 2-2 2s-2-.9-2-2V4h4v1z" fill="white" />
                <path d="M10 3H7c-.55 0-1 .45-1 1s.45 1 1 1h3c0-1.1.9-2 2-2V2c-1.1 0-2 .9-2 1z" fill="white" />
                <path d="M17 3c0-1.1-.9-2-2-2v1c1.1 0 2 .9 2 2h-3c.55 0 1 .45 1 1s-.45 1-1 1h3c.55 0 1-.45 1-1s-.45-1-1-1h-1" fill="white" />
              </svg>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">Connect with SuiSign</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="space-y-2">
            <div 
              className={`flex items-center justify-between p-3 rounded-lg border ${isSuiWalletInstalled() ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60 cursor-not-allowed'}`}
              onClick={() => isSuiWalletInstalled() && handleConnectWallet('sui')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <p className="font-medium">Sui Wallet</p>
                  {!isSuiWalletInstalled() && (
                    <p className="text-xs text-gray-500">Not installed</p>
                  )}
                </div>
              </div>
              {isSuiWalletInstalled() && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Installed</span>
              )}
            </div>

            <div 
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
              onClick={() => handleConnectWallet('ethos')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <p className="font-medium">Ethos Wallet</p>
              </div>
            </div>
            
            <div 
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
              onClick={() => handleConnectWallet('mock')}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6h20v12H2z"></path>
                    <path d="M2 12h20"></path>
                    <path d="M6 12v6"></path>
                  </svg>
                </div>
                <p className="font-medium">Demo Wallet</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              By connecting your wallet to SuiSign, you agree to our
              <br />Terms of Service & Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;
