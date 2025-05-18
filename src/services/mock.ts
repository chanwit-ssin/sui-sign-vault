import { Document, SignatureField, UploadedDoc } from "@/types";
import { fromHex, toHex } from "@mysten/sui/utils";
import { SuiClient } from "@mysten/sui/client";
import { SealClient, getAllowlistedKeyServers } from "@mysten/seal";
import { TESTNET_PACKAGE_ID, WALRUS_SERVICES } from "@/config/constants";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "@/config/networkConfig";

const SUI_VIEW_TX_URL = `https://suiscan.xyz/testnet/tx`;
const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/testnet/object`;

const NUM_EPOCH = 2;
const packageId = useNetworkVariable("packageId");
const suiClient = useSuiClient();
const sealClient = new SealClient({
  suiClient,
  serverObjectIds: getAllowlistedKeyServers("testnet"),
  verifyKeyServers: false,
});
// Mock documents for demonstration

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

export const uploadDocument = async (
  title: string,
  uploadedBy: string,
  file: File,

  walrusServiceId: string = WALRUS_SERVICES[0].id
): Promise<Document> => {
  // 1) อ่านไฟล์เป็น Uint8Array
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  console.log("title:", title);
  console.log("uploadedBy:", uploadedBy);
  console.log("buffer:", buffer);

  // 2) สร้าง blob ID (policyId + nonce)
  const policyBytes = fromHex(TESTNET_PACKAGE_ID);
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const idHex = toHex(new Uint8Array([...policyBytes, ...nonce]));

  // console.log("Blob ID:", idHex);

  // 4) อัปโหลด ciphertext ไปยัง Walrus
  function getAggregatorUrl(path: string): string {
    const service = WALRUS_SERVICES.find((s) => s.id === walrusServiceId);
    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    return `${service?.aggregatorUrl}/v1/${cleanPath}`;
  }

  function getPublisherUrl(path: string): string {
    const service = WALRUS_SERVICES.find((s) => s.id === walrusServiceId);
    const cleanPath = path.replace(/^\/+/, "").replace(/^v1\//, "");
    return `${service?.publisherUrl}/v1/${cleanPath}`;
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = async function (event) {
      if (event.target && event.target.result) {
        const result = event.target.result;
        if (result instanceof ArrayBuffer) {
          const nonce = crypto.getRandomValues(new Uint8Array(5));
          const policyObjectBytes = fromHex(uploadedBy);
          const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
          const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
            threshold: 2,
            packageId,
            id,
            data: new Uint8Array(result),
          });
          const storageInfo = await storeBlob(encryptedBytes);
          // displayUpload(storageInfo.info, file.type);
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

  // console.log("Walrus upload response:", resp);
  // console.log("Walrus upload status:", resp.status);
  // console.log("Walrus upload status text:", resp.statusText);

  // if (!resp.ok) throw new Error(`Walrus upload failed: ${resp.status}`);
  // const store = await resp.json();
  // const blobId =
  //   store.newlyCreated?.blobObject.blobId || store.alreadyCertified?.blobId;

  // console.log("Walrus blob ID1:", blobId);
  // if (!blobId) throw new Error("Failed to get blob ID from Walrus response");
  // console.log("Walrus blob ID2:", blobId);

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
