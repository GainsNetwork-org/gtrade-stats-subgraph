import { Address, BigDecimal, dataSource, log } from "@graphprotocol/graph-ts";
import {
  EpochTradingPointsRecord,
  EpochTradingStatsRecord,
} from "../../types/schema";
import {
  ZERO_BD,
  EPOCH_TYPE,
  determineEpochNumber,
  PROTOCOL,
  VOLUME_THRESHOLDS,
  ONE_BD,
  COLLATERALS,
  WHITELISTED_REFERRER_MULTIPLIER,
  WHITELISTED_REFEREE_MULTIPLIER,
  PNL_BLACKLISTED_ADDRESSES_12,
  PNL_BLACKLISTED_ADDRESSES_50_APECHAIN,
  PNL_BLACKLISTED_ADDRESSES_39_BIWEEKLY_BTCUSD,
} from "../constants";
import { isTraderReferredByWhitelistedReferral } from "../contract/GNSMultiCollatDiamond";

export function updatePointsOnClose(
  address: string,
  weekNumber: i32,
  dayNumber: i32,
  biweeklyNumber: i32,
  collateral: string | null,
  pnl: BigDecimal,
  pnlPercentage: BigDecimal,
  groupNumber: i32,
  pairNumber: i32,
  volume: BigDecimal,
  weeklyStats: EpochTradingStatsRecord,
  biweeklyStats: EpochTradingStatsRecord
): void {
  // load all 6 entries: UserDaily, ProtocolDaily, UserWeekly, ProtocolWeekly, UserBiweekly, ProtocolBiweekly
  const userDailyPoints = createOrLoadEpochTradingPointsRecord(
    address,
    EPOCH_TYPE.DAY,
    dayNumber,
    collateral,
    false
  );
  const protocolDailyPoints = createOrLoadEpochTradingPointsRecord(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    dayNumber,
    collateral,
    false
  );
  const userWeeklyPoints = createOrLoadEpochTradingPointsRecord(
    address,
    EPOCH_TYPE.WEEK,
    weekNumber,
    collateral,
    false
  );
  const protocolWeeklyPoints = createOrLoadEpochTradingPointsRecord(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    weekNumber,
    collateral,
    false
  );
  const userBiweeklyPoints = createOrLoadEpochTradingPointsRecord(
    address,
    EPOCH_TYPE.BIWEEKLY,
    biweeklyNumber,
    collateral,
    false
  );
  const protocolBiweeklyPoints = createOrLoadEpochTradingPointsRecord(
    PROTOCOL,
    EPOCH_TYPE.BIWEEKLY,
    biweeklyNumber,
    collateral,
    false
  );

  // Handle weekly eligibility and updates
  const weeklyAbsoluteEligible =
    isTraderEligibleForAbsoluteSkillPoints(weeklyStats);
  const weeklyRelativeEligible =
    isTraderEligibleForRelativeSkillPoints(weeklyStats);

  // Handle biweekly eligibility and updates
  const biweeklyAbsoluteEligible =
    isTraderEligibleForAbsoluteSkillPoints(biweeklyStats);
  const biweeklyRelativeEligible =
    isTraderEligibleForRelativeSkillPoints(biweeklyStats);

  // Update absolute skill points - always update daily, conditionally update weekly/biweekly
  if (weeklyAbsoluteEligible || biweeklyAbsoluteEligible) {
    updateAbsoluteSkillPoints(
      userDailyPoints,
      protocolDailyPoints,
      userWeeklyPoints,
      protocolWeeklyPoints,
      userBiweeklyPoints,
      protocolBiweeklyPoints,
      // For weekly: use totalPnl if just became eligible, otherwise current pnl
      weeklyAbsoluteEligible &&
        userWeeklyPoints.epochNumber >= EPOCH_ELIGIBILITY_CHECK_START &&
        !userWeeklyPoints.isAbsSkillEligible
        ? weeklyStats.totalPnl
        : pnl,
      // For biweekly: use totalPnl if just became eligible, otherwise current pnl
      biweeklyAbsoluteEligible &&
        userBiweeklyPoints.epochNumber >= EPOCH_ELIGIBILITY_CHECK_START &&
        !userBiweeklyPoints.isAbsSkillEligible
        ? biweeklyStats.totalPnl
        : pnl,
      weeklyAbsoluteEligible, // Pass eligibility flag for weekly
      biweeklyAbsoluteEligible // Pass eligibility flag for biweekly
    );
  }

  // Update relative skill points - always update daily, conditionally update weekly/biweekly
  if (weeklyRelativeEligible || biweeklyRelativeEligible) {
    updateRelativeSkillPoints(
      userDailyPoints,
      protocolDailyPoints,
      userWeeklyPoints,
      protocolWeeklyPoints,
      userBiweeklyPoints,
      protocolBiweeklyPoints,
      // For weekly: use totalPnlPercentage if just became eligible, otherwise current pnlPercentage
      weeklyRelativeEligible &&
        userWeeklyPoints.epochNumber >= EPOCH_ELIGIBILITY_CHECK_START &&
        !userWeeklyPoints.isRelSkillEligible
        ? weeklyStats.totalPnlPercentage
        : pnlPercentage,
      // For biweekly: use totalPnlPercentage if just became eligible, otherwise current pnlPercentage
      biweeklyRelativeEligible &&
        userBiweeklyPoints.epochNumber >= EPOCH_ELIGIBILITY_CHECK_START &&
        !userBiweeklyPoints.isRelSkillEligible
        ? biweeklyStats.totalPnlPercentage
        : pnlPercentage,
      weeklyRelativeEligible, // Pass eligibility flag for weekly
      biweeklyRelativeEligible // Pass eligibility flag for biweekly
    );
  }

  updateDiversityPoints(
    userDailyPoints,
    protocolDailyPoints,
    userWeeklyPoints,
    protocolWeeklyPoints,
    userBiweeklyPoints,
    protocolBiweeklyPoints,
    groupNumber,
    pairNumber,
    volume
  );
}

export function updateAbsoluteSkillPoints(
  userDailyPoints: EpochTradingPointsRecord,
  protocolDailyPoints: EpochTradingPointsRecord,
  userWeeklyPoints: EpochTradingPointsRecord,
  protocolWeeklyPoints: EpochTradingPointsRecord,
  userBiweeklyPoints: EpochTradingPointsRecord,
  protocolBiweeklyPoints: EpochTradingPointsRecord,
  pnlWeekly: BigDecimal,
  pnlBiweekly: BigDecimal,
  isWeeklyEligible: boolean,
  isBiweeklyEligible: boolean
): void {
  let userDailySkillPoints =
    userDailyPoints.pnl.plus(pnlWeekly) > ZERO_BD
      ? userDailyPoints.pnl.plus(pnlWeekly)
      : ZERO_BD;
  let userWeeklySkillPoints =
    userWeeklyPoints.pnl.plus(pnlWeekly) > ZERO_BD
      ? userWeeklyPoints.pnl.plus(pnlWeekly)
      : ZERO_BD;
  let userBiweeklySkillPoints =
    userBiweeklyPoints.pnl.plus(pnlBiweekly) > ZERO_BD
      ? userBiweeklyPoints.pnl.plus(pnlBiweekly)
      : ZERO_BD;
  let protocolDailySkillPoints = calculateSkillPoints(
    userDailyPoints,
    protocolDailyPoints,
    pnlWeekly,
    true
  );
  let protocolWeeklySkillPoints = calculateSkillPoints(
    userWeeklyPoints,
    protocolWeeklyPoints,
    pnlWeekly,
    true
  );
  let protocolBiweeklySkillPoints = calculateSkillPoints(
    userBiweeklyPoints,
    protocolBiweeklyPoints,
    pnlBiweekly,
    true
  );

  // update pnls - always update daily, conditionally update weekly/biweekly
  userDailyPoints.pnl = userDailyPoints.pnl.plus(pnlWeekly);
  protocolDailyPoints.pnl = protocolDailyPoints.pnl.plus(pnlWeekly);

  if (isWeeklyEligible) {
    userWeeklyPoints.pnl = userWeeklyPoints.pnl.plus(pnlWeekly);
    protocolWeeklyPoints.pnl = protocolWeeklyPoints.pnl.plus(pnlWeekly);
  }

  if (isBiweeklyEligible) {
    userBiweeklyPoints.pnl = userBiweeklyPoints.pnl.plus(pnlBiweekly);
    protocolBiweeklyPoints.pnl = protocolBiweeklyPoints.pnl.plus(pnlBiweekly);
  }

  // update skill points - always update daily, conditionally update weekly/biweekly
  userDailyPoints.absSkillPoints = userDailySkillPoints;
  protocolDailyPoints.absSkillPoints = protocolDailySkillPoints;

  if (isWeeklyEligible) {
    userWeeklyPoints.absSkillPoints = userWeeklySkillPoints;
    protocolWeeklyPoints.absSkillPoints = protocolWeeklySkillPoints;
    userWeeklyPoints.isAbsSkillEligible = true;
  }

  if (isBiweeklyEligible) {
    userBiweeklyPoints.absSkillPoints = userBiweeklySkillPoints;
    protocolBiweeklyPoints.absSkillPoints = protocolBiweeklySkillPoints;
    userBiweeklyPoints.isAbsSkillEligible = true;
  }

  userDailyPoints.isAbsSkillEligible = true;

  // Saving all the entities
  userDailyPoints.save();
  protocolDailyPoints.save();
  userWeeklyPoints.save();
  protocolWeeklyPoints.save();
  userBiweeklyPoints.save();
  protocolBiweeklyPoints.save();
}

export function updateRelativeSkillPoints(
  userDailyPoints: EpochTradingPointsRecord,
  protocolDailyPoints: EpochTradingPointsRecord,
  userWeeklyPoints: EpochTradingPointsRecord,
  protocolWeeklyPoints: EpochTradingPointsRecord,
  userBiweeklyPoints: EpochTradingPointsRecord,
  protocolBiweeklyPoints: EpochTradingPointsRecord,
  pnlPercentageWeekly: BigDecimal,
  pnlPercentageBiweekly: BigDecimal,
  isWeeklyEligible: boolean,
  isBiweeklyEligible: boolean
): void {
  let userDailySkillPoints =
    userDailyPoints.pnlPercentage.plus(pnlPercentageWeekly) > ZERO_BD
      ? userDailyPoints.pnlPercentage.plus(pnlPercentageWeekly)
      : ZERO_BD;
  let userWeeklySkillPoints =
    userWeeklyPoints.pnlPercentage.plus(pnlPercentageWeekly) > ZERO_BD
      ? userWeeklyPoints.pnlPercentage.plus(pnlPercentageWeekly)
      : ZERO_BD;
  let userBiweeklySkillPoints =
    userBiweeklyPoints.pnlPercentage.plus(pnlPercentageBiweekly) > ZERO_BD
      ? userBiweeklyPoints.pnlPercentage.plus(pnlPercentageBiweekly)
      : ZERO_BD;
  let protocolDailySkillPoints = calculateSkillPoints(
    userDailyPoints,
    protocolDailyPoints,
    pnlPercentageWeekly,
    false
  );
  let protocolWeeklySkillPoints = calculateSkillPoints(
    userWeeklyPoints,
    protocolWeeklyPoints,
    pnlPercentageWeekly,
    false
  );
  let protocolBiweeklySkillPoints = calculateSkillPoints(
    userBiweeklyPoints,
    protocolBiweeklyPoints,
    pnlPercentageBiweekly,
    false
  );

  // update pnls - always update daily, conditionally update weekly/biweekly
  userDailyPoints.pnlPercentage =
    userDailyPoints.pnlPercentage.plus(pnlPercentageWeekly);
  protocolDailyPoints.pnlPercentage =
    protocolDailyPoints.pnlPercentage.plus(pnlPercentageWeekly);

  if (isWeeklyEligible) {
    userWeeklyPoints.pnlPercentage =
      userWeeklyPoints.pnlPercentage.plus(pnlPercentageWeekly);
    protocolWeeklyPoints.pnlPercentage =
      protocolWeeklyPoints.pnlPercentage.plus(pnlPercentageWeekly);
  }

  if (isBiweeklyEligible) {
    userBiweeklyPoints.pnlPercentage = userBiweeklyPoints.pnlPercentage.plus(
      pnlPercentageBiweekly
    );
    protocolBiweeklyPoints.pnlPercentage =
      protocolBiweeklyPoints.pnlPercentage.plus(pnlPercentageBiweekly);
  }

  // update skill points - always update daily, conditionally update weekly/biweekly
  userDailyPoints.relSkillPoints = userDailySkillPoints;
  protocolDailyPoints.relSkillPoints = protocolDailySkillPoints;
  userDailyPoints.isRelSkillEligible = true;

  if (isWeeklyEligible) {
    userWeeklyPoints.relSkillPoints = userWeeklySkillPoints;
    protocolWeeklyPoints.relSkillPoints = protocolWeeklySkillPoints;
    userWeeklyPoints.isRelSkillEligible = true;
  }

  if (isBiweeklyEligible) {
    userBiweeklyPoints.relSkillPoints = userBiweeklySkillPoints;
    protocolBiweeklyPoints.relSkillPoints = protocolBiweeklySkillPoints;
    userBiweeklyPoints.isRelSkillEligible = true;
  }

  // Saving all the entities
  userDailyPoints.save();
  protocolDailyPoints.save();
  userWeeklyPoints.save();
  protocolWeeklyPoints.save();
  userBiweeklyPoints.save();
  protocolBiweeklyPoints.save();
}

// @todo - add volume thresholds for diversity groups
// @todo - is groupNumber accurate here...? btc/eth = 0, crypto = 1, forex = 2, commodities = 3?
export function updateDiversityPoints(
  userDailyPoints: EpochTradingPointsRecord,
  protocolDailyPoints: EpochTradingPointsRecord,
  userWeeklyPoints: EpochTradingPointsRecord,
  protocolWeeklyPoints: EpochTradingPointsRecord,
  userBiweeklyPoints: EpochTradingPointsRecord,
  protocolBiweeklyPoints: EpochTradingPointsRecord,
  groupNumber: i32,
  pairNumber: i32,
  volume: BigDecimal
): void {
  let groupId = 0;
  let volumeThreshold = ZERO_BD;
  if (groupNumber == 0 && (pairNumber == 0 || pairNumber == 1)) {
    groupId = 0;
  } else if (groupNumber == 0 && pairNumber > 1) {
    groupId = 1;
  } else if (groupNumber == 1 || groupNumber == 8 || groupNumber == 9) {
    groupId = 2;
  } else if (groupNumber == 6 || groupNumber == 7) {
    groupId = 3;
  } else {
    groupId = 4;
  }

  // @todo Are we comparing against cumulative volume or just per trade? Needs to be cumulative for the epoch duration.
  if (groupId < 4) {
    volumeThreshold = VOLUME_THRESHOLDS[groupId];
    if (
      volume.ge(volumeThreshold) &&
      userWeeklyPoints.groupsTraded[groupId] == ZERO_BD
    ) {
      // @todo - daily points should be calculated independently than weekly? Wdyt...
      userDailyPoints.groupsTraded[groupId] = ONE_BD;
      protocolDailyPoints.groupsTraded[groupId] = ONE_BD;
      userWeeklyPoints.groupsTraded[groupId] = ONE_BD;
      protocolWeeklyPoints.groupsTraded[groupId] = ONE_BD;
      userBiweeklyPoints.groupsTraded[groupId] = ONE_BD;
      protocolBiweeklyPoints.groupsTraded[groupId] = ONE_BD;

      userDailyPoints.diversityPoints =
        userDailyPoints.diversityPoints.plus(ONE_BD);
      protocolDailyPoints.diversityPoints =
        protocolDailyPoints.diversityPoints.plus(ONE_BD);
      userWeeklyPoints.diversityPoints =
        userWeeklyPoints.diversityPoints.plus(ONE_BD);
      protocolWeeklyPoints.diversityPoints =
        protocolWeeklyPoints.diversityPoints.plus(ONE_BD);
      userBiweeklyPoints.diversityPoints =
        userBiweeklyPoints.diversityPoints.plus(ONE_BD);
      protocolBiweeklyPoints.diversityPoints =
        protocolBiweeklyPoints.diversityPoints.plus(ONE_BD);

      // Saving all the entities
      userDailyPoints.save();
      protocolDailyPoints.save();
      userWeeklyPoints.save();
      protocolWeeklyPoints.save();
      userBiweeklyPoints.save();
      protocolBiweeklyPoints.save();
    }
  }
}

export function calculateSkillPoints(
  userStat: EpochTradingPointsRecord,
  protocolStat: EpochTradingPointsRecord,
  pnl: BigDecimal,
  absolute: boolean
): BigDecimal {
  let userOldPnl = absolute ? userStat.pnl : userStat.pnlPercentage;
  let userNewPnl = userOldPnl.plus(pnl);
  let protocolOldPts = absolute
    ? protocolStat.absSkillPoints
    : protocolStat.relSkillPoints;
  let protocolNewPts = ZERO_BD;

  if (userNewPnl > ZERO_BD && userOldPnl > ZERO_BD) {
    protocolNewPts = protocolOldPts.minus(userOldPnl).plus(userNewPnl);
  } else if (userNewPnl > ZERO_BD && userOldPnl <= ZERO_BD) {
    protocolNewPts = protocolOldPts.plus(userNewPnl);
  } else if (userNewPnl < ZERO_BD && userOldPnl > ZERO_BD) {
    protocolNewPts = protocolOldPts.minus(userOldPnl);
  } else {
    protocolNewPts = protocolOldPts;
  }

  return protocolNewPts;
}

export function updateFeeBasedPoints(
  address: string,
  stat: BigDecimal,
  timestamp: i32,
  blockNumber: i32,
  collateral: string | null
): void {
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);
  const currentBiweeklyNumber = determineEpochNumber(
    timestamp,
    EPOCH_TYPE.BIWEEKLY
  );

  let userDailyStats = createOrLoadEpochTradingPointsRecord(
    address,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );

  let userWeeklyStats = createOrLoadEpochTradingPointsRecord(
    address,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );

  let userBiweeklyStats = createOrLoadEpochTradingPointsRecord(
    address,
    EPOCH_TYPE.BIWEEKLY,
    currentBiweeklyNumber,
    collateral,
    false
  );

  let dailyProtocolStats = createOrLoadEpochTradingPointsRecord(
    PROTOCOL,
    EPOCH_TYPE.DAY,
    currentDayNumber,
    collateral,
    false
  );

  let weeklyProtocolStats = createOrLoadEpochTradingPointsRecord(
    PROTOCOL,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateral,
    false
  );

  let biweeklyProtocolStats = createOrLoadEpochTradingPointsRecord(
    PROTOCOL,
    EPOCH_TYPE.BIWEEKLY,
    currentBiweeklyNumber,
    collateral,
    false
  );

  updateFeePoints(
    stat,
    userDailyStats,
    userWeeklyStats,
    userBiweeklyStats,
    dailyProtocolStats,
    weeklyProtocolStats,
    biweeklyProtocolStats,
    blockNumber
  );
  updateLoyaltyPoints(
    stat,
    userDailyStats,
    userWeeklyStats,
    userBiweeklyStats,
    dailyProtocolStats,
    weeklyProtocolStats,
    biweeklyProtocolStats
  );
}

export function updateFeePoints(
  stat: BigDecimal,
  userDailyStats: EpochTradingPointsRecord,
  userWeeklyStats: EpochTradingPointsRecord,
  userBiweeklyStats: EpochTradingPointsRecord,
  protocolDailyStats: EpochTradingPointsRecord,
  protocolWeeklyStats: EpochTradingPointsRecord,
  protocolBiweeklyStats: EpochTradingPointsRecord,
  blockNumber: i32
): void {
  // If referee, boost points
  const referrerDetails = isTraderReferredByWhitelistedReferral(
    dataSource.network(),
    Address.fromString(userDailyStats.address),
    protocolWeeklyStats.epochNumber
  );
  let referrerPointBoost = ZERO_BD;
  let refereePointBoost = ZERO_BD;
  if (referrerDetails.whitelisted) {
    referrerPointBoost = stat.times(WHITELISTED_REFERRER_MULTIPLIER);
    refereePointBoost = stat.times(WHITELISTED_REFEREE_MULTIPLIER);

    // Kick off adding stat x multiplier to referral entities as well
    const dailyReferralPoints = createOrLoadEpochTradingPointsRecord(
      referrerDetails.referrer,
      EPOCH_TYPE.DAY,
      userDailyStats.epochNumber,
      userDailyStats.collateral,
      false
    );

    const weeklyReferralPoints = createOrLoadEpochTradingPointsRecord(
      referrerDetails.referrer,
      EPOCH_TYPE.WEEK,
      userWeeklyStats.epochNumber,
      userWeeklyStats.collateral,
      false
    );

    const biweeklyReferralPoints = createOrLoadEpochTradingPointsRecord(
      referrerDetails.referrer,
      EPOCH_TYPE.BIWEEKLY,
      userBiweeklyStats.epochNumber,
      userBiweeklyStats.collateral,
      false
    );

    dailyReferralPoints.feePoints =
      dailyReferralPoints.feePoints.plus(referrerPointBoost);

    weeklyReferralPoints.feePoints =
      weeklyReferralPoints.feePoints.plus(referrerPointBoost);

    biweeklyReferralPoints.feePoints =
      biweeklyReferralPoints.feePoints.plus(referrerPointBoost);

    dailyReferralPoints.save();
    weeklyReferralPoints.save();
    biweeklyReferralPoints.save();
  }

  // Updating total fees
  userDailyStats.totalFeesPaid = userDailyStats.totalFeesPaid.plus(stat);
  userWeeklyStats.totalFeesPaid = userWeeklyStats.totalFeesPaid.plus(stat);
  userBiweeklyStats.totalFeesPaid = userBiweeklyStats.totalFeesPaid.plus(stat);
  protocolDailyStats.totalFeesPaid =
    protocolDailyStats.totalFeesPaid.plus(stat);
  protocolWeeklyStats.totalFeesPaid =
    protocolWeeklyStats.totalFeesPaid.plus(stat);
  protocolBiweeklyStats.totalFeesPaid =
    protocolBiweeklyStats.totalFeesPaid.plus(stat);

  // Updating fee points
  userDailyStats.feePoints = userDailyStats.feePoints.plus(
    stat.plus(refereePointBoost)
  );
  userWeeklyStats.feePoints = userWeeklyStats.feePoints.plus(
    stat.plus(refereePointBoost)
  );
  userBiweeklyStats.feePoints = userBiweeklyStats.feePoints.plus(
    stat.plus(refereePointBoost)
  );
  protocolDailyStats.feePoints = protocolDailyStats.feePoints.plus(
    stat.plus(referrerPointBoost).plus(refereePointBoost)
  );
  protocolWeeklyStats.feePoints = protocolWeeklyStats.feePoints.plus(
    stat.plus(referrerPointBoost).plus(refereePointBoost)
  );
  protocolBiweeklyStats.feePoints = protocolBiweeklyStats.feePoints.plus(
    stat.plus(referrerPointBoost).plus(refereePointBoost)
  );

  // Saving all the entities
  userDailyStats.save();
  protocolDailyStats.save();
  userWeeklyStats.save();
  protocolWeeklyStats.save();
  userBiweeklyStats.save();
  protocolBiweeklyStats.save();
}

export function updateLoyaltyPoints(
  stat: BigDecimal,
  userDailyStats: EpochTradingPointsRecord,
  userWeeklyStats: EpochTradingPointsRecord,
  userBiweeklyStats: EpochTradingPointsRecord,
  protocolDailyStats: EpochTradingPointsRecord,
  protocolWeeklyStats: EpochTradingPointsRecord,
  protocolBiweeklyStats: EpochTradingPointsRecord
): void {
  let totalUserDailyFees = userDailyStats.totalFeesPaid.plus(stat);
  let oldLoyaltyPoints = userDailyStats.loyaltyPoints;
  let newLoyaltyPoints = calculateLoyaltyPoints(totalUserDailyFees);

  // Updating loyalty points
  userDailyStats.loyaltyPoints = newLoyaltyPoints;
  userWeeklyStats.loyaltyPoints = userWeeklyStats.loyaltyPoints
    .plus(newLoyaltyPoints)
    .minus(oldLoyaltyPoints);
  userBiweeklyStats.loyaltyPoints = userBiweeklyStats.loyaltyPoints
    .plus(newLoyaltyPoints)
    .minus(oldLoyaltyPoints);
  protocolDailyStats.loyaltyPoints = protocolDailyStats.loyaltyPoints
    .plus(newLoyaltyPoints)
    .minus(oldLoyaltyPoints);
  protocolWeeklyStats.loyaltyPoints = protocolWeeklyStats.loyaltyPoints
    .plus(newLoyaltyPoints)
    .minus(oldLoyaltyPoints);
  protocolBiweeklyStats.loyaltyPoints = protocolBiweeklyStats.loyaltyPoints
    .plus(newLoyaltyPoints)
    .minus(oldLoyaltyPoints);

  // Saving all the entities
  userDailyStats.save();
  protocolDailyStats.save();
  userWeeklyStats.save();
  protocolWeeklyStats.save();
  userBiweeklyStats.save();
  protocolBiweeklyStats.save();
}

export function calculateLoyaltyPoints(fees: BigDecimal): BigDecimal {
  if (
    fees >= BigDecimal.fromString("8") &&
    fees < BigDecimal.fromString("40")
  ) {
    return BigDecimal.fromString("1");
  } else if (
    fees >= BigDecimal.fromString("40") &&
    fees < BigDecimal.fromString("200")
  ) {
    return BigDecimal.fromString("5");
  } else if (
    fees >= BigDecimal.fromString("200") &&
    fees < BigDecimal.fromString("400")
  ) {
    return BigDecimal.fromString("25");
  } else if (fees >= BigDecimal.fromString("400")) {
    return BigDecimal.fromString("50");
  } else {
    return BigDecimal.fromString("0");
  }
}

export function generateId(
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

export function createOrLoadEpochTradingPointsRecord(
  address: string,
  epochType: string,
  epochNumber: i32,
  collateral: string | null,
  save: boolean
): EpochTradingPointsRecord {
  log.info(
    "[createOrLoadEpochTradingPointsRecord] address {}, epochType {}, epochNumber {}, collateral {}",
    [
      address,
      epochType.toString(),
      epochNumber.toString(),
      collateral ? collateral : "_all_",
    ]
  );
  const id = generateId(address, epochType, epochNumber, collateral);
  let epochTradingPointsRecord = EpochTradingPointsRecord.load(id);
  if (epochTradingPointsRecord == null) {
    epochTradingPointsRecord = new EpochTradingPointsRecord(id);
    epochTradingPointsRecord.address = address;
    epochTradingPointsRecord.epochNumber = epochNumber;
    epochTradingPointsRecord.epochType = epochType;
    epochTradingPointsRecord.collateral = collateral
      ? collateral
      : COLLATERALS._ALL_;
    epochTradingPointsRecord.totalFeesPaid = BigDecimal.fromString("0");
    epochTradingPointsRecord.pnl = BigDecimal.fromString("0");
    epochTradingPointsRecord.pnlPercentage = BigDecimal.fromString("0");
    epochTradingPointsRecord.groupsTraded = [
      ZERO_BD,
      ZERO_BD,
      ZERO_BD,
      ZERO_BD,
    ];
    epochTradingPointsRecord.loyaltyPoints = BigDecimal.fromString("0");
    epochTradingPointsRecord.diversityPoints = BigDecimal.fromString("0");
    epochTradingPointsRecord.absSkillPoints = BigDecimal.fromString("0");
    epochTradingPointsRecord.relSkillPoints = BigDecimal.fromString("0");
    epochTradingPointsRecord.feePoints = BigDecimal.fromString("0");
    epochTradingPointsRecord.isAbsSkillEligible = false;
    epochTradingPointsRecord.isRelSkillEligible = false;
    if (save) {
      epochTradingPointsRecord.save();
    }
  }
  return epochTradingPointsRecord as EpochTradingPointsRecord;
}

const EPOCH_ELIGIBILITY_CHECK_START = 0;
export const TOTAL_CLOSED_TRADES_THRESHOLD_RELATIVE = 5;
export const TOTAL_CLOSED_DAYS_THRESHOLD_RELATIVE = 2;
function isTraderEligibleForRelativeSkillPoints(
  weeklyStats: EpochTradingStatsRecord
): boolean {
  if (weeklyStats.epochNumber < EPOCH_ELIGIBILITY_CHECK_START) {
    return true;
  }

  return (
    weeklyStats.totalClosedTrades >= TOTAL_CLOSED_TRADES_THRESHOLD_RELATIVE &&
    weeklyStats.totalDaysClosedTrades >= TOTAL_CLOSED_DAYS_THRESHOLD_RELATIVE
  );
}

export const TOTAL_CLOSED_TRADES_THRESHOLD_ABSOLUTE = 3;
export const TOTAL_CLOSED_DAYS_THRESHOLD_ABSOLUTE = 2;
function isTraderEligibleForAbsoluteSkillPoints(
  stats: EpochTradingStatsRecord
): boolean {
  if (stats.epochNumber < EPOCH_ELIGIBILITY_CHECK_START) {
    return true;
  }

  if (
    stats.epochNumber === 12 &&
    PNL_BLACKLISTED_ADDRESSES_12.includes(stats.address.toLowerCase())
  ) {
    return false;
  }

  if (
    stats.epochNumber === 50 &&
    PNL_BLACKLISTED_ADDRESSES_50_APECHAIN.includes(stats.address.toLowerCase())
  ) {
    return false;
  }

  if (
    stats.epochNumber === 39 &&
    stats.epochType === EPOCH_TYPE.BIWEEKLY &&
    PNL_BLACKLISTED_ADDRESSES_39_BIWEEKLY_BTCUSD.includes(
      stats.address.toLowerCase()
    )
  ) {
    return false;
  }

  return (
    stats.totalClosedTrades >= TOTAL_CLOSED_TRADES_THRESHOLD_ABSOLUTE &&
    stats.totalDaysClosedTrades >= TOTAL_CLOSED_DAYS_THRESHOLD_ABSOLUTE
  );
}
