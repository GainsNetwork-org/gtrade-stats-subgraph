export const GTOKEN_SUBGRAPH = {
  137: "ErSWsfLWe6J6p71S3oybMtNJrwZ6g9xEivRzU7PbSSdg",
  42161: "J9WvpchpS1Sd5fQ4t7grJgMeC3nFTgHuJJe88YnkoaPF",
  80001: "",
  421614: "",
  8453: "Afnwe81PTY5Rf1wHyGafPMWbKoDn1HBNamBMLYHQucr4",
  33139: "",
};

export const STATS_SUBGRAPH = {
  137: "",
  42161: "Qmc2hgE7f9otZvD2xp1SuzatKwXKFgrr9rRp8zW85EoFGM",
  80001: "",
  421614: "",
  8453: "the-buidler---mm--534985/gtrade-stats-base",
  33139: "the-buidler---mm--534985/gtrade-stats-base",
};

export enum ProviderType {
  THEGRAPH = "THEGRAPH",
  ALCHEMY = "ALCHEMY",
}

export const CHAIN_SUBGRAPH_PROVIDER = {
  137: ProviderType.THEGRAPH,
  42161: ProviderType.THEGRAPH,
  80001: ProviderType.THEGRAPH,
  421614: ProviderType.THEGRAPH,
  8453: ProviderType.ALCHEMY,
  33139: ProviderType.ALCHEMY,
};

export const buildSubgraphEndpoint = (
  chainId: number,
  apiKey: string,
  graphName: string
) => {
  const provider = CHAIN_SUBGRAPH_PROVIDER[chainId];
  switch (provider) {
    case ProviderType.THEGRAPH:
      return `https://gateway-arbitrum.network.thegraph.com/api/${apiKey}/deployments/id/${graphName}`;
    case ProviderType.ALCHEMY:
      return `https://subgraph.satsuma-prod.com/${apiKey}/${graphName}/api`;
  }
};
