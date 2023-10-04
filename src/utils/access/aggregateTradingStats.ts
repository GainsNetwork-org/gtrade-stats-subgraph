import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { AggregateTradingStats } from "../../types/schema";
import {
  ZERO_BD,
  EPOCH_TYPE,
  determineEpochNumber,
  PROTOCOL,
} from "../constants";

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

/**
 * @dev This function is called when a user opens a trade
 */
export class HandleOpenTradeInput {
  address: string;
  pairIndex: number;
  groupIndex: number;
  volume: BigDecimal;
  openFee: BigDecimal;
  timestamp: number;
}
export function handleOpenTrade(
  data: HandleOpenTradeInput,
  save: boolean
): void {
  const address = data.address;
  const pairIndex = data.pairIndex;
  const volume = data.volume;
  const openFee = data.openFee;
  const timestamp = data.timestamp;
  log.info("[handleOpenTrade] address {} pairIndex {}, volume {}, openFee {}", [
    address,
    pairIndex.toString(),
    volume.toString(),
    openFee.toString(),
  ]);

  // Daily stats
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const dailyStats = createOrLoadAggregateTradingStats(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );

  _addOpenTradeStats(data, dailyStats);

  // Weekly stats
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);
  const weeklyStats = createOrLoadAggregateTradingStats(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );
  _addOpenTradeStats(data, weeklyStats);

  // Daily protocol stats
  const dailyProtocolStats = createOrLoadAggregateTradingStats(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );
  _addOpenTradeStats(data, dailyProtocolStats);

  // Weekly protocol stats
  const weeklyProtocolStats = createOrLoadAggregateTradingStats(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );
  _addOpenTradeStats(data, weeklyProtocolStats);
}

export class HandleCloseTradeInput {
  address: string;
  pairIndex: number;
  groupIndex: number;
  volume: BigDecimal;
  closeFee: BigDecimal;
  borrowingFee: BigDecimal;
  pnl: BigDecimal;
  pnlPercentage: BigDecimal;
  timestamp: number;
}

/**
 * @dev This function is called when a user closes a trade
 */
export function handleCloseTrade(
  data: HandleCloseTradeInput,
  save: boolean
): void {
  const address = data.address;
  const pairIndex = data.pairIndex;
  const volume = data.volume;
  const closeFee = data.closeFee;
  const borrowingFee = data.borrowingFee;
  const pnl = data.pnl;
  const pnlPercentage = data.pnlPercentage;
  const timestamp = data.timestamp;
  log.info(
    "[handleCloseTrade] address {} pairIndex {}, volume {}, closeFee {}, borrowingFee {}, pnl {}, pnlPercentage {}",
    [
      address,
      pairIndex.toString(),
      volume.toString(),
      closeFee.toString(),
      borrowingFee.toString(),
      pnl.toString(),
      pnlPercentage.toString(),
    ]
  );

  // Daily stats
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const dailyStats = createOrLoadAggregateTradingStats(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );

  _addCloseTradeStats(data, dailyStats);

  // Weekly stats
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);
  const weeklyStats = createOrLoadAggregateTradingStats(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );
  _addCloseTradeStats(data, weeklyStats);

  // Daily protocol stats
  const dailyProtocolStats = createOrLoadAggregateTradingStats(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );
  _addCloseTradeStats(data, dailyProtocolStats);

  // Weekly protocol stats
  const weeklyProtocolStats = createOrLoadAggregateTradingStats(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );
}

/**
 * Internal handler for adding open trade stats
 */
function _addOpenTradeStats(
  data: HandleOpenTradeInput,
  currentStats: AggregateTradingStats
): AggregateTradingStats {
  const address = data.address;
  const pairIndex = data.pairIndex;
  const groupIndex = data.groupIndex;
  const volume = data.volume;
  const openFee = data.openFee;
  const timestamp = data.timestamp;

  // Make sure volume array is initialized and large enough for groupIndex
  const volumePerGroupArray = currentStats.totalVolumePerGroup;
  if (volumePerGroupArray.length <= groupIndex) {
    for (let i = volumePerGroupArray.length; i <= groupIndex; i++) {
      volumePerGroupArray.push(ZERO_BD);
    }
  }

  // Add volume to group
  volumePerGroupArray[groupIndex] =
    volumePerGroupArray[groupIndex].plus(volume);
  currentStats.totalVolumePerGroup = volumePerGroupArray;

  // Same for totalTradesPerGroup
  const totalTradesPerGroupArray = currentStats.totalTradesPerGroup;
  if (totalTradesPerGroupArray.length <= groupIndex) {
    for (let i = totalTradesPerGroupArray.length; i <= groupIndex; i++) {
      totalTradesPerGroupArray.push(ZERO_BD);
    }
  }
  totalTradesPerGroupArray[groupIndex] = totalTradesPerGroupArray[
    groupIndex
  ].plus(BigDecimal.fromString("1"));
  currentStats.totalTradesPerGroup = totalTradesPerGroupArray;

  // Add open fee
  currentStats.totalOpenFees = currentStats.totalOpenFees.plus(openFee);

  // Mark pair as traded if not already
  if (!currentStats.pairsTraded.includes(pairIndex)) {
    currentStats.pairsTraded.push(pairIndex);
  }

  currentStats.save();
  return currentStats;
}

/**
 * Internal handler for adding close trade stats
 */
function _addCloseTradeStats(
  data: HandleCloseTradeInput,
  currentStats: AggregateTradingStats
): AggregateTradingStats {
  const address = data.address;
  const pairIndex = data.pairIndex;
  const groupIndex = data.groupIndex;
  const volume = data.volume;
  const closeFee = data.closeFee;
  const borrowingFee = data.borrowingFee;
  const pnl = data.pnl;
  const pnlPercentage = data.pnlPercentage;
  const timestamp = data.timestamp;

  // Make sure volume array is initialized and large enough for groupIndex
  const volumePerGroupArray = currentStats.totalVolumePerGroup;
  if (volumePerGroupArray.length <= groupIndex) {
    for (let i = volumePerGroupArray.length; i <= groupIndex; i++) {
      volumePerGroupArray.push(ZERO_BD);
    }
  }

  // Add volume to group
  volumePerGroupArray[groupIndex] =
    volumePerGroupArray[groupIndex].plus(volume);

  // Same for totalTradesPerGroup
  const totalTradesPerGroupArray = currentStats.totalTradesPerGroup;
  if (totalTradesPerGroupArray.length <= groupIndex) {
    for (let i = totalTradesPerGroupArray.length; i <= groupIndex; i++) {
      totalTradesPerGroupArray.push(ZERO_BD);
    }
  }
  totalTradesPerGroupArray[groupIndex] = totalTradesPerGroupArray[
    groupIndex
  ].plus(BigDecimal.fromString("1"));

  // Add close fee
  currentStats.totalCloseFees = currentStats.totalCloseFees.plus(closeFee);

  // Add borrowing fee
  currentStats.totalBorrowingFees =
    currentStats.totalBorrowingFees.plus(borrowingFee);

  // Add pnl
  currentStats.totalPnl = currentStats.totalPnl.plus(pnl);

  // Add pnl percentage
  currentStats.totalPnlPercentage =
    currentStats.totalPnlPercentage.plus(pnlPercentage);

  // Mark pair as traded if it's not already
  if (!currentStats.pairsTraded.includes(pairIndex)) {
    currentStats.pairsTraded.push(pairIndex);
  }

  currentStats.save();
  return currentStats;
}
