import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import DocumentCard from "@/components/DocumentCard";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { NETWORK } from "@/config/constants";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { getAllDocumentObjects } from "@/services/documentService";
import { RawDocument } from "@/types";

const Documents = () => {
  const [rawDocs, setRawDocs] = useState<RawDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { account } = useSuiWallet();
  const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

  const loadDocuments = async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      const docs = await getAllDocumentObjects(client, account.address);
      console.log("raw docs:", docs);
      setRawDocs(docs);
    } catch (error) {
      console.error("Error fetching Sui objects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!account}
          className="bg-sui-teal hover:bg-sui-teal/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* <div className="relative mb-6">
        <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <Input
          type="search"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div> */}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
        </div>
      ) : rawDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rawDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No documents found
          </h3>
          {/* <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search query."
              : "Get started by creating a new document."}
          </p> */}
          <div className="mt-6">
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={!account}
              className="bg-sui-teal hover:bg-sui-teal/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Document
            </Button>
          </div>
        </div>
      )}

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadDocuments}
      />
    </div>
  );
};

export default Documents;
