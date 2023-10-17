import { Resolvers } from ".graphclient";
import { getActiveRewardConfigs } from "./getActiveRewardConfigs";
import { getRewardConfig } from "./getRewardConfig";
import { getAddressRewardsForEpoch } from "./getAddressRewardsForEpoch";
import { getAllRewardsForEpoch } from "./getAllRewardsForEpoch";

export const resolvers: Resolvers = {
  Query: {
    getActiveRewardConfigs,
    getRewardConfig,
    getAddressRewardsForEpoch,
    getAllRewardsForEpoch,
  },
};
