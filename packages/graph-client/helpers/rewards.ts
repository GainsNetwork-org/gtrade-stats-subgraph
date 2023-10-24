import {
  EpochTradingPointsRecord,
  EpochType,
  RewardConfig,
  RewardResults,
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
  DAY: 1696118400, // Oct 1 (time of contract deploy)
  WEEK: 1696118400, // Oct 1 (start of week)
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
    volume: 0,
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

  rewardResults.volume = convertPointShareToRewards(
    userPoints.volumePoints,
    protocolPoints.volumePoints,
    rewards.rewardDistribution.volume * epochTotalRewards
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
    rewardResults.volume +
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
  volumePoints: Number(record.volumePoints),
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

export const getLoyaltyTier = (points: number): number => {
  for (const tier of loyaltyTiers) {
    if (points >= tier.lowerBound && points < tier.upperBound) {
      return tier.returnValue;
    }
  }
  return 0;
};

export const getPointsFromNextTier = (points: number): number => {
  for (const tier of loyaltyTiers) {
    if (points >= tier.lowerBound && points < tier.upperBound) {
      return tier.upperBound - points;
    }
  }
  return 0;
};
