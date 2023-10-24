import { GraphQLResolveInfo } from "graphql";
import {
  Query,
  QueryResolvers,
  QuerygetRewardConfigArgs,
} from "./../../.graphclient/index.js";
import { ARBITRUM_STIP_REWARDS } from "./getActiveRewardConfigs";

// @ts-ignore
export const getRewardConfig: QueryResolvers["getRewardConfig"] = async (
  root,
  args: QuerygetRewardConfigArgs,
  context,
  info: GraphQLResolveInfo
): Promise<Query["getRewardConfig"]> => {
  const { id } = args;
  if (id === ARBITRUM_STIP_REWARDS.id) {
    return ARBITRUM_STIP_REWARDS;
  }
};