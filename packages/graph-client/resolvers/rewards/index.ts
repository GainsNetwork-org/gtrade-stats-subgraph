import { Resolvers } from "../../.graphclient/index.js";
import { getActiveRewardConfigs } from "./getActiveRewardConfigs";
import { getRewardConfig } from "./getRewardConfig";
import { getAddressRewardsForEpoch } from "./getAddressRewardsForEpoch";
import { getAllRewardsForEpoch } from "./getAllRewardsForEpoch";
import { getAllRewardsForLastEpoch } from "./getAllRewardsForLastEpoch";

export const resolvers: Resolvers = {
  Query: {
    getActiveRewardConfigs,
    getRewardConfig,
    getAddressRewardsForEpoch,
    getAllRewardsForEpoch,
    getAllRewardsForLastEpoch,
  },
};
