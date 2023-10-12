import {
  EpochType,
  execute,
  GetEpochTradingPointsRecordDocument,
  GetEpochTradingPointsRecordQuery,
  GetEpochTradingPointsRecordsForEpochDocument,
  GetEpochTradingStatsRecordDocument,
  GetEpochTradingStatsRecordQuery,
  GetEpochTradingStatsRecordsForEpochDocument,
} from "../.graphclient";
import { CHAIN_ID_TO_SUBGRAPH, generateId } from "./helpers";

export class TradingStatsLibrary {
  private subgraph: string;
  constructor(chainId: number) {
    const subgraph = CHAIN_ID_TO_SUBGRAPH[chainId];
    if (subgraph === undefined) {
      throw new Error(`Unsupported chainId: ${chainId}`);
    }
    this.subgraph = subgraph;
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
  ): Promise<GetEpochTradingStatsRecordQuery | undefined> {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await execute(
        GetEpochTradingStatsRecordDocument,
        {
          id,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data
        ?.epochTradingStatsRecord as GetEpochTradingStatsRecordQuery;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingPointsRecord(
    address: string,
    epochType: EpochType,
    epochNumber: number
  ): Promise<GetEpochTradingPointsRecordQuery | undefined> {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await execute(
        GetEpochTradingPointsRecordDocument,
        {
          id,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data
        ?.epochTradingPointsRecord as GetEpochTradingPointsRecordQuery;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingStatsRecordsForEpoch(
    epochType: EpochType,
    epochNumber: number
  ): Promise<GetEpochTradingStatsRecordQuery[] | undefined> {
    try {
      const result = await execute(
        GetEpochTradingStatsRecordsForEpochDocument,
        {
          epochType,
          epochNumber,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data
        ?.epochTradingStatsRecords as GetEpochTradingStatsRecordQuery[];
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochTradingPointsRecordsForEpoch(
    epochType: EpochType,
    epochNumber: number
  ): Promise<GetEpochTradingPointsRecordQuery[] | undefined> {
    try {
      const result = await execute(
        GetEpochTradingPointsRecordsForEpochDocument,
        {
          epochType,
          epochNumber,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data
        ?.epochTradingPointsRecords as GetEpochTradingPointsRecordQuery[];
    } catch (e) {
      console.error(e);
    }
  }
}
