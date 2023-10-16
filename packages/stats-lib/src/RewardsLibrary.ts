import { EpochTradingPointsRecord } from "@gainsnetwork/graph-client";
import { TradingStatsLibrary } from "./TradingStatsLibrary";
import {
  EpochTradingPoints,
  transformEpochTradingPointsRecord,
} from "./transforms";
import { RewardResults, RewardsConfig } from "./types";

export class RewardsLibrary {
  private config: RewardsConfig;
  private statsLibrary: TradingStatsLibrary;

  constructor(config: RewardsConfig, statsLibrary: TradingStatsLibrary) {
    RewardsLibrary.validateConfig(config);

    this.config = config;
    this.statsLibrary = statsLibrary;
  }

  async getUserRewardsForEpoch(
    address: string,
    epochNumber: number
  ): Promise<RewardResults> {
    const { epochType, numEpochs, startingEpoch } = this.config;
    if (epochNumber > startingEpoch + numEpochs) {
      throw new Error(
        `Epoch number ${epochNumber} is greater than the number of epochs in the rewards config.`
      );
    }

    const epochTradingPoints = transformEpochTradingPointsRecord(
      (await this.statsLibrary.getEpochTradingPointsRecord(
        address,
        epochType,
        epochNumber
      )) as EpochTradingPointsRecord
    );

    const protocolTradingPoints = transformEpochTradingPointsRecord(
      (await this.statsLibrary.getEpochTradingPointsRecord(
        "protocol",
        epochType,
        epochNumber
      )) as EpochTradingPointsRecord
    );

    return convertPointsToRewardsForUser(
      epochTradingPoints,
      protocolTradingPoints,
      this.config
    );
  }

  async getAllRewardsForEpoch(epochNumber: number): Promise<any[]> {
    const { epochType, numEpochs, startingEpoch } = this.config;
    if (epochNumber > startingEpoch + numEpochs) {
      throw new Error(
        `Epoch number ${epochNumber} is greater than the number of epochs in the rewards config.`
      );
    }

    const _epochTradingPoints =
      await this.statsLibrary.getEpochTradingPointsRecordsForEpoch(
        epochType,
        epochNumber
      );

    if (_epochTradingPoints === undefined) {
      throw new Error(
        `No epoch trading points records found for epoch ${epochNumber}.`
      );
    }

    const epochTradingPoints = _epochTradingPoints.map(record =>
      transformEpochTradingPointsRecord(record as EpochTradingPointsRecord)
    );

    // Find protocol points and remove from array
    const ix = epochTradingPoints.findIndex(
      points => points.address === "protocol"
    );
    if (ix === -1) {
      throw new Error(
        `No protocol epoch trading points record found for epoch ${epochNumber}.`
      );
    }
    const protocolTradingPoints = epochTradingPoints[ix];
    epochTradingPoints.splice(ix, 1);

    return epochTradingPoints.map(userPoints =>
      convertPointsToRewardsForUser(
        userPoints,
        protocolTradingPoints,
        this.config
      )
    );
  }

  static validateConfig(config: RewardsConfig) {
    const { rewardDistribution } = config;
    const total = Object.values(rewardDistribution).reduce(
      (acc, curr) => acc + curr,
      0
    );
    if (total !== 1) {
      throw new Error(
        `Reward distribution must total 1, but got ${total} instead.`
      );
    }
  }
}

const convertPointsToRewardsForUser = (
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

const convertPointShareToRewards = (
  points: number,
  totalPoints: number,
  totalReward: number
) => (points / totalPoints) * totalReward;
