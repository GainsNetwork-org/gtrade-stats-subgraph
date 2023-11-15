import {
  Query,
  QueryResolvers,
  QuerygetAllRewardsForLastEpochArgs,
  getBuiltGraphSDK,
} from "./../../.graphclient/index.js";
import { determineEpochNumber } from "../../helpers/rewards.js";

export const getAllRewardsForLastEpoch: QueryResolvers["getAllRewardsForLastEpoch"] =
  async (
    root,
    args: QuerygetAllRewardsForLastEpochArgs
  ): Promise<Query["getAllRewardsForLastEpoch"]> => {
    const { rewardConfigId } = args;
    const sdk = getBuiltGraphSDK();
    const rewardConfig = (await sdk.GetRewardConfig({ id: rewardConfigId }))
      .getRewardConfig;

    if (!rewardConfig) {
      throw new Error(`Reward config ${rewardConfigId} not found`);
    }
    const currentEpoch = determineEpochNumber(
      Date.now() / 1000,
      rewardConfig.epochType
    );

    return (
      await sdk.GetAllRewardsForEpoch({
        rewardConfigId,
        epoch: currentEpoch - 1,
      })
    ).getAllRewardsForEpoch;
  };
