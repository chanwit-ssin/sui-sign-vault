import { Document, SignatureField, UploadedDoc } from "@/types";
import { fromHex, toHex } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { SealClient, getAllowlistedKeyServers } from "@mysten/seal";
import { PACKAGE_ID, WALRUS_SERVICES, SUIDOC_PACKAGE_ID, SUIDOC_MODULE, NETWORK } from "@/config/constants";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/config/networkConfig";
import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";

import { SignatureRecord } from "@/types/index";
// Mock documents for demonstration
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

const mockDocuments: Document[] = [
  {
    id: "doc-1",
    title: "Employment Contract",
    uploadedBy: "0xuser1",
    uploadedAt: new Date("2025-03-28"),
    status: "pending",
    signatureFields: [
      {
        id: "sig-1",
        x: 100,
        y: 400,
        width: 200,
        height: 60,
      },
    ],
    sharedWith: [],
  },
  {
    id: "doc-2",
    title: "NDA Agreement",
    uploadedBy: "0xuser1",
    uploadedAt: new Date("2025-03-30"),
    status: "draft",
    signatureFields: [],
    sharedWith: [],
  },
];

/**
 * Fetches the signature history for a document
 * 
 * @param documentId The ID of the document
 * @returns Promise resolving to an array of signature records
 */
export const getDocumentSignatureHistory = async (documentId: string): Promise<SignatureRecord[]> => {
  try {
    // In a real implementation, you would fetch this data from your backend or blockchain
    // For now, return mock data for demonstration
    // Example:
    // return [
    //   {
    //     signerAddress: "0x4543...4be8",
    //     signature: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    //     timestamp: Date.now() - 86400000, // 1 day ago
    //     transactionId: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234"
    //   },
    //   {
    //     signerAddress: "0x9876...5432",
    //     signature: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    //     timestamp: Date.now() - 172800000, // 2 days ago
    //     transactionId: "0xabcdef123456789abcdef123456789abcdef123456789abcdef123456789abcde"
    //   }
    // ];

    const eventFilter = {
      MoveModule: {
        package: SUIDOC_PACKAGE_ID,
        module: SUIDOC_MODULE,
      },
    };
    try {
      const events = await client.queryEvents({
        query: eventFilter,
        limit: 100,
        order: 'descending',
      });
  
      return events.data
      .filter(event => {
        const eventData = event.parsedJson as any;
        return (
          JSON.stringify(eventData.doc_id) === JSON.stringify(documentId) &&
          event.type.endsWith("DocumentSignedEvent")
        );
      })
      .map(event => {
        const eventData = event.parsedJson as any;
        
        // Convert the signature array to a hex string (if needed)
        const signatureBytes = new Uint8Array(eventData.signature);
        const signatureHex = Array.from(signatureBytes)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');
        
        return {
          signerAddress: eventData.signer,
          signature: `0x${signatureHex}`, // or use eventData.signature directly if it's already formatted
          timestamp: Number(event.timestampMs), // Convert string timestamp to number
          transactionId: event.id.txDigest
        };
      });
  
    } catch (error) {
      console.error("Error fetching signature history:", error);
      throw error;
    }

  } catch (error) {
    console.error("Error fetching signature history:", error);
    throw error;
  }
};

export const getDocuments = async (): Promise<Document[]> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [...mockDocuments];
};

export const getDocumentById = async (
  id: string
): Promise<Document | undefined> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockDocuments.find((doc) => doc.id === id);
};

export const addSignatureField = async (
  documentId: string,
  field: Omit<SignatureField, "id">
): Promise<SignatureField> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newField: SignatureField = {
    ...field,
    id: `sig-${Date.now()}`,
  };

  // In a real app, this would update the backend
  const docIndex = mockDocuments.findIndex((doc) => doc.id === documentId);
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
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real app, this would update the backend
  const docIndex = mockDocuments.findIndex((doc) => doc.id === documentId);
  if (docIndex >= 0) {
    const fieldIndex = mockDocuments[docIndex].signatureFields.findIndex(
      (field) => field.id === fieldId
    );
    if (fieldIndex >= 0) {
      mockDocuments[docIndex].signatureFields[fieldIndex].signedBy =
        signerAddress;
      mockDocuments[docIndex].signatureFields[fieldIndex].signedAt = new Date();
      mockDocuments[docIndex].signatureFields[fieldIndex].transactionId =
        transactionId;

      // Check if all fields are signed
      const allSigned = mockDocuments[docIndex].signatureFields.every(
        (field) => field.signedBy
      );
      if (allSigned) {
        mockDocuments[docIndex].status = "completed";
      } else {
        mockDocuments[docIndex].status = "signed";
      }

      return true;
    }
  }

  return false;
};

export type UploadResult = {
  document: Document;
  previewDataUrl: string; // <— คืน Data URL สำหรับพรีวิว
};

export type Data = {
  status: string;
  blobId: string;
  endEpoch: string;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
  isImage: string;
};

export const uploadDocument = async (
  title: string,
  uploadedBy: string,
  file: File,
  rpcUrl: string,
  cap_id: string,
  walrusServiceId: string = WALRUS_SERVICES[0].id
): Promise<Document> => {
  // const [info, setInfo] = useState<Data | null>(null);

  const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
  const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;
  let info: Data | null = null;

  const NUM_EPOCH = 1;
  // const packageId = useNetworkVariable("packageId");
  const suiClient = new SuiClient({ url: rpcUrl });
  const sealClient = new SealClient({
    suiClient,
    serverObjectIds: getAllowlistedKeyServers("testnet"),
    verifyKeyServers: false,
  });

  // 1) อ่านไฟล์เป็น Uint8Array
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  const previewDataUrl = await new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = () => rej(reader.error);
    reader.readAsDataURL(file);
  });

  if (file.type === "application/pdf") {
    // PDF มักจะเริ่มด้วย "%PDF-"
    const header = new TextDecoder().decode(data.slice(0, 5));
    console.log("PDF header:", header);
  }

  if (file.name.endsWith(".docx")) {
    const magic = Array.from(data.slice(0, 4))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ");
    console.log("DOCX magic bytes:", magic);
  }

  if (file.type.startsWith("image/")) {
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = () => rej(reader.error);
      reader.readAsDataURL(file);
    });
    console.log("Image preview Data URL:", dataUrl.slice(0, 100)); // แค่ส่วนต้นๆ
  }

  // 2) สร้าง blob ID (policyId + nonce)
  const policyBytes = fromHex(PACKAGE_ID);
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const idHex = toHex(new Uint8Array([...policyBytes, ...nonce]));

  // 4) อัปโหลด ciphertext ไปยัง Walrus
  function getAggregatorUrl(path: string): string {
    const service = WALRUS_SERVICES.find((s) => s.id === walrusServiceId);
    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    return `${service?.aggregatorUrl}/v1/${cleanPath}`;
  }

  function getPublisherUrl(path: string): string {
    const service = WALRUS_SERVICES.find((s) => s.id === walrusServiceId);
    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    console.log("getPublisherUrl", `${service?.publisherUrl}/v1/${cleanPath}`);
    return `${service?.publisherUrl}/v1/${cleanPath}`;
  }

  const handleSubmit = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (event) {
        if (event.target && event.target.result) {
          const result = event.target.result;
          if (result instanceof ArrayBuffer) {
            const nonce = crypto.getRandomValues(new Uint8Array(5));
            const policyObjectBytes = fromHex(uploadedBy);
            const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

            const { encryptedObject: encryptedBytes } =
              await sealClient.encrypt({
                threshold: 2,
                packageId: PACKAGE_ID,
                id,
                data: new Uint8Array(result),
              });
            const storageInfo = await storeBlob(encryptedBytes);
            displayUpload(storageInfo.info, file.type);

            // setIsUploading(false);
          } else {
            console.error("Unexpected result type:", typeof result);
            // setIsUploading(false);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("No file selected");
    }
  };

  const displayUpload = (storage_info: any, media_type: any) => {
    console.log("Walrus upload response:", info);
    if ("alreadyCertified" in storage_info) {
      info = {
        status: "Already certified",
        blobId: storage_info.alreadyCertified.blobId,
        endEpoch: storage_info.alreadyCertified.endEpoch,
        suiRefType: "Previous Sui Certified Event",
        suiRef: storage_info.alreadyCertified.event.txDigest,
        suiBaseUrl: SUI_VIEW_TX_URL,
        blobUrl: getAggregatorUrl(
          `/v1/blobs/${storage_info.alreadyCertified.blobId}`
        ),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.alreadyCertified.event.txDigest}`,
        isImage: media_type.startsWith("image"),
      };
    } else if ("newlyCreated" in storage_info) {
      info = {
        status: "Newly created",
        blobId: storage_info.newlyCreated.blobObject.blobId,
        endEpoch: storage_info.newlyCreated.blobObject.storage.endEpoch,
        suiRefType: "Associated Sui Object",
        suiRef: storage_info.newlyCreated.blobObject.id,
        suiBaseUrl: SUI_VIEW_OBJECT_URL,
        blobUrl: getAggregatorUrl(
          `/v1/blobs/${storage_info.newlyCreated.blobObject.blobId}`
        ),
        suiUrl: `${SUI_VIEW_OBJECT_URL}/${storage_info.newlyCreated.blobObject.id}`,
        isImage: media_type.startsWith("image"),
      };
    } else {
      throw Error("Unhandled successful response!");
    }
  };

  const storeBlob = (encryptedData: Uint8Array) => {
    return fetch(`${getPublisherUrl(`/v1/blobs?epochs=${NUM_EPOCH}`)}`, {
      method: "PUT",
      body: encryptedData,
    }).then((response) => {
      if (response.status === 200) {
        return response.json().then((info) => {
          return { info };
        });
      } else {
        alert(
          "Error publishing the blob on Walrus, please select a different Walrus service."
        );
        // setIsUploading(false);
        throw new Error("Something went wrong when storing the blob!");
      }
    });
  };

  // Define capId in the outer scope so it can be used later

  // Call createAllowlist after its declaration

  // async function handlePublish(
  //   wl_id: string,
  //   cap_id: string,
  //   moduleName: string
  // ) {
  //   const tx = new Transaction();
  //   tx.moveCall({
  //     target: `${PACKAGE_ID}::${moduleName}::publish`,
  //     arguments: [
  //       tx.object(wl_id),
  //       tx.object(cap_id),
  //       tx.pure.string(info!.blobId),
  //     ],
  //   });

  //   tx.setGasBudget(10000000);
  //   signAndExecute(
  //     {
  //       transaction: tx,
  //     },
  //     {
  //       onSuccess: async (result) => {
  //         console.log("res", result);
  //         alert(
  //           "Blob attached successfully, now share the link or upload more."
  //         );
  //       },
  //     }
  //   );
  // }
  // handlePublish("wl_id", capId, "allowlist"); // <-- Remove this line, now called after capId is set
  // 5) สร้าง Document record พร้อม walrus blobId
  const newDoc: Document & { walrusBlobId?: string } = {
    id: `doc-${Date.now()}`,
    title,
    uploadedBy,
    uploadedAt: new Date(),
    status: "draft",
    signatureFields: [],
    sharedWith: [],
    walrusBlobId: idHex,
  };

  // 6) บันทึกลง mock (หรือส่งไป backend จริง)
  mockDocuments.push(newDoc);
  console.log("New document:", newDoc);
  return newDoc;
};

export const shareDocument = async (
  documentId: string,
  addresses: string[]
): Promise<boolean> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const docIndex = mockDocuments.findIndex((doc) => doc.id === documentId);
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
