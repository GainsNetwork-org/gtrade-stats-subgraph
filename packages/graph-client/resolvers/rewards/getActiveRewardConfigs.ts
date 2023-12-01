import {
  Query,
  QueryResolvers,
  EpochType,
} from "./../../.graphclient/index.js";

export const ARBITRUM_STIP_REWARDS = {
  id: "arbitrum-stip-0",
  active: true,
  totalRewards: 3825000,
  epochType: "week" as EpochType,
  numEpochs: 15,
  startingEpoch: 0,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.7,
    absSkill: 0.15,
    relSkill: 0.05,
    diversity: 0.0,
  },
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const getActiveRewardConfigs: QueryResolvers["getActiveRewardConfigs"] =
  (): Query["getActiveRewardConfigs"] => {
    return [ARBITRUM_STIP_REWARDS];
  };
