export const TESTNET_PACKAGE_ID =
  "0xcf7aa4af593290d9552ccf225c777697c7113c6722b417bcdb1965417a94f550";
export const TESTNET_GQL_CLIENT = "https://sui-testnet.mystenlabs.com/graphql";
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
