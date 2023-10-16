import { RewardsConfig } from "./RewardsLibrary";

export const ARBITRUM_STIP_REWARDS: RewardsConfig = {
  totalRewards: 4000000,
  epochType: "week",
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
