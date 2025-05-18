import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Document } from "@/types";
import { getDocuments } from "@/services/documentService";
import { useWallet } from "@/context/WalletContext";
import {
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import DocumentCard from "@/components/DocumentCard";
import { useNavigate } from "react-router-dom";
import UploadDocumentModal from "@/components/UploadDocumentModal";

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { isConnected, account } = useWallet();
  const navigate = useNavigate();

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const getStatusCounts = () => {
    return {
      pending: documents.filter((doc) => doc.status === "pending").length,
      completed: documents.filter((doc) => doc.status === "completed").length,
      draft: documents.filter((doc) => doc.status === "draft").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!isConnected}
          className="bg-sui-teal hover:bg-sui-teal/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Document
        </Button>
      </div>

      {!isConnected ? (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
          <p className="text-blue-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Connect your wallet to access all features
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-2xl font-bold">
                  {statusCounts.pending}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Completed Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">
                  {statusCounts.completed}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Draft Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-2xl font-bold">{statusCounts.draft}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Recent Documents</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-sui-teal" />
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.slice(0, 6).map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No documents
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new document.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                disabled={!isConnected}
                className="bg-sui-teal hover:bg-sui-teal/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate("/documents")}>
            View All Documents
          </Button>
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

export default Dashboard;
