import {
  EpochTradingPointsRecord,
  EpochType,
  RewardConfig,
  RewardResults,
  Collateral,
} from "../.graphclient";
import { EpochTradingPoints, LoyaltyTier } from "../types/rewards";

export const convertPointShareToRewards = (
  points: number,
  totalPoints: number,
  totalReward: number
) => (points / totalPoints) * totalReward;

export const generateId = (
  address: string,
  epochType: EpochType,
  epochNumber: number
): string => {
  return `${address}-${epochType}-${epochNumber}`;
};

// @note This must be kept in sync with the subgraph
export const EPOCH_ZERO = {
  DAY: 1701993600, // Dec 8
  WEEK: 1701993600, // Dec 8
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
  };

  const epochTotalRewards = rewards.totalRewards / rewards.numEpochs;
  rewardResults.loyalty = convertPointShareToRewards(
    userPoints.loyaltyPoints,
    protocolPoints.loyaltyPoints,
    rewards.rewardDistribution.loyalty * epochTotalRewards
  );

  rewardResults.fee = convertPointShareToRewards(
    userPoints.feePoints,
    protocolPoints.feePoints,
    rewards.rewardDistribution.fee * epochTotalRewards
  );

  rewardResults.absSkill = convertPointShareToRewards(
    userPoints.absSkillPoints,
    protocolPoints.absSkillPoints,
    rewards.rewardDistribution.absSkill * epochTotalRewards
  );

  rewardResults.relSkill = convertPointShareToRewards(
    userPoints.relSkillPoints,
    protocolPoints.relSkillPoints,
    rewards.rewardDistribution.relSkill * epochTotalRewards
  );

  rewardResults.diversity = convertPointShareToRewards(
    userPoints.diversityPoints,
    protocolPoints.diversityPoints,
    rewards.rewardDistribution.diversity * epochTotalRewards
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
];
export const WHITELISTED_REFEREE_MULTIPLIER = 0.1;
export const WHITELISTED_REFERRER_MULTIPLIER = 0.15;

export const getTotalEpochFeeRewardDistribution = (
  rewardConfig: RewardConfig,
  protocolPoints: EpochTradingPointsRecord,
  rewardToUsd: number
): number => {
  const epochTotalRewards = rewardConfig.totalRewards / rewardConfig.numEpochs;
  const feeReward = epochTotalRewards * rewardConfig.rewardDistribution.fee;
  if (!rewardConfig.capFeeRewards) {
    return feeReward;
  }

  const feeRewardInUsd = feeReward * rewardToUsd;

  if (feeRewardInUsd > protocolPoints.totalFeesPaid) {
    return protocolPoints.totalFeesPaid / rewardToUsd;
  }

  return feeReward;
};
