import {
  Query,
  QueryResolvers,
  EpochType,
} from "./../../.graphclient/index.js";

export const ARBITRUM_STIP_REWARDS = {
  id: "arbitrum-stip-0",
  active: false,
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
  active: false,
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
  active: false,
  totalRewards: 1800000,
  epochType: "week" as EpochType,
  numEpochs: 12,
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
      startEpoch: 0,
      endEpoch: 3,
      rewardDistribution: {
        loyalty: 0.05,
        fee: 0.85,
        absSkill: 0.1,
        relSkill: 0.0,
        diversity: 0.0,
        total: 1800000 / 11,
      },
    },
    {
      startEpoch: 4,
      endEpoch: 9,
      rewardDistribution: {
        loyalty: 0.0,
        fee: 1,
        absSkill: 0.0,
        relSkill: 0.0,
        diversity: 0.0,
        total: 1800000 / 11,
      },
    },
    {
      startEpoch: 10,
      endEpoch: 11,
      rewardDistribution: {
        loyalty: 0.1,
        fee: 0.7,
        absSkill: 0.2,
        relSkill: 0.0,
        diversity: 0.0,
        total: 1800000 / 11 / 2,
      },
    },
  ],
  rewardsPairIx: 109,
  capFeeRewards: true,
};

export const BASE_GNS_REWARDS_0 = {
  id: "base-gns-0",
  active: false,
  totalRewards: 20000,
  epochType: "week" as EpochType,
  numEpochs: 4,
  startingEpoch: 42,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.55,
    absSkill: 0.35,
    relSkill: 0.0,
    diversity: 0.0,
  },
  rewardDistributionOverrides: [],
  rewardsPairIx: -1, // GNS
  capFeeRewards: true,
};

export const APECHAIN_APE_REWARDS_0 = {
  id: "apechain-ape-0",
  active: true,
  totalRewards: 90909,
  epochType: "week" as EpochType,
  numEpochs: 4,
  startingEpoch: 48,
  rewardDistribution: {
    loyalty: 0.1,
    fee: 0.2,
    absSkill: 0.7,
    relSkill: 0.0,
    diversity: 0.0,
  },
  rewardDistributionOverrides: [],
  rewardsPairIx: 55, // APE
  capFeeRewards: true,
};

export const getActiveRewardConfigs: QueryResolvers["getActiveRewardConfigs"] =
  (root, args, context): Query["getActiveRewardConfigs"] => {
    const { chainId } = context;
    if (+chainId === 42161) {
      return [];
    }

    if (+chainId === 80001) {
      return [];
    }

    if (+chainId === 8453) {
      return [];
    }

    if (+chainId === 33139) {
      return [APECHAIN_APE_REWARDS_0];
    }

    return [];
  };
