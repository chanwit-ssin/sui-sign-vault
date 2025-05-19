export const PACKAGE_ID =
  "0x9822769c16f703f6a43460dfa763252bac6bc216c39a630dbe95e36a5db4122e";

export const SUIDOC_PACKAGE_ID = "0xaccfec6bf67b423c248fdcb1ccd728f32310155b5c277addc279c5a53e0eca1e";
export const SUIDOC_MODULE = "document";

export const NETWORK = "testnet"; // testnet, mainnet, devnet

export const TESTNET_GQL_CLIENT
 = "https://sui-testnet.mystenlabs.com/graphql";
export const WALRUS_SERVICES = [
  {
    id: "service1",
    name: "walrus.space",
    publisherUrl: "/publisher1",
    aggregatorUrl: "/aggregator1",
  },
  {
    id: "service2",
    name: "staketab.org",
    publisherUrl: "/publisher2",
    aggregatorUrl: "/aggregator2",
  },
  // เพิ่มบริการตามต้องการ
];
export const DEFAULT_WALRUS_SERVICE_ID = WALRUS_SERVICES[0].id;
