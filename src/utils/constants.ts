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

class EpochTypes {
  DAY!: string;
  WEEK!: string;
  MONTH!: string;
}
export const EPOCH_TYPE: EpochTypes = {
  DAY: "DAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
};

// Establish epoch 0 for day, week, and month
// @todo - update epoch zero for mainnet
class EpochNumbers {
  DAY!: i32;
  WEEK!: i32;
  MONTH!: i32;
}
export const EPOCH_ZERO: EpochNumbers = {
  DAY: 1696371257,
  WEEK: 1696371257,
  MONTH: 1696371257,
};

const getEpochZero = (epochType: string): i32 => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_ZERO.DAY;
  } else if (epochType == EPOCH_TYPE.WEEK) {
    return EPOCH_ZERO.WEEK;
  } else {
    return EPOCH_ZERO.MONTH;
  }
};

// Establish epoch duration for day, week, and month
export const EPOCH_DURATION: EpochNumbers = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2629746,
};

const getEpochDuration = (epochType: string): i32 => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_DURATION.DAY;
  } else if (epochType == EPOCH_TYPE.WEEK) {
    return EPOCH_DURATION.WEEK;
  } else {
    return EPOCH_DURATION.MONTH;
  }
};

export const determineEpochNumber = (
  timestamp: i32,
  epochType: string
): i32 => {
  const epochZero = getEpochZero(epochType); // @todo - why does EPOCH_ZERO[epochType] fail to compile?
  const epochDuration = getEpochDuration(epochType);
  const epochNumber = (timestamp - epochZero) / epochDuration;
  return Math.floor(epochNumber) as i32;
};

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function toDecimal(value: BigInt, decimals: i32): BigDecimal {
  return value
    .toBigDecimal()
    .div(exponentToBigDecimal(decimals).truncate(decimals));
}
