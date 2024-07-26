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
  numEpochs: 13,
  startingEpoch: 1,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.75,
    absSkill: 0.1,
    relSkill: 0.05,
    diversity: 0.0,
  },
  rewardDistributionOverrides: [
    {
      startEpoch: 7,
      endEpoch: 7,
      rewardDistribution: {
        loyalty: 0.1,
        fee: 0.775,
        absSkill: 0.125,
        relSkill: 0.0,
        diversity: 0.0,
      },
    },
    {
      startEpoch: 8,
      endEpoch: 9,
      rewardDistribution: {
        loyalty: 0.0,
        fee: 1,
        absSkill: 0.0,
        relSkill: 0.0,
        diversity: 0.0,
      },
    },
    {
      startEpoch: 10,
      endEpoch: 11,
      rewardDistribution: {
        loyalty: 0.1,
        fee: 0.5,
        absSkill: 0.4,
        relSkill: 0.0,
        diversity: 0.0,
      },
    },
    {
      startEpoch: 12,
      endEpoch: 12,
      rewardDistribution: {
        loyalty: 0.0,
        fee: 1,
        absSkill: 0.0,
        relSkill: 0.0,
        diversity: 0.0,
        total: 312305,
      },
    },
  ],
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const MUMBAI_STIP_REWARDS_TEST = {
  id: "mumbai-0-test",
  active: true,
  totalRewards: 3825000,
  epochType: "week" as EpochType,
  numEpochs: 15,
  startingEpoch: 0,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.75,
    absSkill: 0.1,
    relSkill: 0.05,
    diversity: 0.0,
  },
  rewardDistributionOverrides: [
    {
      startEpoch: 6,
      endEpoch: 7,
      rewardDistribution: {
        loyalty: 0.1,
        fee: 0.775,
        absSkill: 0.125,
        relSkill: 0.0,
        diversity: 0.0,
      },
    },
    {
      startEpoch: 8,
      endEpoch: 9,
      rewardDistribution: {
        loyalty: 0.0,
        fee: 1,
        absSkill: 0.0,
        relSkill: 0.0,
        diversity: 0.0,
      },
    },
    {
      startEpoch: 10,
      endEpoch: 12,
      rewardDistribution: {
        loyalty: 0.1,
        fee: 0.5,
        absSkill: 0.4,
        relSkill: 0.0,
        diversity: 0.0,
        total: 312305,
      },
    },
  ],
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const ARBITRUM_STIP_REWARDS_1 = {
  id: "arbitrum-stip-1",
  active: true,
  totalRewards: 1800000,
  epochType: "week" as EpochType,
  numEpochs: 11,
  startingEpoch: 27,
  rewardDistribution: {
    loyalty: 0.05,
    fee: 0.85,
    absSkill: 0.1,
    relSkill: 0.0,
    diversity: 0.0,
  },
  rewardDistributionOverrides: [
    {
      startEpoch: 4,
      endEpoch: 7,
      rewardDistribution: {
        loyalty: 0.0,
        fee: 1,
        absSkill: 0.0,
        relSkill: 0.0,
        diversity: 0.0,
      },
    },
  ],
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const getActiveRewardConfigs: QueryResolvers["getActiveRewardConfigs"] =
  (root, args, context): Query["getActiveRewardConfigs"] => {
    const { chainId } = context;
    if (+chainId === 42161) {
      return [ARBITRUM_STIP_REWARDS_1];
    }

    if (+chainId === 80001) {
      return [MUMBAI_STIP_REWARDS_TEST];
    }

    return [];
  };
