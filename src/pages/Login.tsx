
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, FileText, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
            <Alert className="bg-blue-50 border-blue-100">
              <AlertDescription className="text-sm text-blue-800">
                Connect your Sui wallet to access secure document signing
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <FileText className="h-6 w-6 text-sui-teal mx-auto mb-2" />
                <p className="text-xs text-gray-600">Upload Documents</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <ShieldCheck className="h-6 w-6 text-sui-teal mx-auto mb-2" />
                <p className="text-xs text-gray-600">Secure Signing</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <Zap className="h-6 w-6 text-sui-teal mx-auto mb-2" />
                <p className="text-xs text-gray-600">Blockchain Verified</p>
              </div>
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
