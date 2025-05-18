import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useWallet as suiWallet, ConnectButton } from "@suiet/wallet-kit";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const WalletSelector = () => {
  const {
    select, // select
    configuredWallets, // default wallets
    detectedWallets, // Sui-standard wallets detected from browser env
    allAvailableWallets, // all the installed Sui-standard wallets
  } = suiWallet();

  console.log(select);
  console.log(configuredWallets);
  console.log(detectedWallets);
  console.log(allAvailableWallets);
  return [...configuredWallets, ...detectedWallets].map((wallet) => (
    <button
      key={wallet.name}
      onClick={() => {
        // check if user installed the wallet
        if (!wallet.installed) {
          // do something like guiding users to install
          return;
        }
        select(wallet.name);
      }}
    >
      Connect to {wallet.name}
    </button>
  ));
};
const WalletConnectDialog = ({
  open,
  onOpenChange,
}: WalletConnectDialogProps) => {
  const { connectWallet } = useWallet();
  const wallet = suiWallet();

  const handleConnectWallet = async (walletType: string) => {
    try {
      await connectWallet(walletType);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Function to detect available wallets
  const isSuiWalletInstalled = (): boolean => {
    return typeof window !== "undefined" && "suiWallet" in window;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader className="text-center pb-0">
          <div className="absolute right-4 top-4"></div>
          <div className="mx-auto mb-5">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 8h-1v3c0 .55-.45 1-1 1s-1-.45-1-1V8h-5v3c0 .55-.45 1-1 1s-1-.45-1-1V8H7c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2z"
                  fill="white"
                />
                <path d="M14 5c0 1.1-.9 2-2 2s-2-.9-2-2V4h4v1z" fill="white" />
                <path
                  d="M10 3H7c-.55 0-1 .45-1 1s.45 1 1 1h3c0-1.1.9-2 2-2V2c-1.1 0-2 .9-2 1z"
                  fill="white"
                />
                <path
                  d="M17 3c0-1.1-.9-2-2-2v1c1.1 0 2 .9 2 2h-3c.55 0 1 .45 1 1s-.45 1-1 1h3c.55 0 1-.45 1-1s-.45-1-1-1h-1"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Connect with SuiSign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="space-y-2">
            <div
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isSuiWalletInstalled()
                  ? "cursor-pointer hover:bg-gray-50"
                  : "opacity-60 cursor-not-allowed"
              }`}
              onClick={() =>
                isSuiWalletInstalled() && handleConnectWallet("sui")
              }
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <p className="font-medium">Sui Wallet</p>
                  <ConnectButton
                    onConnectSuccess={() => handleConnectWallet("mock")}
                    onConnectError={(error) => {
                      if (
                        error.code ===
                        ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED
                      ) {
                        console.warn(
                          "user rejected the connection to " +
                            error.details?.wallet
                        );
                      } else {
                        console.warn("unknown connect error: ", error);
                      }
                    }}
                  />
                </div>
              </div>
              {isSuiWalletInstalled() && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  Installed
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              By connecting your wallet to SuiSign, you agree to our
              <br />
              Terms of Service & Privacy Policy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectDialog;
