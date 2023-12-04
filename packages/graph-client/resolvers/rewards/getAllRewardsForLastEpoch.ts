import {
  Query,
  QueryResolvers,
  QuerygetAllRewardsForLastEpochArgs,
  getBuiltGraphSDK,
} from "./../../.graphclient/index.js";
import { determineEpochNumber } from "../../helpers/rewards.js";
import { STATS_SUBGRAPH } from "../../helpers/config.js";

export const getAllRewardsForLastEpoch: QueryResolvers["getAllRewardsForLastEpoch"] =
  async (
    root,
    args: QuerygetAllRewardsForLastEpochArgs,
    context
  ): Promise<Query["getAllRewardsForLastEpoch"]> => {
    const { rewardConfigId, rewardToUsd } = args;
    const { chainId } = context;
    const sdk = getBuiltGraphSDK();
    const rewardConfig = (
      await sdk.GetRewardConfig(
        { id: rewardConfigId },
        { ...context, graphName: STATS_SUBGRAPH[+chainId] }
      )
    ).getRewardConfig;

    if (!rewardConfig) {
      throw new Error(`Reward config ${rewardConfigId} not found`);
    }
    const currentEpoch = determineEpochNumber(
      Date.now() / 1000,
      rewardConfig.epochType
    );

    return (
      await sdk.GetAllRewardsForEpoch(
        {
          rewardConfigId,
          epoch: currentEpoch - 1,
          rewardToUsd,
        },
        { ...context, graphName: STATS_SUBGRAPH[+chainId] }
      )
    ).getAllRewardsForEpoch;
  };
