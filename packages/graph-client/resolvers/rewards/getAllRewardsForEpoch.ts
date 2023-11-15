import { GraphQLResolveInfo } from "graphql";
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
  convertPointsToRewardsForUser,
  transformEpochTradingPointsRecord,
} from "../../helpers/rewards.js";

export const getAllRewardsForEpoch: QueryResolvers["getAllRewardsForEpoch"] =
  async (
    root,
    args: QuerygetAllRewardsForEpochArgs,
    context,
    info: GraphQLResolveInfo
  ): Promise<Query["getAllRewardsForEpoch"]> => {
    const { rewardConfigId, epoch } = args;
    const sdk = getBuiltGraphSDK();
    const rewardConfig = (await sdk.GetRewardConfig({ id: rewardConfigId }))
      .getRewardConfig;

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
      rewardConfig
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
  lastId: string | null
): Promise<
  GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"]
> => {
  const whereClause = {
    epochType: rewardConfig.epochType,
    epochNumber: epoch,
  };

  if (lastId) {
    whereClause["id_gt"] = lastId;
  }

  const response = await sdk.GetEpochTradingPointsRecordsForEpoch({
    first: 1000,
    where: whereClause,
    orderBy: "id",
    orderDirection: "asc",
  });

  return response.epochTradingPointsRecords;
};

const getEpochTradingPoints = async (
  sdk: ReturnType<typeof getBuiltGraphSDK>,
  epoch: number,
  rewardConfig: RewardConfig
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
      lastId
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
