// import { useSuiClient } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { PACKAGE_ID } from "@/config/constants";

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
