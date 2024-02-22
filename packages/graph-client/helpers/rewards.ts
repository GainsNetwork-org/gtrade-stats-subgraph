import {
  EpochTradingPointsRecord,
  EpochType,
  RewardConfig,
  RewardResults,
  Collateral,
  RewardDistributionP,
} from "../.graphclient/index.js";
import { EpochTradingPoints, LoyaltyTier } from "../types/rewards";

export const convertPointShareToRewards = (
  points: number,
  totalPoints: number,
  totalReward: number
) => (+totalPoints === 0 ? 0 : (+points / +totalPoints) * +totalReward);

export const generateId = (
  address: string,
  epochType: EpochType,
  epochNumber: number
): string => {
  return `${address}-${epochType}-${epochNumber}`;
};

// @note This must be kept in sync with the subgraph
export const EPOCH_ZERO = {
  DAY: 1703203200, // Dec 22
  WEEK: 1703203200, // Dec 22
};

export const EPOCH_TYPE = {
  DAY: "day",
  WEEK: "week",
};

export const getEpochZero = (epochType: string): number => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_ZERO.DAY;
  } else {
    return EPOCH_ZERO.WEEK;
  }
};

// Establish epoch duration for day, week
export const EPOCH_DURATION = {
  DAY: 86400,
  WEEK: 604800,
};

export const getEpochDuration = (epochType: string): number => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_DURATION.DAY;
  } else {
    return EPOCH_DURATION.WEEK;
  }
};

export const determineEpochNumber = (
  timestampSecs: number,
  epochType: string
): number => {
  const epochZero = getEpochZero(epochType);
  const epochDuration = getEpochDuration(epochType);
  const epochNumber = (timestampSecs - epochZero) / epochDuration;
  return Math.floor(epochNumber);
};

export const convertPointsToRewardsForUser = (
  userPoints: EpochTradingPoints,
  protocolPoints: EpochTradingPoints,
  rewards: RewardConfig
): RewardResults => {
  const rewardResults: RewardResults = {
    address: userPoints.address,
    total: 0,
    loyalty: 0,
    fee: 0,
    absSkill: 0,
    relSkill: 0,
    diversity: 0,
    loyaltyPoints: userPoints.loyaltyPoints,
    feePoints: userPoints.feePoints,
    absSkillPoints: userPoints.absSkillPoints,
    relSkillPoints: userPoints.relSkillPoints,
    diversityPoints: userPoints.diversityPoints,
  };

  const rewardDistribution = getRewardDistributionForLocalEpoch(
    rewards,
    getLocalEpochNumber(rewards, userPoints.epochNumber)
  );

  const epochTotalRewards = rewards.totalRewards / rewards.numEpochs;
  rewardResults.loyalty = convertPointShareToRewards(
    userPoints.loyaltyPoints,
    protocolPoints.loyaltyPoints,
    rewardDistribution.loyalty * epochTotalRewards
  );

  rewardResults.fee = convertPointShareToRewards(
    userPoints.feePoints,
    protocolPoints.feePoints,
    rewardDistribution.fee * epochTotalRewards
  );

  rewardResults.absSkill = convertPointShareToRewards(
    userPoints.absSkillPoints,
    protocolPoints.absSkillPoints,
    rewardDistribution.absSkill * epochTotalRewards
  );

  rewardResults.relSkill = convertPointShareToRewards(
    userPoints.relSkillPoints,
    protocolPoints.relSkillPoints,
    rewardDistribution.relSkill * epochTotalRewards
  );

  rewardResults.diversity = convertPointShareToRewards(
    userPoints.diversityPoints,
    protocolPoints.diversityPoints,
    rewardDistribution.diversity * epochTotalRewards
  );

  rewardResults.total =
    rewardResults.loyalty +
    rewardResults.fee +
    rewardResults.absSkill +
    rewardResults.relSkill +
    rewardResults.diversity;

  return rewardResults;
};

export const transformEpochTradingPointsRecord = (
  record: EpochTradingPointsRecord
): EpochTradingPoints => ({
  ...record,
  epochType: record.epochType,
  epochNumber: Number(record.epochNumber),
  address: record.address,
  loyaltyPoints: Number(record.loyaltyPoints),
  feePoints: Number(record.feePoints),
  absSkillPoints: Number(record.absSkillPoints),
  relSkillPoints: Number(record.relSkillPoints),
  diversityPoints: Number(record.diversityPoints),
});

export const loyaltyTiers: LoyaltyTier[] = [
  { lowerBound: 8, upperBound: 40, returnValue: 1 },
  { lowerBound: 40, upperBound: 200, returnValue: 5 },
  { lowerBound: 200, upperBound: 400, returnValue: 25 },
  { lowerBound: 400, upperBound: Infinity, returnValue: 50 },
];

export const getLoyaltyTier = (fees: number): number => {
  for (const tier of loyaltyTiers) {
    if (fees >= tier.lowerBound && fees < tier.upperBound) {
      return tier.returnValue;
    }
  }
  return 0;
};

export const getFeesFromNextTier = (fees: number): number => {
  for (const tier of loyaltyTiers) {
    if (fees >= tier.lowerBound && fees < tier.upperBound) {
      return tier.upperBound - fees;
    }
  }
  return 0;
};

export const DIVERSITY_THRESHOLD = 0;
export const getDiversityGroupFromPairIndex = (
  pairIndex: number,
  groupIndex: number
): number => {
  let groupId = 0;
  if (groupIndex == 0 && (pairIndex == 0 || pairIndex == 1)) {
    groupId = 0;
  } else if (groupIndex == 0 && pairIndex > 1) {
    groupId = 1;
  } else if (groupIndex == 1 || groupIndex == 8 || groupIndex == 9) {
    groupId = 2;
  } else if (groupIndex == 6 || groupIndex == 7) {
    groupId = 3;
  } else {
    groupId = 4;
  }
  return groupId;
};
export const getFeesFromDiversityTreshold = (existingFees: number) => {
  if (existingFees < DIVERSITY_THRESHOLD) {
    return DIVERSITY_THRESHOLD - existingFees;
  }
  return 0;
};

export const COLLATERALS = {
  _ALL_: "_all_" as Collateral,
  DAI: "dai" as Collateral,
  ETH: "eth" as Collateral,
  ARB: "arb" as Collateral,
};

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
  "0x38a0FceA985F77e955D7526d569E695536EaA551".toLowerCase(), // talkchain epoch 6
  "0xdD4D5538F0d7C364272c927d39216A22de0B0482".toLowerCase(), // wang epoch 6
  "0x3Af0e0Cb6E87D67C2708debb77AE3F8ACD7493b5".toLowerCase(), // sparegas4lambro epoch 6
  "0x8521058b9a8c48346e02d263884b7E2Bd504deC8".toLowerCase(), // reetika epoch 6
];
export const WHITELISTED_REFEREE_MULTIPLIER = 0.1;
export const WHITELISTED_REFERRER_MULTIPLIER = 0.15;

export const getTotalEpochFeeRewardDistribution = (
  rewardConfig: RewardConfig,
  protocolPoints: EpochTradingPointsRecord,
  rewardToUsd: number
): number => {
  const epochTotalRewards = rewardConfig.totalRewards / rewardConfig.numEpochs;
  const activeRewardDistribution = getRewardDistributionForLocalEpoch(
    rewardConfig,
    getLocalEpochNumber(rewardConfig, protocolPoints.epochNumber)
  );
  const feeReward = epochTotalRewards * activeRewardDistribution.fee;
  if (!rewardConfig.capFeeRewards) {
    return feeReward;
  }

  const feeRewardInUsd = feeReward * rewardToUsd;

  if (feeRewardInUsd > protocolPoints.totalFeesPaid) {
    return protocolPoints.totalFeesPaid / rewardToUsd;
  }

  return feeReward;
};

export const getLocalEpochNumber = (
  rewardConfig: RewardConfig,
  epochNumber: number
): number => {
  return epochNumber - rewardConfig.startingEpoch;
};

export const TOTAL_CLOSED_TRADES_THRESHOLD_ABSOLUTE = 3;
export const TOTAL_CLOSED_DAYS_THRESHOLD_ABSOLUTE = 2;
export const TOTAL_CLOSED_TRADES_THRESHOLD_RELATIVE = 5;
export const TOTAL_CLOSED_DAYS_THRESHOLD_RELATIVE = 2;

export const getRewardDistributionForLocalEpoch = (
  rewardConfig: RewardConfig,
  localEpochNumber: number
): RewardDistributionP => {
  const rewardDistribution = rewardConfig.rewardDistribution;
  const override = rewardConfig.rewardDistributionOverrides?.find(
    override =>
      localEpochNumber >= override.startEpoch &&
      localEpochNumber <= override.endEpoch
  );
  return override ? override.rewardDistribution : rewardDistribution;
};
