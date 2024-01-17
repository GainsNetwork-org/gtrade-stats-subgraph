import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BD = BigDecimal.fromString("0");
export const ONE_BD = BigDecimal.fromString("1");
export const DAI_DECIMALS = 18;
export const DAI_DECIMALS_BD = exponentToBigDecimal(DAI_DECIMALS);
export const USDC_DECIMALS = 6;
export const USDC_DECIMALS_BD = exponentToBigDecimal(USDC_DECIMALS);
export const ETH_DECIMALS = 18;
export const ETH_DECIMALS_BD = exponentToBigDecimal(ETH_DECIMALS);
export const PRECISION_DECIMALS = 10;
export const PRECISION_DECIMALS_BD = exponentToBigDecimal(PRECISION_DECIMALS);
export const MULTI_COLLAT_BLOCK_ARBITRUM = 44546475; // @todo
export const MULTI_COLLAT_BLOCK_POLYGON = 44546475; // @todo
export const MULTI_COLLAT_BLOCK_MUMBAI = 44357232;

export function getCollateralDecimals(collateral: string): BigDecimal {
  if (collateral == COLLATERALS.DAI) {
    return DAI_DECIMALS_BD;
  }

  if (collateral == COLLATERALS.ETH) {
    return ETH_DECIMALS_BD;
  }

  if (collateral == COLLATERALS.USDC) {
    return USDC_DECIMALS_BD;
  }

  throw new Error("Collateral not supported");
}

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

class Collaterals {
  _ALL_!: string;
  DAI!: string;
  ETH!: string;
  USDC!: string;
}

export const COLLATERALS: Collaterals = {
  _ALL_: "_all_",
  DAI: "dai",
  ETH: "eth",
  USDC: "arb",
};

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

class CollateralAddresses {
  gnsPairsStorageV6!: string;
  gnsTradingCallbacksV6_4_1!: string;
  gnsPriceAggregator: string;
  gnsPriceAggregator_Old!: string;
}

class AgnosticAddresses {
  gnsReferrals: string;
  gnsDiamond: string;
}

export class NetworkAddresses {
  _ALL_!: AgnosticAddresses;
  DAI!: CollateralAddresses;
  ETH!: CollateralAddresses;
  USDC!: CollateralAddresses;
}

export const ARBITRUM_COLLATERALS: NetworkAddresses = {
  _ALL_: {
    gnsReferrals: "0xAA379DD7Ec0bae467490e89bB2055A7e01231b8f",
    gnsDiamond: "",
  },
  DAI: {
    gnsPairsStorageV6: "0xf67Df2a4339eC1591615d94599081Dd037960d4b",
    gnsTradingCallbacksV6_4_1: "0x298a695906e16aeA0a184A2815A76eAd1a0b7522",
    gnsPriceAggregator: "0x2e44a81701A8355E59B3204B4a9Fe8FC43CbE0C3",
    gnsPriceAggregator_Old: "",
  },
  ETH: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
    gnsPriceAggregator: "",
    gnsPriceAggregator_Old: "",
  },
  USDC: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
    gnsPriceAggregator: "",
    gnsPriceAggregator_Old: "",
  },
};

export const POLYGON_COLLATERALS: NetworkAddresses = {
  _ALL_: {
    gnsReferrals: "0x0F9498b1206Bf9FfDE2a2321fDB56F573A052425",
    gnsDiamond: "",
  },
  DAI: {
    gnsPairsStorageV6: "0x6e5326e944F528c243B9Ca5d14fe5C9269a8c922",
    gnsTradingCallbacksV6_4_1: "0x82e59334da8C667797009BBe82473B55c7A6b311",
    gnsPriceAggregator: "0x126F32723c5FC8DFEB17c46b7B7dD3dCd458A816",
    gnsPriceAggregator_Old: "",
  },
  ETH: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
    gnsPriceAggregator: "",
    gnsPriceAggregator_Old: "",
  },
  USDC: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "",
    gnsPriceAggregator: "",
    gnsPriceAggregator_Old: "",
  },
};

export const MUMBAI_COLLATERALS: NetworkAddresses = {
  _ALL_: {
    gnsReferrals: "0x022e26d7DdAD3fc311C6472949F19c99b3CB08e6",
    gnsDiamond: "0xDee93dD1Cb54ce80D690eC07a20CB0ce9d7F741C",
  },
  DAI: {
    gnsPairsStorageV6: "0x2b497ff78bA1F803141Ecca0F98eF3c5B5B64d26",
    gnsTradingCallbacksV6_4_1: "0xA7443A20B42f9156F7D9DB01e51523C42CAC8eCE",
    gnsPriceAggregator: "0x7D7b76fB3c9eaB75761F85C9221dA09450b33eD7",
    gnsPriceAggregator_Old: "0x5a284f0f52a8Ea4A33033EfB3Ffd723db9bbe312",
  },
  ETH: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "0x9b897661E03ac0131d0f5E522eC188d9193Cb1f5",
    gnsPriceAggregator: "0x48fE5846829E1a476Cb56b2188b4DA958406a509",
    gnsPriceAggregator_Old: "",
  },
  USDC: {
    gnsPairsStorageV6: "",
    gnsTradingCallbacksV6_4_1: "0xD9CBa2cBBBA3A2022dfb7dAb3b66c33545908Af8",
    gnsPriceAggregator: "0x84154DE35c8F157Ce02E13C9271370732299f7EA",
    gnsPriceAggregator_Old: "",
  },
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
  DAY: 1703203200, // Dec 22
  WEEK: 1703203200, // Dec 22
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

export function getNetworkCollaterals(network: string): NetworkAddresses {
  if (network == NETWORKS.ARBITRUM) {
    return ARBITRUM_COLLATERALS;
  }

  if (network == NETWORKS.POLYGON) {
    return POLYGON_COLLATERALS;
  }

  if (network == NETWORKS.MUMBAI) {
    return MUMBAI_COLLATERALS;
  }

  throw new Error("Network not supported");
}

export function getMultiCollatBlock(network: string): i32 {
  if (network == NETWORKS.ARBITRUM) {
    return MULTI_COLLAT_BLOCK_ARBITRUM;
  }

  if (network == NETWORKS.POLYGON) {
    return MULTI_COLLAT_BLOCK_POLYGON;
  }

  if (network == NETWORKS.MUMBAI) {
    return MULTI_COLLAT_BLOCK_MUMBAI;
  }

  throw new Error("Network not supported");
}

export function getNetworkCollateralAddressesFromNetwork(
  networkCollaterals: NetworkAddresses,
  collateral: string
): CollateralAddresses {
  if (collateral == COLLATERALS.DAI) {
    return networkCollaterals.DAI;
  }

  if (collateral == COLLATERALS.ETH) {
    return networkCollaterals.ETH;
  }

  if (collateral == COLLATERALS.USDC) {
    return networkCollaterals.USDC;
  }

  throw new Error("Collateral not supported");
}

export function getNetworkCollateralAddresses(
  network: string,
  collateral: string
): CollateralAddresses {
  const collateralAddresses = getNetworkCollaterals(network);
  return getNetworkCollateralAddressesFromNetwork(
    collateralAddresses,
    collateral
  );
}

export function getNetworkAddresses(network: string): AgnosticAddresses {
  const collateralAddresses = getNetworkCollaterals(network);
  return collateralAddresses._ALL_;
}

export const AGGREGATOR_ADDRESSES = [
  "0xf399dEe036dbBDEF37264df105B9b84F92a11fbc".toLowerCase(), // logx
  "0x10C2CbfE29f4f5e4C24d54d36C8F283A61eB0c2f".toLowerCase(), // mux
  "0x8c128f336b479b142429a5f351af225457a987fa".toLowerCase(), // unidex
  "0xec9581354f7750Bc8194E3e801f8eE1D91e2a8Ac".toLowerCase(), // mumbai - test account
];

export const WHITELISTED_REFERRAL_ADDRESSES: string[] = [
  "0xd79f4811f2b603649c82AeDA0143719D86Ab6574".toLowerCase(), // mumbai - test account
  "0x011ba9dF834FeB01E5E14F3297412BA766b78d21".toLowerCase(), // kenji
  "0xC5Ed611f03Fe94D7c1f28aA4037864A459857cE5".toLowerCase(), // hiroba
  "0x065741Ffb08D26102E646Da3492bDD27256E864a".toLowerCase(), // dn48dme
  "0x4c7685b92fc94778012cc716e4326874db91debb".toLowerCase(), // capitalismlab
  "0x10846f7269cefCB99D31C163ca901688267D5859".toLowerCase(), // weilin
  "0x9325564ADe7683706107685Cf1993678B1163261".toLowerCase(), // cryptowesearch
  "0x1CD70057d52D98E3DBA24c2A7e461d168050C4D2".toLowerCase(), // bee
  "0x6a2664aba79A4F026c2fe34Be983B1Da96795565".toLowerCase(), // hoot
  "0xE7Da4dAAae1BD738A071500dca1d37E9d48b965D".toLowerCase(), // giba
  "0x3161d1f5edb3f9ceebfb3e258681484b82ae3ea4".toLowerCase(), // june
];
export const WHITELISTED_REFEREE_MULTIPLIER = BigDecimal.fromString("0.10");
export const WHITELISTED_REFERRER_MULTIPLIER = BigDecimal.fromString("0.15");
