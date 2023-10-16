import { EpochType } from "@gainsnetwork/graph-client";

export type RewardDistributionP = {
  loyalty: number;
  volume: number;
  absSkill: number;
  relSkill: number;
  diversity: number;
};

export type RewardsConfig = {
  totalRewards: number;
  epochType: EpochType;
  numEpochs: number;
  startingEpoch: number;
  rewardDistribution: RewardDistributionP;
};

export type RewardResults = {
  address: string;
  total: number;
  loyalty: number;
  volume: number;
  absSkill: number;
  relSkill: number;
  diversity: number;
};

export type EpochTradingPoints = {
  epochType: EpochType;
  epochNumber: number;
  address: string;
  loyaltyPoints: number;
  volumePoints: number;
  absSkillPoints: number;
  relSkillPoints: number;
  diversityPoints: number;
};
