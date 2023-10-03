import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { AggregateTradingStats } from "../../types/schema";
import { ZERO_BD, EPOCH_TYPE } from "../constants";

export function generateAggregateTradingStatsId(
  address: string,
  epochType: string,
  epochNumber: number
): string {
  return address + "-" + epochType + "-" + epochNumber.toString();
}

export function createOrLoadAggregateTradingStats(
  address: string,
  epochType: string,
  epochNumber: number,
  save: boolean
): AggregateTradingStats {
  log.info(
    "[createOrLoadAggregateTradingStats] address {}, epochType {}, epochNumber {}",
    [address, epochType.toString(), epochNumber.toString()]
  );
  const id = generateAggregateTradingStatsId(address, epochType, epochNumber);
  let aggregateTradingStats = AggregateTradingStats.load(id);
  if (aggregateTradingStats == null) {
    aggregateTradingStats = new AggregateTradingStats(id);
    aggregateTradingStats.address = address;
    aggregateTradingStats.epochType = epochType;
    aggregateTradingStats.epochNumber = epochNumber;
    aggregateTradingStats.totalVolumePerGroup = [];
    aggregateTradingStats.totalTradesPerGroup = [];
    aggregateTradingStats.totalOpenFees = ZERO_BD;
    aggregateTradingStats.totalCloseFees = ZERO_BD;
    aggregateTradingStats.totalBorrowingFees = ZERO_BD;
    aggregateTradingStats.pairsTraded = [];
    aggregateTradingStats.totalPnl = ZERO_BD;
    aggregateTradingStats.totalPnlPercentage = ZERO_BD;

    if (save) {
      aggregateTradingStats.save();
    }
  }
  return aggregateTradingStats as AggregateTradingStats;
}
