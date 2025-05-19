import React, { useState, useRef, useEffect } from "react";
import { Document, SignatureField } from "@/types";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { FileSignature, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignatureModal from "./SignatureModal";
import { signDocument } from "@/services/documentService";
import { toast } from "@/lib/toast";
import { format } from "date-fns";
import { nanoid } from "nanoid";

interface DocumentViewerProps {
  document: Document;
  onDocumentUpdate: () => void;
  editMode: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onDocumentUpdate,
  editMode,
}) => {
  const { account, connected } = useSuiWallet();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [pendingField, setPendingField] =
    useState<Partial<SignatureField> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFieldClick = (fieldId: string) => {
    if (!connected) {
      toast.error("Please connect your wallet to sign");
      return;
    }

    // Find the field
    const field = document.signatureFields.find(
      (field) => field.id === fieldId
    );

    // Check if field is already signed
    if (field && field.signedBy) {
      toast.info(`Already signed by ${field.signedBy}`);
      return;
    }

    setActiveFieldId(fieldId);
    setIsSignModalOpen(true);
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode || !isAddingSignature || !containerRef.current) return;

    // Get click coordinates relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a new signature field at this position
    const newField: Partial<SignatureField> = {
      id: nanoid(),
      x,
      y,
      width: 200,
      height: 60,
    };

    setPendingField(newField);
    setIsAddingSignature(false);
    setActiveFieldId(newField.id as string);
    setIsSignModalOpen(true);
  };

  const handleSignConfirm = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      if (pendingField && account) {
        // This is a new field
        const newField = {
          ...pendingField,
          signedBy: account.address,
          signedAt: new Date(),
          transactionId,
        } as SignatureField;

        // In a real app, we'd update the document on the backend
        // For now, we'll just simulate this
        document.signatureFields.push(newField as SignatureField);
        document.status =
          document.signatureFields.length >= 2 ? "completed" : "signed";

        toast.success("Document signed successfully");
        setPendingField(null);
        onDocumentUpdate();
      } else if (activeFieldId && account) {
        // This is an existing field
        const success = await signDocument(
          document.id,
          activeFieldId,
          account.address,
          transactionId
        );

        if (success) {
          onDocumentUpdate();
        }
      }
    } catch (error) {
      console.error("Error signing document:", error);
      toast.error("Failed to sign document");
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAddSignature = () => {
    setIsAddingSignature(false);
    setPendingField(null);
  };

  return (
    <div className="relative mb-8">
      {editMode && (
        <div className="flex items-center justify-between bg-gray-50 p-3 mb-4 rounded-md border border-gray-200">
          <div className="text-sm">
            {isAddingSignature ? (
              <span className="text-sui-teal font-medium flex items-center">
                <FileSignature className="w-4 h-4 mr-1" />
                Click anywhere on the document to add your signature
              </span>
            ) : (
              <span>Click "Add Signature" to sign the document</span>
            )}
          </div>
          <div className="flex space-x-2">
            {isAddingSignature ? (
              <Button variant="outline" size="sm" onClick={cancelAddSignature}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            ) : (
              <Button
                className="bg-sui-teal hover:bg-sui-teal/90"
                size="sm"
                onClick={() => setIsAddingSignature(true)}
              >
                <FileSignature className="w-4 h-4 mr-1" />
                Add Signature
              </Button>
            )}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`doc-container ${
          isAddingSignature ? "cursor-crosshair" : ""
        }`}
        onClick={handleContainerClick}
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          {document.title}
        </h1>

        <p className="mb-4">
          This is a sample document content. In a real application, this would
          contain the actual document content or render a PDF.
        </p>

        {document.signatureFields.map((field) => (
          <div
            key={field.id}
            className={`signature-field ${field.signedBy ? "signed" : ""}`}
            style={{
              top: `${field.y}px`,
              left: `${field.x}px`,
              width: `${field.width}px`,
              height: `${field.height}px`,
              pointerEvents: isAddingSignature ? "none" : "auto", // Disable pointer events when adding new signature
            }}
            onClick={(e) => {
              e.stopPropagation();
              !field.signedBy && handleFieldClick(field.id);
            }}
          >
            {field.signedBy ? (
              <div className="flex flex-col items-center justify-center w-full h-full p-2">
                <div className="flex items-center justify-center mb-1">
                  <Check className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    Signed
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  <div className="font-mono truncate max-w-full">
                    {field.signedBy}
                  </div>
                  {field.signedAt && (
                    <div>{format(field.signedAt, "MMM d, yyyy")}</div>
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

      {connected && account && (
        <SignatureModal
          isOpen={isSignModalOpen}
          onClose={() => {
            setIsSignModalOpen(false);
            setPendingField(null);
            setActiveFieldId(null);
          }}
          onConfirm={handleSignConfirm}
          documentTitle={document.title}
        />
      )}
    </div>
  );
};

export default DocumentViewer;
