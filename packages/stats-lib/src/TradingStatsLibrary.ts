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
    epochNumber: number
  ): Promise<
    | GetEpochTradingStatsRecordsForEpochQuery["epochTradingStatsRecords"]
    | undefined
  > {
    try {
      const result = await this.graphClient.GetEpochTradingStatsRecordsForEpoch(
        {
          epochType,
          epochNumber,
        }
      );
      return result?.epochTradingStatsRecords as GetEpochTradingStatsRecordsForEpochQuery["epochTradingStatsRecords"];
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingPointsRecordsForEpoch(
    epochType: EpochType,
    epochNumber: number
  ): Promise<
    | GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"]
    | undefined
  > {
    try {
      const result =
        await this.graphClient.GetEpochTradingPointsRecordsForEpoch({
          epochType,
          epochNumber,
        });
      return result?.epochTradingPointsRecords as GetEpochTradingPointsRecordsForEpochQuery["epochTradingPointsRecords"];
    } catch (e) {
      console.error(e);
    }
  }
}
