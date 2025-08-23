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
  GnsOtcFeeCharged,
  GTokenFeeCharged,
  MarketExecutedTStruct,
  LimitExecutedTStruct,
} from "../../types/GNSMultiCollatDiamond_v9/GNSMultiCollatDiamond_v9";

import {
  convertCollateralToDecimal,
  getGroupIndex,
  isTraderReferredByAggregator,
} from "../../utils/contract";
import { getCollateralPrice } from "../../utils/contract/GNSMultiCollatDiamond";
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
      event.params.values.borrowingFeeCollateral,
      event.params.values.closingFeeCollateral,
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
  closingFeeCollateral: BigInt,
  existingPnlCollateral: BigInt,
  positionSizeCollateralDelta: BigInt,
  existingPositionSizeCollateral: BigInt,
  event: ethereum.Event
): void {
  const collateralDetails = getCollateralDetails(collateralIndex);
  const totalFees = closingFeeCollateral.plus(borrowingFeeCollateral);
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
    collateralSentToTrader,
    true
  );
}
