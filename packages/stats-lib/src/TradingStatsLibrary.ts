import {
  EpochType,
  execute,
  GetEpochPointStatDocument,
  GetEpochPointStatQuery,
  GetEpochTradingStatDocument,
  GetEpochTradingStatQuery,
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

  async getEpochTradingStat(
    address: string,
    epochType: EpochType,
    epochNumber: number
  ): Promise<GetEpochTradingStatQuery | undefined> {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await execute(
        GetEpochTradingStatDocument,
        {
          epochTradingStatId: id,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data as GetEpochTradingStatQuery;
    } catch (e) {
      console.error(e);
    }
  }

  async getEpochPointStat(
    address: string,
    epochType: EpochType,
    epochNumber: number
  ): Promise<GetEpochPointStatQuery | undefined> {
    try {
      const id = generateId(address, epochType, epochNumber);
      const result = await execute(
        GetEpochPointStatDocument,
        {
          epochPointStatId: id,
        },
        {
          config: {
            graphName: this.subgraph,
          },
        }
      );
      return result?.data as GetEpochPointStatQuery;
    } catch (e) {
      console.error(e);
    }
  }
}
