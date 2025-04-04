
import { Document, SignatureField } from '@/types';

// Mock documents for demonstration
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'Employment Contract',
    uploadedBy: '0xuser1',
    uploadedAt: new Date('2025-03-28'),
    status: 'pending',
    signatureFields: [
      {
        id: 'sig-1',
        x: 100,
        y: 400,
        width: 200,
        height: 60,
      }
    ],
    sharedWith: []
  },
  {
    id: 'doc-2',
    title: 'NDA Agreement',
    uploadedBy: '0xuser1',
    uploadedAt: new Date('2025-03-30'),
    status: 'draft',
    signatureFields: [],
    sharedWith: []
  }
];

export const getDocuments = async (): Promise<Document[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return [...mockDocuments];
};

export const getDocumentById = async (id: string): Promise<Document | undefined> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDocuments.find(doc => doc.id === id);
};

export const addSignatureField = async (
  documentId: string, 
  field: Omit<SignatureField, 'id'>
): Promise<SignatureField> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const newField: SignatureField = {
    ...field,
    id: `sig-${Date.now()}`
  };
  
  // In a real app, this would update the backend
  const docIndex = mockDocuments.findIndex(doc => doc.id === documentId);
  if (docIndex >= 0) {
    mockDocuments[docIndex].signatureFields.push(newField);
  }
  
  return newField;
};

export const signDocument = async (
  documentId: string,
  fieldId: string,
  signerAddress: string,
  transactionId: string
): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would update the backend
  const docIndex = mockDocuments.findIndex(doc => doc.id === documentId);
  if (docIndex >= 0) {
    const fieldIndex = mockDocuments[docIndex].signatureFields.findIndex(field => field.id === fieldId);
    if (fieldIndex >= 0) {
      mockDocuments[docIndex].signatureFields[fieldIndex].signedBy = signerAddress;
      mockDocuments[docIndex].signatureFields[fieldIndex].signedAt = new Date();
      mockDocuments[docIndex].signatureFields[fieldIndex].transactionId = transactionId;
      
      // Check if all fields are signed
      const allSigned = mockDocuments[docIndex].signatureFields.every(field => field.signedBy);
      if (allSigned) {
        mockDocuments[docIndex].status = 'completed';
      } else {
        mockDocuments[docIndex].status = 'signed';
      }
      
      return true;
    }
  }
  
  return false;
};

export const uploadDocument = async (title: string, uploadedBy: string): Promise<Document> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    title,
    uploadedBy,
    uploadedAt: new Date(),
    status: 'draft',
    signatureFields: [],
    sharedWith: []
  };
  
  // In a real app, this would save to the backend
  mockDocuments.push(newDoc);
  
  return newDoc;
};

export const shareDocument = async (documentId: string, addresses: string[]): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const docIndex = mockDocuments.findIndex(doc => doc.id === documentId);
  if (docIndex >= 0) {
    // Add unique addresses only
    const currentShared = mockDocuments[docIndex].sharedWith || [];
    const uniqueAddresses = [...new Set([...currentShared, ...addresses])];
    
    // Update the document
    mockDocuments[docIndex].sharedWith = uniqueAddresses;
    
    return true;
  }
  
  return false;
};
