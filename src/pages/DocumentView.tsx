
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Document } from '@/types';
import { getDocumentById } from '@/services/documentService';
import { ArrowLeft, Loader2, FileText, CheckCircle2, Pen } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import DocumentViewer from '@/components/DocumentViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  const loadDocument = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const doc = await getDocumentById(id);
      if (doc) {
        setDocument(doc);
      } else {
        navigate('/documents', { replace: true });
      }
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [id]);

  const getStatusIndicator = () => {
    if (!document) return null;
    
    const statusColors = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      signed: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
    };
    
    const statusClass = statusColors[document.status];
    
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
        {document.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
          </div>
        ) : document ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-sui-teal mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
              </div>
              <div className="flex items-center space-x-4">
                {getStatusIndicator()}
                
                {document.status !== 'completed' && isConnected && (
                  <Tabs value={mode} onValueChange={(value) => setMode(value as 'view' | 'edit')} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="view">View</TabsTrigger>
                      <TabsTrigger value="edit">
                        <Pen className="w-3 h-3 mr-1" />
                        Sign
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </div>
            </div>
            
            {!isConnected && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
                <p className="text-blue-700">
                  Connect your wallet to sign this document
                </p>
              </div>
            )}
            
            <DocumentViewer 
              document={document} 
              onDocumentUpdate={loadDocument}
              editMode={mode === 'edit' && isConnected}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p>Document not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentView;
