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
  startingEpoch: 1,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.75,
    absSkill: 0.1,
    relSkill: 0.05,
    diversity: 0.0,
  },
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const MUMBAI_STIP_REWARDS_TEST = {
  id: "mumbai-0-test",
  active: true,
  totalRewards: 3825000,
  epochType: "day" as EpochType,
  numEpochs: 6,
  startingEpoch: 17,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.75,
    absSkill: 0.1,
    relSkill: 0.05,
    diversity: 0.0,
  },
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const getActiveRewardConfigs: QueryResolvers["getActiveRewardConfigs"] =
  (root, args, context): Query["getActiveRewardConfigs"] => {
    const { chainId } = context;
    if (+chainId === 42161) {
      return [ARBITRUM_STIP_REWARDS];
    }

    if (+chainId === 80001) {
      return [MUMBAI_STIP_REWARDS_TEST];
    }

    return [];
  };
