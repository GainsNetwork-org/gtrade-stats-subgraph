import { Context } from "@cryptostats/sdk";
export const name = "Gains Network";
export const version = "0.0.1";
export const license = "MIT";

export const EPOCH_ZERO = {
  DAY: 1696118400, // Oct 1 (time of contract deploy)
  WEEK: 1696118400, // Oct 1 (start of week)
};

export const EPOCH_TYPE = {
  DAY: "day",
  WEEK: "week",
};

export const getEpochZero = (epochType: string): number => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_ZERO.DAY;
  } else {
    return EPOCH_ZERO.WEEK;
  }
};

// Establish epoch duration for day, week
export const EPOCH_DURATION = {
  DAY: 86400,
  WEEK: 604800,
};

export const getEpochDuration = (epochType: string): number => {
  if (epochType == EPOCH_TYPE.DAY) {
    return EPOCH_DURATION.DAY;
  } else {
    return EPOCH_DURATION.WEEK;
  }
};

export const determineEpochNumber = (
  timestampSecs: number,
  epochType: string
): number => {
  const epochZero = getEpochZero(epochType);
  const epochDuration = getEpochDuration(epochType);
  const epochNumber = (timestampSecs - epochZero) / epochDuration;
  return Math.floor(epochNumber);
};

export function setup(sdk: Context) {
  const getFeeData =
    (subgraph: string) =>
    async (date: string): Promise<number> => {
      const todayEpoch = determineEpochNumber(
        sdk.date.dateToTimestamp(date),
        EPOCH_TYPE.DAY
      );
      const tomorrowEpoch = todayEpoch + 1;
      const todayEpochId = `protocol-${EPOCH_TYPE.DAY}-${todayEpoch}`;
      const tomorrowEpochId = `protocol-${EPOCH_TYPE.DAY}-${tomorrowEpoch}`;

      const query = `query dailyTradingStatsRecord($todayEpochId: ID!, $tomorrowEpochId: ID!){
      today: epochTradingStatsRecord(id: $tomorrowEpochId) {
        totalLpFees
        totalGovFees
        totalStakerFees
        totalTriggerFees
        totalReferralFees
        totalBorrowingFees
      }
      tomorrow: epochTradingStatsRecord(id: $tomorrowEpochId) {
        id
      }
    }`;

      const data = await sdk.graph.query(subgraph, query, {
        todayEpochId,
        tomorrowEpochId,
      });

      if (!data.tomorrow) {
        throw new Error("Day still in progress");
      }

      return (
        parseFloat(data.today.totalLpFees) +
        parseFloat(data.today.totalGovFees) +
        parseFloat(data.today.totalStakerFees) +
        parseFloat(data.today.totalTriggerFees) +
        parseFloat(data.today.totalReferralFees) +
        parseFloat(data.today.totalBorrowingFees)
      );
    };

  const getVolumeData =
    (subgraph: string) =>
    async (date: string): Promise<number> => {
      const todayEpoch = determineEpochNumber(
        sdk.date.dateToTimestamp(date),
        EPOCH_TYPE.DAY
      );
      const tomorrowEpoch = todayEpoch + 1;
      const todayEpochId = `protocol-${EPOCH_TYPE.DAY}-${todayEpoch}`;
      const tomorrowEpochId = `protocol-${EPOCH_TYPE.DAY}-${tomorrowEpoch}`;

      const query = `query dailyTradingStatsRecord($todayEpochId: ID!, $tomorrowEpochId: ID!){
      today: epochTradingStatsRecord(id: $tomorrowEpochId) {
        totalVolumePerGroup
      }
      tomorrow: epochTradingStatsRecord(id: $tomorrowEpochId) {
        id
      }
    }`;

      const data = await sdk.graph.query(subgraph, query, {
        todayEpochId,
        tomorrowEpochId,
      });

      if (!data.tomorrow) {
        throw new Error("Day still in progress");
      }

      return data.today.totalVolumePerGroup.reduce(
        (acc: number, cur: string) => acc + parseFloat(cur),
        0
      );
    };

  const metadata = {
    name: "Gains Network",
    icon: sdk.ipfs.getDataURILoader(
      "Qmc7JC1js97jrP63AfrDFyCrKciRVR6wFY3WkzhhHofkAa",
      "image/svg+xml"
    ),
    category: "Perpetuals",
    description:
      "Gains Network is a liquidity-efficient and user-friendly decentralized leveraged trading protocol.",
    feeDescription:
      "Fees are paid by traders to network participants, including liquidity providers and stakers.",
    source: "The Graph Protocol",
    website: "https://gains.trade",
    tokenTicker: "GNS",
    tokenCoingecko: "gains-network",
  };

  sdk.register({
    id: "gns-arbitrum",
    bundle: "gns",
    queries: {
      oneDayTotalFees: getFeeData("gainsnetwork-org/gtrade-stats-arbitrum"),
      oneDayTotalVolumeUSD: getVolumeData(
        "gainsnetwork-org/gtrade-stats-arbitrum"
      ),
    },
    metadata: {
      ...metadata,
      subtitle: "Arbitrum",
      blockchain: "Arbitrum One",
      protocolLaunch: "2023-01-01",
    },
  });

  sdk.register({
    id: "gns-polygon",
    bundle: "gns",
    queries: {
      oneDayTotalFees: getFeeData("gainsnetwork-org/gtrade-stats-polygon"),
      oneDayTotalVolumeUSD: getVolumeData(
        "gainsnetwork-org/gtrade-stats-polygon"
      ),
    },
    metadata: {
      ...metadata,
      subtitle: "Polygon",
      blockchain: "Polygon",
      protocolLaunch: "2021-05-01",
    },
  });
}
