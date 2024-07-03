import {
  EpochTradingPointsRecord,
  GetEpochTradingPointsRecordsForEpochQuery,
  Query,
  QueryResolvers,
  QuerygetAllRewardsForEpochArgs,
  RewardConfig,
  getBuiltGraphSDK,
} from "./../../.graphclient/index.js";
import {
  COLLATERALS,
  convertPointsToRewardsForUser,
  getLocalEpochNumber,
  getRewardDistributionForLocalEpoch,
  transformEpochTradingPointsRecord,
} from "../../helpers/rewards.js";
import { STATS_SUBGRAPH } from "../../helpers/config.js";

export const getAllRewardsForEpoch: QueryResolvers["getAllRewardsForEpoch"] =
  async (
    root,
    args: QuerygetAllRewardsForEpochArgs,
    context
  ): Promise<Query["getAllRewardsForEpoch"]> => {
    const { rewardConfigId, epoch, rewardToUsd } = args;
    const { chainId } = context;
    const sdk = getBuiltGraphSDK();
    const rewardConfig = (
      await sdk.GetRewardConfig(
        { id: rewardConfigId },
        { ...context, graphName: STATS_SUBGRAPH[+chainId] }
      )
    ).getRewardConfig;

    if (!rewardConfig) {
      throw new Error(`Reward config ${rewardConfigId} not found`);
    }

    if (epoch > rewardConfig.numEpochs + rewardConfig.startingEpoch) {
      throw new Error(
        `Epoch ${epoch} is outside the range of the reward config ${rewardConfigId}`
      );
    }

    const _epochTradingPoints = await getEpochTradingPoints(
      sdk,
      epoch,
      rewardConfig,
      context
    );

    if (!_epochTradingPoints) {
      throw new Error(`No points found for epoch ${epoch}`);
    }

    const epochTradingPoints = _epochTradingPoints.map(record =>
      transformEpochTradingPointsRecord(record as EpochTradingPointsRecord)
    );

    // Find protocol points and remove from array
    const ix = epochTradingPoints.findIndex(
      points => points.address === "protocol"
    );
    if (ix === -1) {
      throw new Error(
        `No protocol epoch trading points record found for epoch ${epoch}.`
      );
    }
    const protocolTradingPoints = epochTradingPoints[ix];
    epochTradingPoints.splice(ix, 1);

    // Cap fee rewards if necessary
    if (rewardConfig.capFeeRewards) {
      if (rewardToUsd) {
        const currentEpochRewardDistribution =
          getRewardDistributionForLocalEpoch(
            rewardConfig,
            getLocalEpochNumber(rewardConfig, epoch)
          );
        const rewardsInUsd =
          currentEpochRewardDistribution.fee *
          (currentEpochRewardDistribution.total ||
            rewardConfig.totalRewards / rewardConfig.numEpochs) *
          rewardToUsd;
        const protocolFees = protocolTradingPoints.totalFeesPaid;
        if (rewardsInUsd > protocolFees * 0.75) {
          currentEpochRewardDistribution.fee *=
            (protocolFees * 0.75) / rewardsInUsd;
        }
      } else {
        console.warn(
          "No rewardToUsd provided, so not capping fee rewards. This may result in incorrect rewards."
        );
      }
    }

    return epochTradingPoints.map(userPoints =>
      convertPointsToRewardsForUser(
        userPoints,
        protocolTradingPoints,
        rewardConfig
      )
    );
  };

const fetchEpochTradingPointsRecords = async (
  sdk: ReturnType<typeof getBuiltGraphSDK>,
  epoch: number,
  rewardConfig: RewardConfig,
  lastId: string | null,
  context
): Promise<
  GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"]
> => {
  const { chainId } = context;
  const whereClause = {
    epochType: rewardConfig.epochType,
    epochNumber: epoch,
    collateral: COLLATERALS._ALL_, // @todo this is hardcoded for now - need to support further configs later
  };

  if (lastId) {
    whereClause["id_gt"] = lastId;
  }

  const response = await sdk.GetEpochTradingPointsRecordsForEpoch(
    {
      first: 1000,
      where: whereClause,
      orderBy: "id",
      orderDirection: "asc",
    },
    { ...context, graphName: STATS_SUBGRAPH[+chainId] }
  );

  return response.epochTradingPointsRecords;
};

const getEpochTradingPoints = async (
  sdk: ReturnType<typeof getBuiltGraphSDK>,
  epoch: number,
  rewardConfig: RewardConfig,
  context
) => {
  let lastId: string | null = null;
  let hasMore = true;
  const epochTradingPoints: GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"] =
    [];

  while (hasMore) {
    const records = await fetchEpochTradingPointsRecords(
      sdk,
      epoch,
      rewardConfig,
      lastId,
      context
    );
    epochTradingPoints.push(...records);

    if (records.length < 1000) {
      hasMore = false;
    } else {
      lastId = records[records.length - 1].id;
    }
  }

  return epochTradingPoints;
};
