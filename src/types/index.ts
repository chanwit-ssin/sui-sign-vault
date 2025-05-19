export interface WalletAccount {
  address: string;
  publicKey: string;
}

export interface Document {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: "draft" | "pending" | "signed" | "completed";
  content?: string;
  fileUrl?: string;
  signatureFields: SignatureField[];
  sharedWith?: string[]; // Array of wallet addresses the document is shared with
}

export interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signedBy?: string;
  signedAt?: Date;
  transactionId?: string;
  blobId?: string; // ID of the blob in Walrus
}

export interface UploadedDoc {
  title: string;
  blobId: string;
  uploadedAt: Date;
}

export interface SignatureRecord {
  signerAddress: string;
  signature: string;
  timestamp: number;
  transactionId: string;
}

// Update your Document interface if needed
export interface Document {
  id: string;
  title: string;
  status: "draft" | "pending" | "signed" | "completed";
  uploadedBy: string;
  sharedWith?: string[];
  // Add other document properties
}