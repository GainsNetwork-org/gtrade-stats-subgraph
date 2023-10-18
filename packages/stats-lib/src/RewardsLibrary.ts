import { EpochTradingPointsRecord } from "@gainsnetwork/graph-client";
import { TradingStatsLibrary } from "./TradingStatsLibrary";
import { transformEpochTradingPointsRecord } from "./transforms";
import { RewardResults, RewardConfig } from "./types";
import { convertPointsToRewardsForUser, determineEpochNumber } from "./helpers";

export class RewardsLibrary {
  private config: RewardConfig;
  private statsLibrary: TradingStatsLibrary;

  constructor(config: RewardConfig, statsLibrary: TradingStatsLibrary) {
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

  async getAllRewardsForEpoch(epochNumber: number): Promise<RewardResults[]> {
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

  static validateConfig(config: RewardConfig) {
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

  async getAllRewardsForLastEpoch() {
    const currentEpoch = determineEpochNumber(
      Date.now() / 1000,
      this.config.epochType
    );
    return this.getAllRewardsForEpoch(currentEpoch - 1);
  }
}
