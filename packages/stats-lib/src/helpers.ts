import { EpochType } from "@gainsnetwork/graph-client";
import { EpochTradingPoints, RewardResults, RewardsConfig } from "./types";

export const CHAIN_ID_TO_SUBGRAPH: { [chainId: number]: string } = {
  137: "gtrade-stats-polygon",
  80001: "gtrade-stats-mumbai",
  42161: "gtrade-stats-arbitrum",
};

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
  rewards: RewardsConfig
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

export const convertPointShareToRewards = (
  points: number,
  totalPoints: number,
  totalReward: number
) => (points / totalPoints) * totalReward;
