
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (transactionId: string) => void;
  documentTitle: string;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  documentTitle,
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const { signMessage, account } = useWallet();

  const handleSign = async () => {
    if (!account) return;
    
    setIsSigning(true);
    try {
      const message = `I hereby sign the document: ${documentTitle}`;
      const signature = await signMessage(message);
      
      if (signature) {
        onConfirm(signature);
      }
    } finally {
      setIsSigning(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign Document</DialogTitle>
          <DialogDescription>
            You are about to sign this document using your connected wallet. This action will be recorded on the Sui blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className="text-sm font-medium mb-2">Document</p>
            <p className="text-sm">{documentTitle}</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium mb-2">Signing as</p>
            <p className="text-sm font-mono">{account?.address}</p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSigning}>
            Cancel
          </Button>
          <Button 
            onClick={handleSign} 
            disabled={isSigning || !account}
            className="bg-sui-teal hover:bg-sui-teal/90"
          >
            {isSigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;
