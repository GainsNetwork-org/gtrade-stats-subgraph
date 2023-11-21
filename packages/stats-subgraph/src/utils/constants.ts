import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");
export const DAI_DECIMALS = 18;
export const DAI_DECIMALS_BD = exponentToBigDecimal(DAI_DECIMALS);
export const ARB_DECIMALS = 18;
export const ARB_DECIMALS_BD = exponentToBigDecimal(ARB_DECIMALS);
export const ETH_DECIMALS = 18;
export const ETH_DECIMALS_BD = exponentToBigDecimal(ETH_DECIMALS);
export const PRECISION_DECIMALS = 10;
export const PRECISION_DECIMALS_BD = exponentToBigDecimal(PRECISION_DECIMALS);

//DIVERSITY POINTS THRESHOLDS BY GROUP
export const THRESHOLD_GROUP_0 = BigDecimal.fromString("100");
export const THRESHOLD_GROUP_1 = BigDecimal.fromString("250");
export const THRESHOLD_GROUP_2 = BigDecimal.fromString("300");
export const THRESHOLD_GROUP_3 = BigDecimal.fromString("500");
export const VOLUME_THRESHOLDS = [
  THRESHOLD_GROUP_0,
  THRESHOLD_GROUP_1,
  THRESHOLD_GROUP_2,
  THRESHOLD_GROUP_3,
];

export const PROTOCOL = "protocol";
export const DAI = "dai";
export const ETH = "eth";
export const ARB = "arb";

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

class Addresses {
  gnsPairsStorageV6!: string;
  gnsTradingCallbacksV6_4_1!: string;
}

class CollateralAddresses {
  DAI!: Addresses;
  ETH!: Addresses;
  ARB!: Addresses;
}

class NetworkAddresses {
  POLYGON!: CollateralAddresses;
  MUMBAI!: CollateralAddresses;
  ARBITRUM!: CollateralAddresses;
}

export const ARBITRUM_COLLATERALS: CollateralAddresses = {
  DAI: {
    gnsPairsStorageV6: "0xf67Df2a4339eC1591615d94599081Dd037960d4b",
    gnsTradingCallbacksV6_4_1: "0x298a695906e16aeA0a184A2815A76eAd1a0b7522",
  },
  ETH: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
  },
  ARB: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
  },
};

export const POLYGON_COLLATERALS: CollateralAddresses = {
  DAI: {
    gnsPairsStorageV6: "0x6e5326e944F528c243B9Ca5d14fe5C9269a8c922",
    gnsTradingCallbacksV6_4_1: "0x82e59334da8C667797009BBe82473B55c7A6b311",
  },
  ETH: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
  },
  ARB: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
  },
};

export const MUMBAI_COLLATERALS: CollateralAddresses = {
  DAI: {
    gnsPairsStorageV6: "0x2b497ff78bA1F803141Ecca0F98eF3c5B5B64d26",
    gnsTradingCallbacksV6_4_1: "0xA7443A20B42f9156F7D9DB01e51523C42CAC8eCE",
  },
  ETH: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
  },
  ARB: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
  },
};

export const NETWORK_ADDRESSES: NetworkAddresses = {
  POLYGON: POLYGON_COLLATERALS,
  MUMBAI: MUMBAI_COLLATERALS,
  ARBITRUM: ARBITRUM_COLLATERALS,
};

class EpochTypes {
  DAY!: string;
  WEEK!: string;
}
export const EPOCH_TYPE: EpochTypes = {
  DAY: "day",
  WEEK: "week",
};

// Establish epoch 0 for day, week
// @todo - update epoch zero for mainnet - move to network specific constants
class EpochNumbers {
  DAY!: i32;
  WEEK!: i32;
}
export const EPOCH_ZERO: EpochNumbers = {
  DAY: 1696118400, // Oct 1 (time of contract deploy)
  WEEK: 1696118400, // Oct 1 (start of week)
};

const getEpochZero = (epochType: string): i32 => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_ZERO.DAY;
  } else {
    return EPOCH_ZERO.WEEK;
  }
};

// Establish epoch duration for day, week
export const EPOCH_DURATION: EpochNumbers = {
  DAY: 86400,
  WEEK: 604800,
};

const getEpochDuration = (epochType: string): i32 => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_DURATION.DAY;
  } else {
    return EPOCH_DURATION.WEEK;
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
