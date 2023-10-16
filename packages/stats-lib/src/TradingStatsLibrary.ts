import {
  EpochType,
  execute,
  GetEpochTradingPointsRecordQuery,
  GetEpochTradingStatsRecordQuery,
  GetEpochTradingStatsRecordsForEpochQuery,
  getBuiltGraphSDK,
  GetEpochTradingPointsRecordsForEpochQuery,
} from "@gainsnetwork/graph-client";
import { CHAIN_ID_TO_SUBGRAPH, generateId } from "./helpers";

type Context = {
  skip?: number;
  first?: number;
};

export class TradingStatsLibrary {
  private graphClient;
  private subgraph: string;
  constructor(chainId: number) {
    const subgraph = CHAIN_ID_TO_SUBGRAPH[chainId];
    if (subgraph === undefined) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }
    this.subgraph = subgraph;
    this.graphClient = getBuiltGraphSDK({ subgraphName: subgraph });
  }

  async _rawQuery(
    query: string,
    variables?: Record<string, any>
  ): Promise<any> {
    try {
      const result = await execute(query, variables, {
        config: {
          graphName: this.subgraph,
        },
      });
      return result?.data;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingStatsRecord(
    address: string,
    epochType: EpochType,
    epochNumber: number
  ): Promise<
    GetEpochTradingStatsRecordQuery["epochTradingStatsRecord"] | undefined
  > {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await this.graphClient.GetEpochTradingStatsRecord({
        id,
      });
      return result?.epochTradingStatsRecord;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingPointsRecord(
    address: string,
    epochType: EpochType,
    epochNumber: number
  ): Promise<
    GetEpochTradingPointsRecordQuery["epochTradingPointsRecord"] | undefined
  > {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await this.graphClient.GetEpochTradingPointsRecord({
        id,
      });
      return result?.epochTradingPointsRecord;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingStatsRecordsForEpoch(
    epochType: EpochType,
    epochNumber: number,
    context?: Context
  ): Promise<
    | GetEpochTradingStatsRecordsForEpochQuery["epochTradingStatsRecords"]
    | undefined
  > {
    try {
      const result = await this.graphClient.GetEpochTradingStatsRecordsForEpoch(
        {
          where: { epochType, epochNumber },
          skip: context?.skip || 0,
          first: context?.first || 1000,
        }
      );
      return result?.epochTradingStatsRecords;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingPointsRecordsForEpoch(
    epochType: EpochType,
    epochNumber: number,
    context?: Context
  ): Promise<
    | GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"]
    | undefined
  > {
    try {
      const result =
        await this.graphClient.GetEpochTradingPointsRecordsForEpoch({
          where: { epochType, epochNumber },
          skip: context?.skip || 0,
          first: context?.first || 1000,
        });
      return result?.epochTradingPointsRecords;
    } catch (e) {
      console.error(e);
    }
  }
}
