import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { EpochTradingStatsRecord } from "../../types/schema";
import { updatePointsOnClose } from "./calculatePoints";
import {
  ZERO_BD,
  EPOCH_TYPE,
  determineEpochNumber,
  PROTOCOL,
  COLLATERALS,
} from "../constants";

export function generateAggregateTradingStatsId(
  address: string,
  epochType: string,
  epochNumber: i32,
  collateral: string | null
): string {
  return (
    address +
    "-" +
    epochType +
    "-" +
    epochNumber.toString() +
    (collateral && collateral != COLLATERALS._ALL_ ? "-" + collateral : "")
  );
}

export function createOrLoadEpochTradingStatsRecord(
  address: string,
  epochType: string,
  epochNumber: i32,
  collateral: string | null,
  save: boolean
): EpochTradingStatsRecord {
  log.info(
    "[createOrLoadEpochTradingStatsRecord] address {}, epochType {}, epochNumber {}, collateral {}",
    [
      address,
      epochType.toString(),
      epochNumber.toString(),
      collateral ? collateral : "_all_",
    ]
  );
  const id = generateAggregateTradingStatsId(
    address,
    epochType,
    epochNumber,
    collateral
  );
  let epochTradingStatsRecord = EpochTradingStatsRecord.load(id);
  if (epochTradingStatsRecord == null) {
    epochTradingStatsRecord = new EpochTradingStatsRecord(id);
    epochTradingStatsRecord.address = address;
    epochTradingStatsRecord.epochType = epochType;
    epochTradingStatsRecord.epochNumber = epochNumber;
    epochTradingStatsRecord.collateral = collateral
      ? collateral
      : COLLATERALS._ALL_;
    epochTradingStatsRecord.totalVolumePerGroup = [];
    epochTradingStatsRecord.totalBorrowingFees = ZERO_BD;
    epochTradingStatsRecord.pairsTraded = [];
    epochTradingStatsRecord.totalPnl = ZERO_BD;
    epochTradingStatsRecord.totalPnlPercentage = ZERO_BD;
    // Add govFees, referralFees, triggerFees, lpFees, stakerFees
    epochTradingStatsRecord.totalGovFees = ZERO_BD;
    epochTradingStatsRecord.totalReferralFees = ZERO_BD;
    epochTradingStatsRecord.totalTriggerFees = ZERO_BD;
    epochTradingStatsRecord.totalLpFees = ZERO_BD;
    epochTradingStatsRecord.totalStakerFees = ZERO_BD;
    epochTradingStatsRecord.totalOpenedTrades = 0;
    epochTradingStatsRecord.totalClosedTrades = 0;
    epochTradingStatsRecord.totalDaysOpenedTrades = 0;
    epochTradingStatsRecord.totalDaysClosedTrades = 0;

    if (save) {
      epochTradingStatsRecord.save();
    }
  }
  return epochTradingStatsRecord as EpochTradingStatsRecord;
}

/**
 * @dev This function is called when a user opens a trade
 */
export class addOpenTradeStatsInput {
  collateral: string | null;
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
  const collateral = data.collateral;
  log.info("[addOpenTradeStats] address {} pairIndex {}, positionSize {}", [
    address,
    pairIndex.toString(),
    positionSize.toString(),
  ]);

  // Daily stats
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const dailyStats = createOrLoadEpochTradingStatsRecord(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );

  _addOpenTradeStats(data, dailyStats);

  // Weekly stats
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);
  const weeklyStats = createOrLoadEpochTradingStatsRecord(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );
  _addOpenTradeStats(data, weeklyStats, dailyStats.totalOpenedTrades == 1);

  // Daily protocol stats
  const dailyProtocolStats = createOrLoadEpochTradingStatsRecord(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );
  _addOpenTradeStats(data, dailyProtocolStats);

  // Weekly protocol stats
  const weeklyProtocolStats = createOrLoadEpochTradingStatsRecord(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );
  _addOpenTradeStats(
    data,
    weeklyProtocolStats,
    dailyProtocolStats.totalOpenedTrades == 1
  );
}

export class addCloseTradeStatsInput {
  collateral: string | null;
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
  const collateral = data.collateral;
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
  const dailyStats = createOrLoadEpochTradingStatsRecord(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );
  _addCloseTradeStats(data, dailyStats);

  // Weekly stats
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);
  const weeklyStats = createOrLoadEpochTradingStatsRecord(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );
  _addCloseTradeStats(data, weeklyStats, dailyStats.totalClosedTrades == 1);

  // Daily protocol stats
  const dailyProtocolStats = createOrLoadEpochTradingStatsRecord(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );
  _addCloseTradeStats(data, dailyProtocolStats);

  // Weekly protocol stats
  const weeklyProtocolStats = createOrLoadEpochTradingStatsRecord(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );
  _addCloseTradeStats(
    data,
    weeklyProtocolStats,
    dailyProtocolStats.totalClosedTrades == 1
  );

  updatePointsOnClose(
    address,
    currentWeekNumber,
    currentDayNumber,
    collateral,
    data.pnl,
    data.pnlPercentage,
    data.groupIndex,
    data.pairIndex,
    data.positionSize,
    weeklyStats
  );
}

/**
 * Internal handler for adding open trade stats
 */
function _addOpenTradeStats(
  data: addOpenTradeStatsInput,
  currentStats: EpochTradingStatsRecord,
  firstOpenedTrade: boolean = false
): EpochTradingStatsRecord {
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

  currentStats.totalOpenedTrades = currentStats.totalOpenedTrades + 1;

  if (firstOpenedTrade) {
    currentStats.totalDaysOpenedTrades = currentStats.totalDaysOpenedTrades + 1;
  }

  currentStats.save();
  return currentStats;
}

/**
 * Internal handler for adding close trade stats
 */
function _addCloseTradeStats(
  data: addCloseTradeStatsInput,
  currentStats: EpochTradingStatsRecord,
  firstClosedTrade: boolean = false
): EpochTradingStatsRecord {
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

  currentStats.totalClosedTrades = currentStats.totalClosedTrades + 1;

  if (firstClosedTrade) {
    currentStats.totalDaysClosedTrades = currentStats.totalDaysClosedTrades + 1;
  }

  currentStats.save();
  return currentStats;
}

export function addBorrowingFeeStats(
  address: string,
  borrowingFee: BigDecimal,
  timestamp: i32,
  collateral: string | null
): EpochTradingStatsRecord[] {
  return _addStats(
    address,
    borrowingFee,
    timestamp,
    collateral,
    "totalBorrowingFees"
  );
}

export function addGovFeeStats(
  address: string,
  govFee: BigDecimal,
  timestamp: i32,
  collateral: string | null
): EpochTradingStatsRecord[] {
  return _addStats(address, govFee, timestamp, collateral, "totalGovFees");
}

export function addReferralFeeStats(
  address: string,
  referralFee: BigDecimal,
  timestamp: i32,
  collateral: string | null
): EpochTradingStatsRecord[] {
  return _addStats(
    address,
    referralFee,
    timestamp,
    collateral,
    "totalReferralFees"
  );
}

export function addTriggerFeeStats(
  address: string,
  triggerFee: BigDecimal,
  timestamp: i32,
  collateral: string | null
): EpochTradingStatsRecord[] {
  return _addStats(
    address,
    triggerFee,
    timestamp,
    collateral,
    "totalTriggerFees"
  );
}

export function addLpFeeStats(
  address: string,
  lpFee: BigDecimal,
  timestamp: i32,
  collateral: string | null
): EpochTradingStatsRecord[] {
  return _addStats(address, lpFee, timestamp, collateral, "totalLpFees");
}

export function addStakerFeeStats(
  address: string,
  stakerFee: BigDecimal,
  timestamp: i32,
  collateral: string | null
): EpochTradingStatsRecord[] {
  return _addStats(
    address,
    stakerFee,
    timestamp,
    collateral,
    "totalStakerFees"
  );
}

function _addStats(
  address: string,
  stat: BigDecimal,
  timestamp: i32,
  collateral: string | null,
  statName: string
): EpochTradingStatsRecord[] {
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);

  let dailyStats = createOrLoadEpochTradingStatsRecord(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );
  dailyStats = _addStat(stat, statName, dailyStats);

  let weeklyStats = createOrLoadEpochTradingStatsRecord(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );
  weeklyStats = _addStat(stat, statName, weeklyStats);

  let dailyProtocolStats = createOrLoadEpochTradingStatsRecord(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );
  dailyProtocolStats = _addStat(stat, statName, dailyProtocolStats);

  let weeklyProtocolStats = createOrLoadEpochTradingStatsRecord(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
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
  currentStats: EpochTradingStatsRecord
): EpochTradingStatsRecord {
  if (statName == "totalBorrowingFees") {
    currentStats.totalBorrowingFees =
      currentStats.totalBorrowingFees.plus(stat);
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
