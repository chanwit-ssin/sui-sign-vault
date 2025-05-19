import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";
// import { useWallet } from "@/context/WalletContext";
import { uploadDocument } from "@/services/documentService";
import { toast } from "@/lib/toast";
import { useWallet as useSuiWallet } from "@suiet/wallet-kit";
import { bcs } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import {
  createAllowlist,
  useSignAndExecuteService,
} from "@/services/signAndExecuteService";
import { PACKAGE_ID } from "@/config/constants";

// Constants

const MODULE = "document";
const rpcUrl = getFullnodeUrl("testnet");
const client = new SuiClient({ url: rpcUrl });

console.log("Sui Client initialized:", client);
interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // const { createAllowlist } = useSignAndExecuteService();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { account } = useSuiWallet();
  const wallet = useSuiWallet();

  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      // สร้าง URL สำหรับ preview
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl("");
    }
  };

  // ทำความสะอาด URL เมื่อ component ถูก unmount หรือ file เปลี่ยน
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const registerDocument = async (docHash: string, cid: string) => {
    if (!wallet.connected) throw new Error("Wallet not connected");

    const txb = new Transaction();
    const docHashBytes = bcs.string().serialize(docHash);
    const cidBytes = bcs.string().serialize(cid);

    txb.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::register_document`,
      arguments: [txb.pure(docHashBytes), txb.pure(cidBytes)],
    });

    txb.setGasBudget(50_000_000); // 0.05 SUI

    return wallet.signAndExecuteTransaction({
      transaction: txb,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Upload document to your service

      const capId = await createAllowlist("test", wallet);

      const uploadResponse = await uploadDocument(
        title,
        account.address,
        file,
        PACKAGE_ID,
        rpcUrl
        // capId
      );
      // Step 2: Register document on blockchain
      // In a real app, you'd generate these properly
      const docHash = "sample-hash-" + Math.random().toString(36).substring(2);
      const cid = "ipfs-cid-" + Math.random().toString(36).substring(2);

      const txResult = await registerDocument(docHash, cid);

      toast.success("Document uploaded and registered successfully");
      console.log("Transaction result:", txResult);

      onSuccess();
      onClose();
      setTitle("");
      setFile(null);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload new document</DialogTitle>
          <DialogDescription>
            Upload a document to sign with Sui blockchain signatures.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX (MAX. 10MB)
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {file && (
                <p className="text-sm text-gray-500 truncate">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              {/* กรณีเป็นรูปภาพ */}
              {file.type.startsWith("image/") && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain border"
                />
              )}
              {/* กรณีเป็น PDF */}
              {file.type === "application/pdf" && (
                <iframe
                  src={previewUrl}
                  title="PDF Preview"
                  className="w-full h-64 border"
                />
              )}
              {/* กรณีเป็น DOCX (แสดงลิงก์ดาวน์โหลดแทน) */}
              {file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                <a
                  href={previewUrl}
                  download={file.name}
                  className="text-blue-600 underline"
                >
                  ดาวน์โหลดไฟล์ {file.name}
                </a>
              )}
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-sui-teal hover:bg-sui-teal/90"
              disabled={isUploading || !title || !file || !account}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentModal;
