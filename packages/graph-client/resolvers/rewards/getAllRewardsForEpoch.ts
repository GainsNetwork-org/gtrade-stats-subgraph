import { GraphQLResolveInfo } from "graphql";
import {
  EpochTradingPointsRecord,
  Query,
  QueryResolvers,
  QuerygetAllRewardsForEpochArgs,
  getBuiltGraphSDK,
} from ".graphclient";
import {
  convertPointsToRewardsForUser,
  transformEpochTradingPointsRecord,
} from "helpers/rewards";

export const getAllRewardsForEpoch: QueryResolvers["getAllRewardsForEpoch"] =
  async (
    root,
    args: QuerygetAllRewardsForEpochArgs,
    context,
    info: GraphQLResolveInfo
  ): Promise<Query["getAllRewardsForEpoch"]> => {
    const { rewardConfigId, epoch, skip, first } = args;
    const sdk = getBuiltGraphSDK();
    const rewardConfig = (await sdk.GetRewardConfig({ id: rewardConfigId }))
      .getRewardConfig;

    if (!rewardConfig) {
      throw new Error(`Reward config ${rewardConfigId} not found`);
    }

    if (epoch > rewardConfig.numEpochs + rewardConfig.startingEpoch) {
      throw new Error(
        `Epoch ${epoch} is outside the range of the reward config ${rewardConfigId}`
      );
    }

    const _epochTradingPoints = (
      await sdk.GetEpochTradingPointsRecordsForEpoch({
        skip: skip || 0,
        first: first || 1000,
        where: {
          epochType: rewardConfig.epochType,
          epochNumber: epoch,
        },
      })
    ).epochTradingPointsRecords;

    if (!_epochTradingPoints) {
      throw new Error(`No points found for epoch ${epoch}`);
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
        `No protocol epoch trading points record found for epoch ${epoch}.`
      );
    }
    const protocolTradingPoints = epochTradingPoints[ix];
    epochTradingPoints.splice(ix, 1);

    return epochTradingPoints.map(userPoints =>
      convertPointsToRewardsForUser(
        userPoints,
        protocolTradingPoints,
        rewardConfig
      )
    );
  };
