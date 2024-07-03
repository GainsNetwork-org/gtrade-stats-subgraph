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
export const MULTI_COLLAT_BLOCK_ARBITRUM = 173285454;
export const MULTI_COLLAT_BLOCK_POLYGON = 52650382;
export const MULTI_COLLAT_BLOCK_SEPOLIA = 44357232;
export const DIAMOND_ADDRESS_ARBITRUM =
  "0xFF162c694eAA571f685030649814282eA457f169";
export const DIAMOND_ADDRESS_POLYGON =
  "0xFF162c694eAA571f685030649814282eA457f169";
export const DIAMOND_ADDRESS_SEPOLIA =
  "0xd659a15812064C79E189fd950A189b15c75d3186";

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

export function getCollateralfromIndex(collateralIndex: i32): string {
  if (collateralIndex == 1) {
    return "dai";
  }

  if (collateralIndex == 2) {
    return "eth";
  }

  if (collateralIndex == 3) {
    return "usdc";
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
  USDC: "usdc",
};

class Networks {
  POLYGON!: string;
  SEPOLIA!: string;
  ARBITRUM!: string;
}

export const NETWORKS: Networks = {
  POLYGON: "matic",
  SEPOLIA: "arbitrum-sepolia",
  ARBITRUM: "arbitrum-one",
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

export function getMultiCollatBlock(network: string): i32 {
  if (network == NETWORKS.ARBITRUM) {
    return MULTI_COLLAT_BLOCK_ARBITRUM;
  }

  if (network == NETWORKS.POLYGON) {
    return MULTI_COLLAT_BLOCK_POLYGON;
  }

  if (network == NETWORKS.SEPOLIA) {
    return MULTI_COLLAT_BLOCK_SEPOLIA;
  }

  throw new Error("Network not supported");
}

export function getDiamondAddress(network: string): string {
  if (network == NETWORKS.ARBITRUM) {
    return DIAMOND_ADDRESS_ARBITRUM;
  }

  if (network == NETWORKS.POLYGON) {
    return DIAMOND_ADDRESS_POLYGON;
  }

  if (network == NETWORKS.SEPOLIA) {
    return DIAMOND_ADDRESS_SEPOLIA;
  }

  throw new Error("Network not supported");
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
  // "0x4c7685b92fc94778012cc716e4326874db91debb".toLowerCase(), // capitalismlab
  // "0x10846f7269cefCB99D31C163ca901688267D5859".toLowerCase(), // weilin
  "0x9325564ADe7683706107685Cf1993678B1163261".toLowerCase(), // cryptowesearch
  "0x1CD70057d52D98E3DBA24c2A7e461d168050C4D2".toLowerCase(), // bee
  "0x6a2664aba79A4F026c2fe34Be983B1Da96795565".toLowerCase(), // hoot
  "0xE7Da4dAAae1BD738A071500dca1d37E9d48b965D".toLowerCase(), // giba
  "0x3161d1f5edb3f9ceebfb3e258681484b82ae3ea4".toLowerCase(), // june
];

// this is so the subgraph is backwards compatible
// we don't want these addrsesses whitelisted before epoch 6
export const EPOCH_7_WHITELISTED_REFERRAL_ADDRESSES: string[] = [
  // "0x38a0FceA985F77e955D7526d569E695536EaA551".toLowerCase(), // talkchain 01-31-24
  "0xdD4D5538F0d7C364272c927d39216A22de0B0482".toLowerCase(), // wang 01-31-24
  "0x3Af0e0Cb6E87D67C2708debb77AE3F8ACD7493b5".toLowerCase(), // sparegas4lambro 01-31-24
  // "0x8521058b9a8c48346e02d263884b7E2Bd504deC8".toLowerCase(), // reetika 01-31-24
];

export function isWhitelistedReferralByEpoch(
  referral: string,
  epoch: i32
): boolean {
  if (epoch < 7) {
    return WHITELISTED_REFERRAL_ADDRESSES.includes(referral);
  } else {
    return (
      WHITELISTED_REFERRAL_ADDRESSES.includes(referral) ||
      EPOCH_7_WHITELISTED_REFERRAL_ADDRESSES.includes(referral)
    );
  }
}

export const WHITELISTED_REFEREE_MULTIPLIER = BigDecimal.fromString("0.10");
export const WHITELISTED_REFERRER_MULTIPLIER = BigDecimal.fromString("0.15");

export const PNL_BLACKLISTED_ADDRESSES_12: string[] = [
  "0x21644f3651401818ac6c18c51ff7dca04fe219a5",
  "0xc7276688375f6ce5254de4c0cd804cddecad2775",
  "0x2549f9e75495ca1c80efaa86851c934f4b913e33",
  "0xe310634ac4a77d50e485aa1edfff3689eed5c81a",
  "0xddf010af74f6c6fcceec2ba6caf519ef73a7052d",
  "0x64d6acc69c765229ada4ce3aa0f027574faba368",
  "0x117306e985e432d855d1956e48ec315b91bd8dd1",
  "0x5b58a5829f7b17c38e0bcb340b4385d6ecf18c9c",
  "0xb69e9c30693de26d378d6050a669b67cb6c0bd88",
  "0xeb367a7db8faa67bd4d8e13c1f544cdea0d2db2f",
  "0xf9d21747a75c4c35d4487937531d61149ac1a02a",
  "0xb990d0f1928710b64146cafe1baab7ec2bc9344a",
  "0x5140e74a1f29a811f9170f7361a168fc81c4ed50",
  "0xe87c5c289ccdef9b06826cffb51e5d03501f7ea6",
  "0xc45d414f682563362c0eaee51b5f47ad6b1fe140",
  "0x2f364888eb783cfde690d7930354756f0e661386",
  "0x00da1e121a0a97a9bddcf9ff799803567489a881",
  "0xec0b4dbfc33b536df9e79951654b6e29feff9b82",
  "0x72e36e8282202cf32477beac23fa0aeec5609d32",
  "0x38783c1ecba455f15ccce5ba1765f45dd9ecd23f",
  "0x3659a273a64a77a68b76c0fe8aaa72e11f8d45e7",
  "0x8b19cfc38dbf87e3a69937f64c0670bf3eddbde3",
  "0xa4a838ea253756c5925f06843467798e8f16b300",
  "0xfe4a721a01ff2cc8aceba5687207cbaefe0fe8a9",
  "0xac031d0d2fc3f20e124f4969c1d4cd1be6525025",
  "0x7cd674cdb3eac92d594a8d9b36621f8b5d8f33b2",
  "0x85a6beb843fd4a84ecd35629f83f2f55f714088f",
  "0x3b54c77ca3a431b40c4563fdaeac938e6a275065",
  "0x8d7fa1417c9adefdc746d39e6137a1fbbadaf24b",
  "0x16d247b32e422bf2f87d884fbbe9df9817b8af78",
  "0x00e34ce649a1b655d6b727814837921788872c43",
  "0x59462e1d3cce5e53d16049a9c447a4a4627889e9",
  "0xd7d1add81c400b22ac2a301ea8148e9d9731a9c1",
  "0x6cb6b69366240df2e6b6bbdf867b457bfd2a1fa2",
  "0x6ae5122ac8877b966ddc53e11fbf7b8b697550e8",
  "0x9adf02c4d8e8a2a0fa11587bfc81ac182a0dc65a",
  "0xcfbadda97225c18a5863e16c9788747702938b02",
  "0x29e1a09529f1401f1118cd47bcfdcf6a4ab713ab",
  "0xd04f0db8d89351082c6126fdc7bf0c2229d160cb",
  "0x45d989571f0ba27fdcaced68ace4d33574a4c522",
  "0x0741134b42af4bab06b6b0db6fee7a34ade53f08",
  "0xae25545ab3bf0e845286e46c96dfadf9190330b1",
  "0x23952af7e74cbf8bd459234ce29ea046252bc101",
  "0x445eea01a95bbffcbbf470385e2aa23cc06de9aa",
  "0xb9a0618a2d33d43ac77c4a7342c5d0c79fa62eff",
  "0x14a8b2988a3c7f9c7f170f486e95a26e6ebb7f2f",
  "0xf76ef36de45749b45f4b87c7e755458f8eee0ff2",
  "0xaa42bbc9d7e3ce551ef798978e867df458985ee5",
  "0x29754144ebf4f2071649897989d7f6ceb80f3f6a",
  "0x92a533e6733787b42bfd3cf43c4986ea5873f418",
  "0xb92c75c700d4d29dddfea87dcf197e91b24c4788",
  "0x8474dbb81e07cfd6dbd728d189c683d1742e97a9",
  "0x7f2a98a41b684a34401e2b67d03a5c2a437e5627",
  "0x1018c4c09d8c8c6dc6cb07c62b6ac32bc25c950e",
  "0x8eaece05aa45eb55a926b704cf630b781c9c0f43",
  "0xa2572f772e1a46b1bf55e7127166d4675416b714",
  "0x7a4041cfe1f7b89c6540e1d09d320e411f523294",
  "0xa94ac24aa929e48592fbae88ef25e4ceb7d9b226",
  "0x43688a6605dfdd8bf09e9763a579cac0b8483cea",
  "0x14bc8ab7463521cb56a7e96a603810e1d1a0c6dc",
  "0xd46d9e463d74c9cb61e45239393d4eb25402a579",
  "0x4c9e646f1f97fd4631b3e5d934dabf96c5a194a2",
  "0x27f315792d99c021f4aa69ac26255ebf75e2f119",
  "0xb7f14249492928f64a4eaec63c36cf77f1eead49",
  "0xb5b1a839c9615852e8262bc7170a08b39ac59c04",
  "0x1a1cd9df56a8ed6fd33793156b13fd01fa595dd4",
  "0x3e3527886e481dd0b03a9577a20f224b15b2b4ce",
  "0xa69cf8675f180c7641921bde6a67795019ecfe0c",
  "0x8724c36ab722aab6cd7d4171cd5967f5eaff4067",
  "0x5757b98f72d401c7f2bd5573f1655ed76e230840",
  "0x7644989a2bba173639e1ba4b6ca7bc71d916bd40",
  "0xbb3562eb656f728f8cf9c01093eac8582eb06b78",
  "0x7c9125a6cffd7553b238124917c63981c80a0a4a",
  "0xdfcd5dd1103cfb5c5f62d52a09393a4b7b1943eb",
  "0x201894dbd8822e033d0d9ad687de284558a6cdd4",
  "0xb250ab4ea9c9e27a161b27300431f4640d2e377a",
  "0xc518893df26b9b85505de307ece9786a21a1096f",
  "0xdeffea1bcb9cecdbc670bc39ad8e761f53413670",
  "0xeaea2759d19f646875b62cef862fb3d3b505ae20",
  "0xafeee588b7608c026c81ff89214a2c1c4bcfe449",
  "0xd7456c9e57f18a8d8bdd89284dd05e4b0f51c9ed",
  "0x7788113b581518fb8f1dfffdf5d3025f5748e716",
  "0x7db4353fa309977367c3680f6368cbad77fe8ed0",
  "0x0ec13d860e66dcaa69666aef6581dea48b55975a",
  "0x73fee66861a4770826d9cec2439f14b514f307d5",
  "0x409ada29acb0f951a3fa27cf790c03a6e3479d2c",
  "0xa093d215553cfdd9545f69dfbeeca28932815f2d",
  "0xd9e584d02719e730b46669cdc5bc7cdc5c5ad871",
  "0x79c96dee170120881356e844eca2eb0464e8c6c0",
  "0x4eddace20d85342a6151e1cb2595d7182182f649",
  "0xd9ff510f35cc8baf1ae32a306e0fd57c274a1cf9",
  "0xd31e9aa2db47809dfc6ffdf05e46cfbc1aa5f468",
  "0x6bb348ec9b4c0e461ee7349b4a4e3e53374cc295",
  "0x7cc31591a5e15c2ccbac1bb44bc130536a613163",
  "0x8c1d0ee1dd7ff4319e9cca21eaf70476bc3d7b6c",
  "0x2a488dc5605b4f0e156f98418e58ede7c48af31d",
  "0x910fb1ad7e0451eccbc514c17ddc51062289f131",
  "0xf915da10e5136352ba049acb0545deb119054256",
  "0xffe1591037e5f0ff460a8ca19353c735570395b0",
];
