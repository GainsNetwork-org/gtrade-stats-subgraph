import { EpochType } from "@gainsnetwork/graph-client";

export const CHAIN_ID_TO_SUBGRAPH: { [chainId: number]: string } = {
  137: "gtrade-stats-polygon",
  80001: "gtrade-stats-mumbai",
  42161: "gtrade-stats-arbitrum",
};

export const generateId = (
  address: string,
  epochType: EpochType,
  epochNumber: number
): string => {
  return `${address}-${epochType}-${epochNumber}`;
};
