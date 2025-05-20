// import { useSuiClient } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import {
  SUIDOC_MODULE,
  SUIDOC_PACKAGE_ID,
  PACKAGE_ID,
} from "@/config/constants";

export async function createAllowlist(
  name: string,
  wallet: any
): Promise<string> {
  const rpcUrl = getFullnodeUrl("testnet");
  const client = new SuiClient({ url: rpcUrl });

  if (!name) throw new Error("Name is required");
  const tx = new Transaction();

  tx.moveCall({
    target: `0x4cb081457b1e098d566a277f605ba48410e26e66eaab5b3be4f6c560e9501800::allowlist::create_allowlist_entry`,
    arguments: [tx.pure.string(name)],
  });

  tx.setGasBudget(10000000);

  const result = await wallet.signAndExecuteTransaction({
    transaction: tx,
    options: {
      showRawEffects: true,
      showEffects: true,
    },
  });
  console.log("Transaction Result:", result);
  const createdObjectId = result?.reference?.objectId;
  console.log("Created Object ID:", createdObjectId);

  // const allowlistObj = result.effects?.created?.find(
  //   (o) => o.owner && typeof o.owner === "object" && "Shared" in o.owner
  // );
  // const capObj = result.effects?.created?.find(
  //   (o) => o.owner && typeof o.owner === "object" && "AddressOwner" in o.owner
  // );
  // const capId = capObj?.reference.objectId;
  // if (!capId) throw new Error("Failed to find Cap ID");
  return "";
}

export async function getAllDocumentObjects(
  clent: any,
  ownerAddress: string
): Promise<any[]> {
  try {
    // const keypair = getKeypair();
    // const ownerAddress = keypair.getPublicKey().toSuiAddress();

    // Correct way to filter for specific type in newer SDK versions
    const objects = await clent.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${SUIDOC_PACKAGE_ID}::${SUIDOC_MODULE}::Document`,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    // Process and return the documents
    return objects.data.map((obj) => {
      if (!obj.data) {
        throw new Error("Object data missing");
      }

      return {
        id: obj.data.objectId,
        type: obj.data.type,
        owner: obj.data.owner,
        version: obj.data.version,
        digest: obj.data.digest,
        content:
          obj.data.content?.dataType === "moveObject"
            ? obj.data.content.fields
            : undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}
