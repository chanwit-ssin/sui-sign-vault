
import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Header = () => {
  const { isConnected, account, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-sui-navy rounded-md flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-sui-navy">SuiSign</span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex space-x-8">
              {isConnected && (
                <Link 
                  to="/dashboard" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'border-sui-teal text-gray-900' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/documents" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.includes('/documents') 
                    ? 'border-sui-teal text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center">
            {isConnected && account ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center text-sm text-gray-700">
                  <UserCircle className="w-5 h-5 text-sui-teal mr-1" />
                  <span>{truncateAddress(account.address)}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Disconnect</span>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={connectWallet}
                className="bg-sui-teal hover:bg-sui-teal/90"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
