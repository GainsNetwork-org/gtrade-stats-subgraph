import {
  EpochType,
  execute,
  GetEpochTradingPointsRecordDocument,
  GetEpochTradingPointsRecordQuery,
  GetEpochTradingStatsRecordDocument,
  GetEpochTradingStatsRecordQuery,
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
          epochTradingStatId: id,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data as GetEpochTradingStatsRecordQuery;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochPointStat(
    address: string,
    epochType: EpochType,
    epochNumber: number
  ): Promise<GetEpochTradingPointsRecordQuery | undefined> {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await execute(
        GetEpochTradingPointsRecordDocument,
        {
          epochPointStatId: id,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data as GetEpochTradingPointsRecordQuery;
    } catch (e) {
      console.error(e);
    }
  }
}