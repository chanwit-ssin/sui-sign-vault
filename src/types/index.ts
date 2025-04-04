
export interface WalletAccount {
  address: string;
  publicKey: string;
}

export interface Document {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'draft' | 'pending' | 'signed' | 'completed';
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
}
