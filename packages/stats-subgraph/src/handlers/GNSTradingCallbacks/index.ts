import {
  BigDecimal,
  log,
  BigInt,
  dataSource,
  ethereum,
  Address,
  crypto,
  ByteArray,
  Bytes,
} from "@graphprotocol/graph-ts";
import {
  addBorrowingFeeStats,
  addCloseTradeStats,
  addGovFeeStats,
  addLpFeeStats,
  addOpenTradeStats,
  addReferralFeeStats,
  addStakerFeeStats,
  addTriggerFeeStats,
  updateFeeBasedPoints,
  addPnlWithdrawnStats,
  updatePointsOnClose,
  createOrLoadEpochTradingStatsRecord,
} from "../../utils/access";
import {
  MarketExecuted,
  LimitExecuted,
  PositionSizeDecreaseExecuted,
  PositionSizeIncreaseExecuted,
  GovFeeCharged,
  ReferralFeeCharged,
  TriggerFeeCharged,
  GnsOtcFeeCharged,
  GTokenFeeCharged,
  MarketExecutedTStruct,
  LimitExecutedTStruct,
  HoldingFeesChargedOnTrade,
  HoldingFeesRealizedOnTrade,
  TradePositivePnlWithdrawn,
} from "../../types/GNSMultiCollatDiamond/GNSMultiCollatDiamond";

import {
  convertCollateralToDecimal,
  getGroupIndex,
  isTraderReferredByAggregator,
} from "../../utils/contract";
import {
  getCollateralPrice,
  getTrade,
} from "../../utils/contract/GNSMultiCollatDiamond";
import {
  getCollateralDecimals,
  getCollateralfromIndex,
  MARKET_EXECUTED_HASH,
  LIMIT_EXECUTED_HASH,
  MARKET_EXECUTED_ABI_SIGNATURE,
  LIMIT_EXECUTED_ABI_SIGNATURE,
  MIN_LEVERAGE,
  NETWORKS,
  COLLATERALS,
  BLOCKED_LIMIT_TRANSACTION_HASHES,
  ZERO_BD,
  determineEpochNumber,
  EPOCH_TYPE,
} from "../../utils/constants";

const eventHash = crypto
  .keccak256(
    ByteArray.fromUTF8(
      "MarketOpenCanceled((address, uint32),indexed address,indexed uint256,uint8)"
    )
  )
  .toHexString();

function wasTradeOpenCanceled(receipt: ethereum.TransactionReceipt): boolean {
  const events = receipt.logs;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.topics[0].toHexString() == eventHash) {
      return true;
    }
  }
  return false;
}

function isCollateralEligible(network: string, collateral: string): boolean {
  // On Base network, only BTCUSD is eligible for rewards
  if (network == NETWORKS.BASE) {
    return collateral == COLLATERALS.BTCUSD;
  }
  // All collaterals are eligible on other networks
  return true;
}

function getLeverage(receipt: ethereum.TransactionReceipt): boolean {
  return true;

  // Support all leverages for now
  const events = receipt.logs;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    let leverage: i32 = 0;

    if (event.topics[0].toHexString() == MARKET_EXECUTED_HASH) {
      leverage = extractLeverage(event.data, MARKET_EXECUTED_ABI_SIGNATURE);

      log.info("[leverageFromMarketExecuted] Transaction: {}, Leverage: {}", [
        event.transactionHash.toHexString(),
        leverage.toString(),
      ]);
    } else if (event.topics[0].toHexString() == LIMIT_EXECUTED_HASH) {
      leverage = extractLeverage(event.data, LIMIT_EXECUTED_ABI_SIGNATURE);

      log.info("[leverageFromLimitExecuted] Transaction: {}, Leverage: {}", [
        event.transactionHash.toHexString(),
        leverage.toString(),
      ]);
    }

    if (leverage >= MIN_LEVERAGE) {
      return true;
    }
  }
  return false;
}

function extractLeverage(data: Bytes, abiSignature: string): i32 {
  let decoded = ethereum.decode(abiSignature, data);

  if (decoded) {
    let result = decoded.toTuple();
    let tradeTuple = result[1].toTuple();
    let leverage = tradeTuple[3].toI32();
    let normalizedLeverage = leverage / 1000;

    log.info("Decoded and normalized leverage: {}", [
      normalizedLeverage.toString(),
    ]);

    return normalizedLeverage;
  } else {
    log.error("Failed to decode event data", []);
    return 0;
  }
}

class CollateralDetails {
  collateral: string;
  collateralToUsd: BigDecimal;
  network: string;
  collateralPrecisionBd: BigDecimal;
}

function getCollateralDetails(collateralIndex: i32): CollateralDetails {
  const network = dataSource.network();
  const collateral = getCollateralfromIndex(network, collateralIndex);
  const collateralToUsd = getCollateralPrice(network, collateralIndex);
  const collateralPrecisionBd = getCollateralDecimals(collateral);
  return { collateral, collateralToUsd, network, collateralPrecisionBd };
}

export function handleMarketExecuted(event: MarketExecuted): void {
  _handleMarketExecuted(
    event.params.t,
    event.params.open,
    event.params.amountSentToTrader,
    event.params.t.collateralIndex,
    event
  );
}

function _handleMarketExecuted(
  trade: MarketExecutedTStruct,
  open: boolean,
  daiSentToTrader: BigInt,
  collateralIndex: i32,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  const collateralSentToTrader = convertCollateralToDecimal(
    daiSentToTrader,
    collateralDetails.collateralPrecisionBd
  );
  const leverage_raw = BigDecimal.fromString(trade.leverage.toString());
  const leverage = leverage_raw.div(BigDecimal.fromString("1000"));
  const volume = convertCollateralToDecimal(
    trade.collateralAmount,
    collateralDetails.collateralPrecisionBd
  ).times(leverage);

  log.info("[handleMarketExecuted] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trade.user)) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (leverage.lt(BigDecimal.fromString(MIN_LEVERAGE.toString()))) {
    log.info(
      "[handleMarketExecuted] Leverage less than 20, skipping . Transaction: {}, Leverage: {}",
      [event.transaction.hash.toHexString(), leverage.toString()]
    );
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleMarketExecuted] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  if (open) {
    _handleOpenTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.user.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.user.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      event.block.number.toI32(),
      collateralSentToTrader,
      false
    );
  }
}

export function handleLimitExecuted(event: LimitExecuted): void {
  // Check if this transaction should be blocked
  const txHash = event.transaction.hash.toHexString().toLowerCase();
  if (BLOCKED_LIMIT_TRANSACTION_HASHES.includes(txHash)) {
    log.info("[handleLimitExecuted] Blocked transaction: {}", [txHash]);
    return;
  }

  _handleLimitExecuted(
    event.params.t,
    event.params.orderType,
    event.params.amountSentToTrader,
    event.params.t.collateralIndex,
    event
  );
}

function _handleLimitExecuted(
  trade: LimitExecutedTStruct,
  orderType: i32,
  daiSentToTrader: BigInt,
  collateralIndex: i32,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  const collateralSentToTrader = convertCollateralToDecimal(
    daiSentToTrader,
    collateralDetails.collateralPrecisionBd
  );
  const leverage_raw = BigDecimal.fromString(trade.leverage.toString());
  const leverage = leverage_raw.div(BigDecimal.fromString("1000"));
  const volume = convertCollateralToDecimal(
    trade.collateralAmount,
    collateralDetails.collateralPrecisionBd
  ).times(leverage);
  log.info("[handleLimitExecuted] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trade.user)) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (leverage.lt(BigDecimal.fromString(MIN_LEVERAGE.toString()))) {
    log.info(
      "[handleLimitExecuted] Leverage less than 20, skipping . Transaction: {}, Leverage: {}",
      [event.transaction.hash.toHexString(), leverage.toString()]
    );
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleLimitExecuted] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  if (orderType == 0 || orderType == 2 || orderType == 3) {
    _handleOpenTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.user.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.user.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      event.block.number.toI32(),
      collateralSentToTrader,
      false
    );
  }
}

/**
 * @dev borrowingFee now represents total holding fees charged on trade
 */
export function handleHoldingFeeCharged(
  event: HoldingFeesChargedOnTrade
): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const borrowingFee = convertCollateralToDecimal(
    event.params.tradeHoldingFees.totalFeeCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleHoldingFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleHoldingFeeCharged] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleHoldingFeeCharged] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleHoldingFeeCharged] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  addBorrowingFeeStats(
    trader,
    borrowingFee,
    timestamp,
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const borrowingFeeUsd = borrowingFee.times(collateralDetails.collateralToUsd);
  addBorrowingFeeStats(trader, borrowingFeeUsd, timestamp, null);
}

/**
 * @dev borrowingFee now represents total holding fees charged on trade
 */
export function handleHoldingFeeRealized(
  event: HoldingFeesRealizedOnTrade
): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const borrowingFee = convertCollateralToDecimal(
    event.params.tradeHoldingFees.totalFeeCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleHoldingFeeRealized] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleHoldingFeeRealized] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleHoldingFeeRealized] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleHoldingFeeRealized] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  addBorrowingFeeStats(
    trader,
    borrowingFee,
    timestamp,
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const borrowingFeeUsd = borrowingFee.times(collateralDetails.collateralToUsd);
  addBorrowingFeeStats(trader, borrowingFeeUsd, timestamp, null);
}

export function handleGovFeeCharged(event: GovFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const govFee = convertCollateralToDecimal(
    event.params.amountCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleGovFeeCharged] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleGovFeeCharged] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleGovFeeCharged] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  log.info("[handleGovFeeCharged] {}", [event.transaction.hash.toHexString()]);
  addGovFeeStats(trader, govFee, timestamp, collateralDetails.collateral);

  // Calculate and add normalized stats
  const govFeeUsd = govFee.times(collateralDetails.collateralToUsd);
  addGovFeeStats(trader, govFeeUsd, timestamp, null);

  // Confirm the trade was not canceled before adding points
  if (wasTradeOpenCanceled(event.receipt as ethereum.TransactionReceipt)) {
    log.info("[handleGovFeeCharged] Trade canceled, not adding points {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  updateFeeBasedPoints(
    trader,
    govFeeUsd,
    timestamp,
    event.block.number.toI32(),
    null
  );
  updateFeeBasedPoints(
    trader,
    govFee,
    timestamp,
    event.block.number.toI32(),
    collateralDetails.collateral
  );
}

export function handleReferralFeeCharged(event: ReferralFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const referralFee = convertCollateralToDecimal(
    event.params.amountCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleReferralFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleReferralFeeCharged] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleReferralFeeCharged] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  addReferralFeeStats(
    trader,
    referralFee,
    timestamp,
    collateralDetails.collateral
  );
  updateFeeBasedPoints(
    trader,
    referralFee,
    timestamp,
    event.block.number.toI32(),
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const referralFeeUsd = referralFee.times(collateralDetails.collateralToUsd);
  addReferralFeeStats(trader, referralFeeUsd, timestamp, null);
  updateFeeBasedPoints(
    trader,
    referralFeeUsd,
    timestamp,
    event.block.number.toI32(),
    null
  );
}

export function handleTriggerFeeCharged(event: TriggerFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const triggerFee = convertCollateralToDecimal(
    event.params.amountCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleTriggerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleTriggerFeeCharged] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleTriggerFeeCharged] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  addTriggerFeeStats(
    trader,
    triggerFee,
    timestamp,
    collateralDetails.collateral
  );
  updateFeeBasedPoints(
    trader,
    triggerFee,
    timestamp,
    event.block.number.toI32(),
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const triggerFeeUsd = triggerFee.times(collateralDetails.collateralToUsd);
  addTriggerFeeStats(trader, triggerFeeUsd, timestamp, null);
  updateFeeBasedPoints(
    trader,
    triggerFeeUsd,
    timestamp,
    event.block.number.toI32(),
    null
  );
}

export function handleStakerFeeCharged(event: GnsOtcFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const stakerFee = convertCollateralToDecimal(
    event.params.amountCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleStakerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleStakerFeeCharged] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleStakerFeeCharged] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  addStakerFeeStats(trader, stakerFee, timestamp, collateralDetails.collateral);
  updateFeeBasedPoints(
    trader,
    stakerFee,
    timestamp,
    event.block.number.toI32(),
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const stakerFeeUsd = stakerFee.times(collateralDetails.collateralToUsd);
  addStakerFeeStats(trader, stakerFeeUsd, timestamp, null);
  updateFeeBasedPoints(
    trader,
    stakerFeeUsd,
    timestamp,
    event.block.number.toI32(),
    null
  );
}

export function handleLpFeeCharged(event: GTokenFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const lpFee = convertCollateralToDecimal(
    event.params.amountCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleLpFeeCharged] {}", [event.transaction.hash.toHexString()]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (!getLeverage(event.receipt as ethereum.TransactionReceipt)) {
    log.debug("[handleLpFeeCharged] Leverage less than 20, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleLpFeeCharged] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  addLpFeeStats(trader, lpFee, timestamp, collateralDetails.collateral);
  updateFeeBasedPoints(
    trader,
    lpFee,
    timestamp,
    event.block.number.toI32(),
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const lpFeeUsd = lpFee.times(collateralDetails.collateralToUsd);
  addLpFeeStats(trader, lpFeeUsd, timestamp, null);
  updateFeeBasedPoints(
    trader,
    lpFeeUsd,
    timestamp,
    event.block.number.toI32(),
    null
  );
}

function _handleOpenTrade(
  network: string,
  collateral: string,
  collateralToUsd: BigDecimal,
  trader: string,
  pairIndex: i32,
  positionSize: BigDecimal,
  timestamp: i32
): void {
  const groupIndex = getGroupIndex(network, BigInt.fromI32(pairIndex));
  // Add collateral specific stats
  addOpenTradeStats({
    collateral,
    address: trader,
    pairIndex,
    groupIndex: groupIndex.toI32(),
    positionSize,
    timestamp,
  });

  // Calculate and add normalized stats
  const positionSizeUsd = positionSize.times(collateralToUsd);
  addOpenTradeStats({
    collateral: null,
    address: trader,
    pairIndex,
    groupIndex: groupIndex.toI32(),
    positionSize: positionSizeUsd,
    timestamp,
  });
}

function _handleCloseTrade(
  network: string,
  collateral: string,
  collateralToUsd: BigDecimal,
  trader: string,
  pairIndex: i32,
  leverage: BigDecimal,
  positionSize: BigDecimal,
  timestamp: i32,
  blockNumber: i32,
  collateralSentToTrader: BigDecimal,
  isDecreaseTrade: boolean
): void {
  log.info("[_handleCloseTrade] [one] {} {} {} {} {} {} {} {} {}", [
    network,
    collateral,
    collateralToUsd.toString(),
    trader,
    pairIndex.toString(),
    leverage.toString(),
    positionSize.toString(),
    timestamp.toString(),
    blockNumber.toString(),
  ]);
  const groupIndex = getGroupIndex(network, BigInt.fromI32(pairIndex));
  const initialCollateral = positionSize.div(leverage);
  const pnl =
    isDecreaseTrade == false
      ? collateralSentToTrader.minus(initialCollateral)
      : collateralSentToTrader;
  const pnlPercentage = pnl
    .div(initialCollateral)
    .times(BigDecimal.fromString("100"));
  log.info("[_handleCloseTrade] [two] {} {} {} {}", [
    pnl.toString(),
    groupIndex.toString(),
    initialCollateral.toString(),
    pnlPercentage.toString(),
    collateralToUsd.toString(),
  ]);
  // Add collateral specific stats
  addCloseTradeStats({
    collateral,
    address: trader,
    pairIndex,
    groupIndex: groupIndex.toI32(),
    positionSize,
    pnl,
    pnlPercentage,
    timestamp,
  });

  // Calculate and add normalized stats
  const positionSizeUsd = positionSize.times(collateralToUsd);
  const pnlUsd = pnl.times(collateralToUsd);
  addCloseTradeStats({
    collateral: null,
    address: trader,
    pairIndex: pairIndex,
    groupIndex: groupIndex.toI32(),
    positionSize: positionSizeUsd,
    pnl: pnlUsd,
    pnlPercentage,
    timestamp,
  });
}

export function handleTradeIncreased(
  event: PositionSizeIncreaseExecuted
): void {
  if (event.params.cancelReason == 0) {
    _handleTradeIncreased(
      event.params.trader,
      event.params.pairIndex,
      event.params.values.positionSizeCollateralDelta,
      event.params.collateralIndex,
      event.params.values.newLeverage,
      event
    );
  }
}

function _handleTradeIncreased(
  trader: Address,
  pairIndex: BigInt,
  positionSize: BigInt,
  collateralIndex: i32,
  newLeverage: BigInt,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  const volume = convertCollateralToDecimal(
    positionSize,
    collateralDetails.collateralPrecisionBd
  );
  const leverage_raw = BigDecimal.fromString(newLeverage.toString());
  const leverage = leverage_raw.div(BigDecimal.fromString("1000"));

  log.info("[handleTradeIncreased] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trader)) {
    log.info("[handleTradeIncreased] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (leverage.lt(BigDecimal.fromString(MIN_LEVERAGE.toString()))) {
    log.info(
      "[handleTradeIncreased] Leverage less than 20, skipping . Transaction: {}, Leverage: {}",
      [event.transaction.hash.toHexString(), leverage.toString()]
    );
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleTradeIncreased] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  _handleOpenTrade(
    collateralDetails.network,
    collateralDetails.collateral,
    collateralDetails.collateralToUsd,
    trader.toHexString(),
    pairIndex.toI32(),
    volume,
    event.block.timestamp.toI32()
  );
}

export function handleTradeDecreased(
  event: PositionSizeDecreaseExecuted
): void {
  if (event.params.cancelReason == 0) {
    _handleTradeDecreased(
      event.params.trader,
      event.params.pairIndex,
      event.params.leverageDelta,
      event.params.collateralIndex,
      event.params.values.newLeverage,
      event.params.values.closingFeeCollateral,
      event.params.values.collateralSentToTrader,
      event.params.values.positionSizeCollateralDelta,
      event.params.values.partialNetPnlCollateral,
      event
    );
  }
}

function _handleTradeDecreased(
  trader: Address,
  pairIndex: BigInt,
  leverageDelta: BigInt,
  collateralIndex: i32,
  newLeverage: i32,
  closingFeeCollateral: BigInt,
  _collateralSentToTrader: BigInt,
  positionSizeCollateralDelta: BigInt,
  partialNetPnlCollateral: BigInt,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  // net pnl  = partialNetPnlCollateral - closingFeeCollateral
  const netPnlCollateral = partialNetPnlCollateral.minus(closingFeeCollateral);

  // If delta leverage is 0, we use existing leverage, otherwise delta leverage
  const levDelta =
    leverageDelta != BigInt.fromI32(0)
      ? leverageDelta
      : BigInt.fromI32(newLeverage);
  const leverage_raw = BigDecimal.fromString(levDelta.toString());
  const leverage = leverage_raw.div(BigDecimal.fromString("1000"));
  const volume = convertCollateralToDecimal(
    positionSizeCollateralDelta,
    collateralDetails.collateralPrecisionBd
  );
  log.info("[handleTradeDecreased] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trader)) {
    log.info("[handleTradeDecreased] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const new_leverage_raw = BigDecimal.fromString(newLeverage.toString());
  const new_leverage = new_leverage_raw.div(BigDecimal.fromString("1000"));
  if (new_leverage.lt(BigDecimal.fromString(MIN_LEVERAGE.toString()))) {
    log.info(
      "[handleTradeDecreased] Leverage less than 20, skipping . Transaction: {}, Leverage: {}",
      [event.transaction.hash.toHexString(), leverage.toString()]
    );
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleTradeDecreased] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  _handleCloseTrade(
    collateralDetails.network,
    collateralDetails.collateral,
    collateralDetails.collateralToUsd,
    trader.toHexString(),
    pairIndex.toI32(),
    leverage,
    volume,
    event.block.timestamp.toI32(),
    event.block.number.toI32(),
    // use netPnlCollateral as collateralSentToTrader
    convertCollateralToDecimal(
      netPnlCollateral,
      collateralDetails.collateralPrecisionBd
    ),
    true
  );
}

export function handleTradePositivePnlWithdrawn(
  event: TradePositivePnlWithdrawn
): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  const trader = event.params.trader.toHexString();
  const pnlWithdrawnCollateral = convertCollateralToDecimal(
    event.params.pnlWithdrawnCollateral,
    collateralDetails.collateralPrecisionBd
  );

  // Fetch the trade to get the initial collateral amount
  const trade = getTrade(
    collateralDetails.network,
    Address.fromString(trader),
    event.params.index
  );

  if (trade == null) {
    log.error(
      "[handleTradePositivePnlWithdrawn] Trade not found for trader {} index {}",
      [trader, event.params.index.toString()]
    );
    return;
  }

  // Calculate PNL percentage the same way as in _handleCloseTrade
  const initialCollateral = convertCollateralToDecimal(
    trade.collateralAmount,
    collateralDetails.collateralPrecisionBd
  );

  const pnlPercentageWithdrawn = pnlWithdrawnCollateral
    .div(initialCollateral)
    .times(BigDecimal.fromString("100"));

  const timestamp = event.block.timestamp.toI32();

  log.info("[handleTradePositivePnlWithdrawn] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader)
    )
  ) {
    log.info("[handleTradePositivePnlWithdrawn] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (
    !isCollateralEligible(
      collateralDetails.network,
      collateralDetails.collateral
    )
  ) {
    log.info(
      "[handleTradePositivePnlWithdrawn] Collateral not eligible for rewards. Network: {}, Collateral: {}",
      [collateralDetails.network, collateralDetails.collateral]
    );
    return;
  }

  // Add PNL withdrawn to stats without treating it as a trade close
  addPnlWithdrawnStats(
    trader,
    pnlWithdrawnCollateral,
    pnlPercentageWithdrawn,
    timestamp,
    collateralDetails.collateral
  );

  // Calculate and add normalized stats
  const pnlWithdrawnUsd = pnlWithdrawnCollateral.times(
    collateralDetails.collateralToUsd
  );
  addPnlWithdrawnStats(
    trader,
    pnlWithdrawnUsd,
    pnlPercentageWithdrawn,
    timestamp,
    null
  );

  // Update points based on the withdrawn PnL
  const currentDayNumber = determineEpochNumber(timestamp, EPOCH_TYPE.DAY);
  const currentWeekNumber = determineEpochNumber(timestamp, EPOCH_TYPE.WEEK);
  const currentBiweeklyNumber = determineEpochNumber(
    timestamp,
    EPOCH_TYPE.BIWEEKLY
  );
  const groupIndex = getGroupIndex(
    collateralDetails.network,
    BigInt.fromI32(trade.pairIndex)
  ).toI32();
  const volume = convertCollateralToDecimal(
    trade.collateralAmount.times(BigInt.fromI32(trade.leverage)),
    collateralDetails.collateralPrecisionBd
  );

  // Load stats records for points calculation
  const weeklyStats = createOrLoadEpochTradingStatsRecord(
    trader,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    collateralDetails.collateral,
    false
  );
  const biweeklyStats = createOrLoadEpochTradingStatsRecord(
    trader,
    EPOCH_TYPE.BIWEEKLY,
    currentBiweeklyNumber,
    collateralDetails.collateral,
    false
  );

  // Update points for collateral-specific stats
  updatePointsOnClose(
    trader,
    currentWeekNumber,
    currentDayNumber,
    currentBiweeklyNumber,
    collateralDetails.collateral,
    pnlWithdrawnCollateral,
    pnlPercentageWithdrawn,
    groupIndex,
    trade.pairIndex,
    volume,
    weeklyStats,
    biweeklyStats
  );

  // Load USD stats records
  const weeklyStatsUsd = createOrLoadEpochTradingStatsRecord(
    trader,
    EPOCH_TYPE.WEEK,
    currentWeekNumber,
    null,
    false
  );
  const biweeklyStatsUsd = createOrLoadEpochTradingStatsRecord(
    trader,
    EPOCH_TYPE.BIWEEKLY,
    currentBiweeklyNumber,
    null,
    false
  );

  // Update points for USD-normalized stats
  const volumeUsd = volume.times(collateralDetails.collateralToUsd);
  updatePointsOnClose(
    trader,
    currentWeekNumber,
    currentDayNumber,
    currentBiweeklyNumber,
    null, // USD stats
    pnlWithdrawnUsd,
    pnlPercentageWithdrawn,
    groupIndex,
    trade.pairIndex,
    volumeUsd,
    weeklyStatsUsd,
    biweeklyStatsUsd
  );
}
