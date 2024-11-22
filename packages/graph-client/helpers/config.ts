export const GTOKEN_SUBGRAPH = {
  137: "ErSWsfLWe6J6p71S3oybMtNJrwZ6g9xEivRzU7PbSSdg",
  42161: "J9WvpchpS1Sd5fQ4t7grJgMeC3nFTgHuJJe88YnkoaPF",
  80001: "",
  421614: "",
  8453: "Afnwe81PTY5Rf1wHyGafPMWbKoDn1HBNamBMLYHQucr4",
  33139: "the-buidler---mm--534985/gtoken-apechain",
};

export const STATS_SUBGRAPH = {
  137: "",
  42161: "HSP3yDXzM5pWeBfFAADPLYu6RFYwo9vg5zdpMMmQeVpe",
  80001: "",
  421614: "",
  8453: "EJeTLXXHku65Xa1UFtHNFdQfiEPKAcrc9qGCruEU4WMr",
  33139: "the-buidler---mm--534985/gtrade-stats-apechain",
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
  8453: ProviderType.THEGRAPH,
  33139: ProviderType.ALCHEMY,
};

export const buildSubgraphEndpoint = (
  chainId: number,
  graphName: string,
  apiKeys: { [ProviderType.THEGRAPH]: string; [ProviderType.ALCHEMY]: string }
) => {
  const provider = CHAIN_SUBGRAPH_PROVIDER[chainId];
  switch (provider) {
    case ProviderType.THEGRAPH:
      return `gateway-arbitrum.network.thegraph.com/api/${apiKeys[ProviderType.THEGRAPH]}/subgraphs/id/${graphName}`;
    case ProviderType.ALCHEMY:
      return `subgraph.satsuma-prod.com/${apiKeys[ProviderType.ALCHEMY]}/${graphName}/api`;
  }
};
