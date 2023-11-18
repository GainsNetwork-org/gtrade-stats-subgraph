import {
  Query,
  QueryResolvers,
  QuerygetAddressRewardsForEpochArgs,
  getBuiltGraphSDK,
} from "./../../.graphclient/index.js";
import {
  convertPointsToRewardsForUser,
  generateId,
} from "../../helpers/rewards.js";
import { STATS_SUBGRAPH } from "../../helpers/config.js";

export const getAddressRewardsForEpoch: QueryResolvers["getAddressRewardsForEpoch"] =
  async (
    root,
    args: QuerygetAddressRewardsForEpochArgs,
    context
  ): Promise<Query["getAddressRewardsForEpoch"]> => {
    const { address, epoch, rewardConfigId } = args;
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

    if (epoch > rewardConfig.numEpochs + rewardConfig.startingEpoch) {
      throw new Error(
        `Epoch ${epoch} is outside the range of the reward config ${rewardConfigId}`
      );
    }

    const traderId = generateId(address, rewardConfig.epochType, epoch);
    const protocolId = generateId("protocol", rewardConfig.epochType, epoch);
    const addressAndProtocolPoints =
      await sdk.GetTraderAndProtocolPointsRecordsForEpoch(
        {
          traderId,
          protocolId,
        },
        { ...context, graphName: STATS_SUBGRAPH[+chainId] }
      );

    if (
      !addressAndProtocolPoints.protocol ||
      !addressAndProtocolPoints.trader
    ) {
      throw new Error(
        `No points found for trader ${address} and epoch ${epoch}`
      );
    }

    return convertPointsToRewardsForUser(
      addressAndProtocolPoints.trader,
      addressAndProtocolPoints.protocol,
      rewardConfig
    );
  };
