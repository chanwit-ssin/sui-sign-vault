// import { useSuiClient } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SUIDOC_MODULE, SUIDOC_PACKAGE_ID, PACKAGE_ID } from "@/config/constants";

export async function createAllowlist(
  name: string,
  wallet: any
): Promise<any> {
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
  
  const waitResult = await client.waitForTransaction({
    digest: result.digest,
    options: {
      showEvents: true,
      showObjectChanges: true,
    },
  });
  
  console.log("Wait result:", waitResult);
  
  // Find objects using objectChanges instead of effects
  const allowlistObj = waitResult.objectChanges?.find(
    (change) => 
      change.type === "created" && 
      change.owner && 
      typeof change.owner === "object" && 
      "Shared" in change.owner
  );
  
  const capObj = waitResult.objectChanges?.find(
    (change) => 
      change.type === "created" && 
      change.owner && 
      typeof change.owner === "object" && 
      "AddressOwner" in change.owner
  );
  
  console.log("Allowlist object:", allowlistObj);
  console.log("Cap object:", capObj);
  
  if (!allowlistObj) throw new Error("Failed to find allowlist object");
  if (!capObj) throw new Error("Failed to find Cap ID object");
  
  // Access objectId directly from the objectChange
  const allowlistObjectId = allowlistObj.objectId;
  const capId = capObj.objectId;
  
  if (!capId) throw new Error("Failed to find Cap ID");
  return { allowlistObjectId, capId };
}

export async function getAllDocumentObjects(clent: any): Promise<any[]> {
  try {
    // const keypair = getKeypair();
    // const ownerAddress = keypair.getPublicKey().toSuiAddress();

    // Correct way to filter for specific type in newer SDK versions
    const objects = await clent.getOwnedObjects({
      owner: "0x4543f2985b94a433fd7c12f097d528c1f10f76dac97d4bef99f842d290534be8",
      filter: {
        StructType: `${SUIDOC_PACKAGE_ID}::${SUIDOC_MODULE}::Document`
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true
      }
    });

    // Process and return the documents
    return objects.data.map(obj => {
      if (!obj.data) {
        throw new Error("Object data missing");
      }

      return {
        id: obj.data.objectId,
        type: obj.data.type,
        owner: obj.data.owner,
        version: obj.data.version,
        digest: obj.data.digest,
        content: obj.data.content?.dataType === "moveObject" 
          ? obj.data.content.fields 
          : undefined
      };
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
}