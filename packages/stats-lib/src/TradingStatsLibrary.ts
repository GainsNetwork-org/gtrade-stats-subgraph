import {
  EpochType,
  execute,
  GetEpochTradingPointsRecordQuery,
  GetEpochTradingStatsRecordQuery,
  GetEpochTradingStatsRecordsForEpochQuery,
  getBuiltGraphSDK,
  GetEpochTradingPointsRecordsForEpochQuery,
} from "../.graphclient";
import { CHAIN_ID_TO_SUBGRAPH, generateId } from "./helpers";

type Context = {
  skip?: number;
  first?: number;
};

export class TradingStatsLibrary {
  private graphClient: typeof getBuiltGraphSDK;
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
      return result?.epochTradingStatsRecord as GetEpochTradingStatsRecordQuery["epochTradingStatsRecord"];
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
      return result?.epochTradingPointsRecord as GetEpochTradingPointsRecordQuery["epochTradingPointsRecord"];
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
          epochType,
          epochNumber,
          skip: context?.skip || 0,
          first: context?.first || 1000,
        }
      );
      return result?.epochTradingStatsRecords as GetEpochTradingStatsRecordsForEpochQuery["epochTradingStatsRecords"];
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
          epochType,
          epochNumber,
          skip: context?.skip || 0,
          first: context?.first || 1000,
        });
      return result?.epochTradingPointsRecords as GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"];
    } catch (e) {
      console.error(e);
    }
  }
}
