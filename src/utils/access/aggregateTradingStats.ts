import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { AggregateTradingStat } from "../../types/schema";
import { updateStakingPoints,createOrLoadUserPointStat } from "./calculateRewards";
import {
  ZERO_BD,
  EPOCH_TYPE,
  determineEpochNumber,
  PROTOCOL,
} from "../constants";

export function generateAggregateTradingStatsId(
  address: string,
  epochType: string,
  epochNumber: i32
): string {
  return address + "-" + epochType + "-" + epochNumber.toString();
}

export function createOrLoadAggregateTradingStats(
  address: string,
  epochType: string,
  epochNumber: i32,
  save: boolean
): AggregateTradingStat {
  log.info(
    "[createOrLoadAggregateTradingStats] address {}, epochType {}, epochNumber {}",
    [address, epochType.toString(), epochNumber.toString()]
  );
  const id = generateAggregateTradingStatsId(address, epochType, epochNumber);
  let aggregateTradingStats = AggregateTradingStat.load(id);
  if (aggregateTradingStats == null) {
    aggregateTradingStats = new AggregateTradingStat(id);
    aggregateTradingStats.address = address;
    aggregateTradingStats.epochType = epochType;
    aggregateTradingStats.epochNumber = epochNumber;
    aggregateTradingStats.totalVolumePerGroup = [];
    aggregateTradingStats.totalBorrowingFees = ZERO_BD;
    aggregateTradingStats.pairsTraded = [];
    aggregateTradingStats.totalPnl = ZERO_BD;
    aggregateTradingStats.totalPnlPercentage = ZERO_BD;
    // Add govFees, referralFees, triggerFees, lpFees, stakerFees
    aggregateTradingStats.totalGovFees = ZERO_BD;
    aggregateTradingStats.totalReferralFees = ZERO_BD;
    aggregateTradingStats.totalTriggerFees = ZERO_BD;
    aggregateTradingStats.totalLpFees = ZERO_BD;
    aggregateTradingStats.totalStakerFees = ZERO_BD;

    if (save) {
      aggregateTradingStats.save();
    }
  }
  return aggregateTradingStats as AggregateTradingStat;
}

/**
 * @dev This function is called when a user opens a trade
 */
export class addOpenTradeStatsInput {
  address: string;
  pairIndex: i32;
  groupIndex: i32;
  positionSize: BigDecimal;
  timestamp: i32;
}
export function addOpenTradeStats(data: addOpenTradeStatsInput): void {
  const address = data.address;
  const pairIndex = data.pairIndex;
  const positionSize = data.positionSize;
  const timestamp = data.timestamp;
  log.info("[addOpenTradeStats] address {} pairIndex {}, positionSize {}", [
    address,
    pairIndex.toString(),
    positionSize.toString(),
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

export class addCloseTradeStatsInput {
  address: string;
  pairIndex: i32;
  groupIndex: i32;
  positionSize: BigDecimal;
  pnl: BigDecimal;
  pnlPercentage: BigDecimal;
  timestamp: i32;
}

/**
 * @dev This function is called when a user closes a trade
 */
export function addCloseTradeStats(data: addCloseTradeStatsInput): void {
  const address = data.address;
  const pairIndex = data.pairIndex;
  const positionSize = data.positionSize;
  const pnl = data.pnl;
  const pnlPercentage = data.pnlPercentage;
  const timestamp = data.timestamp;
  log.info(
    "[addCloseTradeStats] address {} pairIndex {}, positionSize {}, pnl {}, pnlPercentage {}",
    [
      address,
      pairIndex.toString(),
      positionSize.toString(),
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
  _addCloseTradeStats(data, weeklyProtocolStats);

  updateStakingPoints(
    address,
    currentWeekNumber,
    currentDayNumber,
    data.pnl,
    data.pnlPercentage
  );  
  
}

/**
 * Internal handler for adding open trade stats
 */
function _addOpenTradeStats(
  data: addOpenTradeStatsInput,
  currentStats: AggregateTradingStat
): AggregateTradingStat {
  const pairIndex = data.pairIndex;
  const groupIndex = data.groupIndex;
  const positionSize = data.positionSize;

  // Make sure volume array is initialized and large enough for groupIndex
  const volumePerGroupArray = currentStats.totalVolumePerGroup;
  if (volumePerGroupArray.length <= groupIndex) {
    for (let i = volumePerGroupArray.length; i <= groupIndex; i++) {
      volumePerGroupArray.push(ZERO_BD);
    }
  }

  // Add volume to group
  volumePerGroupArray[groupIndex] =
    volumePerGroupArray[groupIndex].plus(positionSize);
  currentStats.totalVolumePerGroup = volumePerGroupArray;

  // Mark pair as traded if it's not already
  const pairsTradedArray = currentStats.pairsTraded;
  if (!pairsTradedArray.includes(pairIndex)) {
    pairsTradedArray.push(pairIndex);
    currentStats.pairsTraded = pairsTradedArray;
  }

  currentStats.save();
  return currentStats;
}

/**
 * Internal handler for adding close trade stats
 */
function _addCloseTradeStats(
  data: addCloseTradeStatsInput,
  currentStats: AggregateTradingStat
): AggregateTradingStat {
  const pairIndex = data.pairIndex;
  const groupIndex = data.groupIndex;
  const positionSize = data.positionSize;
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
    volumePerGroupArray[groupIndex].plus(positionSize);
  currentStats.totalVolumePerGroup = volumePerGroupArray;

  // Add pnl
  currentStats.totalPnl = currentStats.totalPnl.plus(pnl);

  // Add pnl percentage
  currentStats.totalPnlPercentage =
    currentStats.totalPnlPercentage.plus(pnlPercentage);

  // Mark pair as traded if it's not already
  const pairsTradedArray = currentStats.pairsTraded;
  if (!pairsTradedArray.includes(pairIndex)) {
    pairsTradedArray.push(pairIndex);
    currentStats.pairsTraded = pairsTradedArray;
  }

  currentStats.save();
  return currentStats;
}

export function addBorrowingFeeStats(
  address: string,
  borrowingFee: BigDecimal,
  timestamp: i32
): AggregateTradingStat[] {
  return _addStats(address, borrowingFee, timestamp, "totalBorrowingFees");
}

export function addGovFeeStats(
  address: string,
  govFee: BigDecimal,
  timestamp: i32
): AggregateTradingStat[] {
  return _addStats(address, govFee, timestamp, "totalGovFees");
}

export function addReferralFeeStats(
  address: string,
  referralFee: BigDecimal,
  timestamp: i32
): AggregateTradingStat[] {
  return _addStats(address, referralFee, timestamp, "totalReferralFees");
}

export function addTriggerFeeStats(
  address: string,
  triggerFee: BigDecimal,
  timestamp: i32
): AggregateTradingStat[] {
  return _addStats(address, triggerFee, timestamp, "totalTriggerFees");
}

export function addLpFeeStats(
  address: string,
  lpFee: BigDecimal,
  timestamp: i32
): AggregateTradingStat[] {
  return _addStats(address, lpFee, timestamp, "totalLpFees");
}

export function addStakerFeeStats(
  address: string,
  stakerFee: BigDecimal,
  timestamp: i32
): AggregateTradingStat[] {
  return _addStats(address, stakerFee, timestamp, "totalStakerFees");
}

function _addStats(
  address: string,
  stat: BigDecimal,
  timestamp: i32,
  statName: string
): AggregateTradingStat[] {
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);

  let dailyStats = createOrLoadAggregateTradingStats(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );
  dailyStats = _addStat(stat, statName, dailyStats);

  let weeklyStats = createOrLoadAggregateTradingStats(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );
  weeklyStats = _addStat(stat, statName, weeklyStats);

  let dailyProtocolStats = createOrLoadAggregateTradingStats(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    false
  );
  dailyProtocolStats = _addStat(stat, statName, dailyProtocolStats);

  let weeklyProtocolStats = createOrLoadAggregateTradingStats(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    false
  );
  weeklyProtocolStats = _addStat(stat, statName, weeklyProtocolStats);

  dailyStats.save();
  weeklyStats.save();
  dailyProtocolStats.save();
  weeklyProtocolStats.save();

  return [dailyStats, weeklyStats, dailyProtocolStats, weeklyProtocolStats];
}

function _addStat(
  stat: BigDecimal,
  statName: string,
  currentStats: AggregateTradingStat
): AggregateTradingStat {
  if (statName == "totalBorrowingFees") {
    currentStats.totalBorrowingFees = currentStats.totalBorrowingFees.plus(stat);
  } else if (statName == "totalGovFees") {
    currentStats.totalGovFees = currentStats.totalGovFees.plus(stat);
  } else if (statName == "totalReferralFees") {
    currentStats.totalReferralFees = currentStats.totalReferralFees.plus(stat);
  } else if (statName == "totalTriggerFees") {
    currentStats.totalTriggerFees = currentStats.totalTriggerFees.plus(stat);
  } else if (statName == "totalLpFees") {
    currentStats.totalLpFees = currentStats.totalLpFees.plus(stat);
  } else if (statName == "totalStakerFees") {
    currentStats.totalStakerFees = currentStats.totalStakerFees.plus(stat);
  }

  return currentStats;
}
