import {
  BigDecimal,
  log,
  BigInt,
  dataSource,
  ethereum,
  Address,
  crypto,
  ByteArray,
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
} from "../../utils/access";
import {
  MarketExecuted,
  LimitExecuted,
  PositionSizeDecreaseExecuted,
  PositionSizeIncreaseExecuted,
  BorrowingFeeCharged,
  GovFeeCharged,
  ReferralFeeCharged,
  TriggerFeeCharged,
  GnsStakingFeeCharged,
  GTokenFeeCharged,
  MarketExecutedTStruct,
  LimitExecutedTStruct,
} from "../../types/GNSMultiCollatDiamond/GNSMultiCollatDiamond";

import {
  convertCollateralToDecimal,
  getGroupIndex,
  isTraderReferredByAggregator,
} from "../../utils/contract";
import { getCollateralPrice } from "../../utils/contract/GNSMultiCollatDiamond";
import {
  getCollateralDecimals,
  getCollateralfromIndex,
  hexToI32,
  isAltcoin,
} from "../../utils/constants";

const eventHash = crypto
  .keccak256(
    ByteArray.fromUTF8(
      "MarketOpenCanceled((address, uint32),indexed address,indexed uint256,uint8)"
    )
  )
  .toHexString();

const eventHash2 =
  "0x1d01fcc0e82c93f463da710266800aff752bf7da2435090b30616276602eb75a";

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

function getPairIndex(
  receipt: ethereum.TransactionReceipt,
  network: string
): boolean {
  const events = receipt.logs;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.topics[0].toHexString() == eventHash2) {
      const pairIx1 = hexToI32(event.topics[1].toHex());
      log.debug("[getPairIndex] hex: {} , pairIx1: {}", [
        event.topics[1].toHex(),
        pairIx1.toString(),
      ]);

      if (isAltcoin(network, pairIx1)) {
        return true;
      }
    }
  }
  return false;
}

class CollateralDetails {
  collateral: string;
  collateralToUsd: BigDecimal;
  network: string;
  collateralPrecisionBd: BigDecimal;
}

function getCollateralDetails(collateralIndex: i32): CollateralDetails {
  const network = dataSource.network();
  const collateral = getCollateralfromIndex(collateralIndex);
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
  if (!isAltcoin(collateralDetails.network, trade.pairIndex)) {
    log.debug("[handleMarketExecuted] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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
  if (!isAltcoin(collateralDetails.network, trade.pairIndex)) {
    log.debug("[handleLimitExecuted] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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

export function handleBorrowingFeeCharged(event: BorrowingFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  if (
    !getPairIndex(
      event.receipt as ethereum.TransactionReceipt,
      collateralDetails.network
    )
  ) {
    log.debug("[handleBorrowingFeeCharged] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const trader = event.params.trader.toHexString();
  const borrowingFee = convertCollateralToDecimal(
    event.params.amountCollateral,
    collateralDetails.collateralPrecisionBd
  );
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleBorrowingFeeCharged] {}", [
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
  if (
    !getPairIndex(
      event.receipt as ethereum.TransactionReceipt,
      collateralDetails.network
    )
  ) {
    log.debug("[handleGovFeeCharged] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
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
  if (
    !getPairIndex(
      event.receipt as ethereum.TransactionReceipt,
      collateralDetails.network
    )
  ) {
    log.debug("[handleReferralFeeCharged] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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
  if (
    !getPairIndex(
      event.receipt as ethereum.TransactionReceipt,
      collateralDetails.network
    )
  ) {
    log.debug("[handleTriggerFeeCharged] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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

export function handleStakerFeeCharged(event: GnsStakingFeeCharged): void {
  const collateralDetails = getCollateralDetails(event.params.collateralIndex);
  if (
    !getPairIndex(
      event.receipt as ethereum.TransactionReceipt,
      collateralDetails.network
    )
  ) {
    log.debug("[handleStakerFeeCharged] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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
  if (
    !getPairIndex(
      event.receipt as ethereum.TransactionReceipt,
      collateralDetails.network
    )
  ) {
    log.debug("[handleLpFeeCharged] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
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
      event
    );
  }
}

function _handleTradeIncreased(
  trader: Address,
  pairIndex: BigInt,
  positionSize: BigInt,
  collateralIndex: i32,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  if (!isAltcoin(collateralDetails.network, pairIndex.toI32())) {
    log.debug("[handleTradeIncreased] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const volume = convertCollateralToDecimal(
    positionSize,
    collateralDetails.collateralPrecisionBd
  );

  log.info("[handleTradeIncreased] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trader)) {
    log.info("[handleTradeIncreased] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
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
      event.params.values.borrowingFeeCollateral,
      event.params.values.gnsStakingFeeCollateral,
      event.params.values.vaultFeeCollateral,
      event.params.values.existingPnlCollateral,
      event.params.values.positionSizeCollateralDelta,
      event.params.values.existingPositionSizeCollateral,
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
  borrowingFeeCollateral: BigInt,
  gnsStakingFeeCollateral: BigInt,
  vaultFeeCollateral: BigInt,
  existingPnlCollateral: BigInt,
  positionSizeCollateralDelta: BigInt,
  existingPositionSizeCollateral: BigInt,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  if (!isAltcoin(collateralDetails.network, pairIndex.toI32())) {
    log.debug("[handleTradeDecreased] Not altcoin, skipping {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }
  const totalFees = gnsStakingFeeCollateral
    .plus(vaultFeeCollateral)
    .plus(borrowingFeeCollateral);
  // pnl  = (existingPnlCollateral*positionSizeCollateralDelta/existingPositionSizeCollateral) - borrowingFee
  const pnlWithFees = existingPnlCollateral
    .times(positionSizeCollateralDelta)
    .div(existingPositionSizeCollateral);
  const pnlWithoutFees = pnlWithFees.minus(totalFees);
  // in this case, collateralSentToTrader means pnl
  const collateralSentToTrader = convertCollateralToDecimal(
    pnlWithoutFees,
    collateralDetails.collateralPrecisionBd
  );
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
    collateralSentToTrader,
    true
  );
}
