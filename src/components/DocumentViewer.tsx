
import React, { useState } from 'react';
import { Document, SignatureField } from '@/types';
import { useWallet } from '@/context/WalletContext';
import { FileSignature, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignatureModal from './SignatureModal';
import { signDocument } from '@/services/documentService';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';

interface DocumentViewerProps {
  document: Document;
  onDocumentUpdate: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onDocumentUpdate }) => {
  const { isConnected, account } = useWallet();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleFieldClick = (fieldId: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet to sign');
      return;
    }
    
    // Find the field
    const field = document.signatureFields.find(field => field.id === fieldId);
    
    // Check if field is already signed
    if (field && field.signedBy) {
      toast.info(`Already signed by ${field.signedBy}`);
      return;
    }
    
    setActiveFieldId(fieldId);
    setIsSignModalOpen(true);
  };
  
  const handleSignConfirm = async (transactionId: string) => {
    if (!activeFieldId || !account) return;
    
    setIsProcessing(true);
    try {
      const success = await signDocument(
        document.id,
        activeFieldId,
        account.address,
        transactionId
      );
      
      if (success) {
        onDocumentUpdate();
      }
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="relative">
      <div className="doc-container">
        <h1 className="text-2xl font-bold text-center mb-6">{document.title}</h1>
        
        <p className="mb-4">This is a sample document content. In a real application, this would contain the actual document content or render a PDF.</p>
        
        {document.signatureFields.map((field) => (
          <div 
            key={field.id}
            className={`signature-field ${field.signedBy ? 'signed' : ''}`}
            style={{
              top: `${field.y}px`,
              left: `${field.x}px`,
              width: `${field.width}px`,
              height: `${field.height}px`,
            }}
            onClick={() => !field.signedBy && handleFieldClick(field.id)}
          >
            {field.signedBy ? (
              <div className="flex flex-col items-center justify-center w-full h-full p-2">
                <div className="flex items-center justify-center mb-1">
                  <Check className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">Signed</span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  <div className="font-mono truncate max-w-full">{field.signedBy}</div>
                  {field.signedAt && (
                    <div>{format(field.signedAt, 'MMM d, yyyy')}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-sui-teal mr-1" />
                <span className="text-sm text-sui-teal">Click to sign</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {isConnected && account && (
        <SignatureModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          onConfirm={handleSignConfirm}
          documentTitle={document.title}
        />
      )}
    </div>
  );
};

export default DocumentViewer;
