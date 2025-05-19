import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Document } from "@/types";
import { getDocuments } from "@/services/documentService";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Plus, Search, FileText, Loader2 } from "lucide-react";
import DocumentCard from "@/components/DocumentCard";
import { Input } from "@/components/ui/input";
import UploadDocumentModal from "@/components/UploadDocumentModal";

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { account } = useWallet();

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
      setFilteredDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDocuments(filtered);
    }
  }, [searchQuery, documents]);

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

      <div className="relative mb-6">
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
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No documents found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search query."
              : "Get started by creating a new document."}
          </p>
          {!searchQuery && (
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
          )}
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
