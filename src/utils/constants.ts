import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BD = BigDecimal.fromString("0");
export const DAI_DECIMALS = 18;
export const DAI_DECIMALS_BD = exponentToBigDecimal(DAI_DECIMALS);
export const PRECISION_DECIMALS = 10;
export const PRECISION_DECIMALS_BD = exponentToBigDecimal(PRECISION_DECIMALS);

export const PROTOCOL = "protocol";

class Networks {
  POLYGON!: string;
  MUMBAI!: string;
  ARBITRUM!: string;
}

export const NETWORKS: Networks = {
  POLYGON: "matic",
  MUMBAI: "mumbai",
  ARBITRUM: "arbitrum-one",
};

class NetworkAddresses {
  gnsPairsStorageV6!: string;
}

export const ARBITRUM_ADDRESSES: NetworkAddresses = {
  gnsPairsStorageV6: "0xf67Df2a4339eC1591615d94599081Dd037960d4b",
};

export const EPOCH_TYPE = {
  DAY: "DAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
};

// Establish epoch 0 for day, week, and month
// @todo - update epoch zero for mainnet
export const EPOCH_ZERO = {
  DAY: 1696371257,
  WEEK: 1696371257,
  MONTH: 1696371257,
};

// Establish epoch duration for day, week, and month
export const EPOCH_DURATION = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2629746,
};

export const determineEpochNumber = (
  timestamp: number,
  epochType: string
): number => {
  const epochZero = EPOCH_ZERO[epochType];
  const epochDuration = EPOCH_DURATION[epochType];
  const epochNumber = (timestamp - epochZero) / epochDuration;
  return Math.floor(epochNumber);
};

export function exponentToBigDecimal(decimals: number): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function toDecimal(value: BigInt, decimals: number): BigDecimal {
  return value
    .toBigDecimal()
    .div(exponentToBigDecimal(decimals).truncate(decimals));
}
