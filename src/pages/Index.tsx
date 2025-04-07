
import React, { useState, useEffect } from 'react';
import Features from '@/components/Features';
import { fetchBlobMetadata } from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  const handleFetchMetadata = async () => {
    setIsLoading(true);
    try {
      const blobId = 'dwwl-89ZnG9rbghu6k6ytoHNV-fAJ3YeFQizeDIvt0c';
      const data = await fetchBlobMetadata(blobId);
      setMetadata(data);
      toast.success('Metadata fetched successfully!');
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      toast.error('Failed to fetch metadata. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8">
      <Features />
      
      <div className="mt-12 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">API Testing</h2>
        <p className="mb-4 text-gray-600">
          Test the CORS-bypassed API connection to Sui network.
        </p>
        
        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleFetchMetadata} 
            disabled={isLoading}
            className="w-fit"
          >
            {isLoading ? 'Loading...' : 'Fetch Blob Metadata'}
          </Button>
          
          {metadata && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Metadata Result:</h3>
              <pre className="whitespace-pre-wrap overflow-x-auto bg-gray-100 p-4 rounded text-sm">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
