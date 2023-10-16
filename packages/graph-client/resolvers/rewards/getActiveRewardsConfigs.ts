import { Query, QueryResolvers, EpochType } from "../../.graphclient";

export const ARBITRUM_STIP_REWARDS = {
  id: "arbitrum-stip-0",
  active: true,
  totalRewards: 4000000,
  epochType: "week" as EpochType,
  numEpochs: 14,
  startingEpoch: 0,
  rewardDistribution: {
    loyalty: 0.1,
    volume: 0.7,
    absSkill: 0.1,
    relSkill: 0.05,
    diversity: 0.05,
  },
};

export const getActiveRewardsConfigs: QueryResolvers["getActiveRewardsConfigs"] =
  (): Query["getActiveRewardsConfigs"] => {
    return [ARBITRUM_STIP_REWARDS];
  };
