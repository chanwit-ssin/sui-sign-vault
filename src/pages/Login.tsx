
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const Login = () => {
  const { connectWallet } = useWallet();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connectWallet();
      navigate('/');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="w-12 h-12 bg-sui-navy rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">SuiSign Vault</h2>
          <p className="text-center text-gray-600 mb-8">
            Sign documents securely on the Sui blockchain
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Secure Document Signing</h3>
              <p className="text-sm text-gray-600">
                Use your Sui wallet to sign documents with cryptographic proof on the blockchain.
              </p>
            </div>
            
            <Button 
              onClick={handleConnect}
              className="w-full bg-sui-teal hover:bg-sui-teal/90 transition-colors"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Need help? Contact support@suisignvault.com</p>
      </div>
    </div>
  );
};

export default Login;
