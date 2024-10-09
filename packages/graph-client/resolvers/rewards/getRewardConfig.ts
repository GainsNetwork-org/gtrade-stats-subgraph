import { GraphQLResolveInfo } from "graphql";
import {
  Query,
  QueryResolvers,
  QuerygetRewardConfigArgs,
} from "./../../.graphclient/index.js";
import {
  ARBITRUM_STIP_REWARDS,
  MUMBAI_STIP_REWARDS_TEST,
  ARBITRUM_STIP_REWARDS_1,
  BASE_STIP_REWARDS_0,
} from "./getActiveRewardConfigs";

// @ts-ignore
export const getRewardConfig: QueryResolvers["getRewardConfig"] = (
  root,
  args: QuerygetRewardConfigArgs,
  context,
  info: GraphQLResolveInfo
): Query["getRewardConfig"] => {
  const { id } = args;
  if (id === ARBITRUM_STIP_REWARDS.id) {
    return ARBITRUM_STIP_REWARDS;
  }
  if (id === MUMBAI_STIP_REWARDS_TEST.id) {
    return MUMBAI_STIP_REWARDS_TEST;
  }
  if (id === ARBITRUM_STIP_REWARDS_1.id) {
    return ARBITRUM_STIP_REWARDS_1;
  }
  if (id === BASE_STIP_REWARDS_0.id) {
    return BASE_STIP_REWARDS_0;
  }
};
