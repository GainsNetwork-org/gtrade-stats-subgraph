import {
  BigDecimal,
  log,
  BigInt,
  dataSource,
  ethereum,
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
  BorrowingFeeCharged,
  GovFeeCharged,
  ReferralFeeCharged,
  TriggerFeeCharged,
  SssFeeCharged,
  DaiVaultFeeCharged,
} from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";
import {
  convertDaiToDecimal,
  getCollateralFromCallbacksAddress,
  getGroupIndex,
} from "../../utils/contract";
import { getCollateralPrice } from "../../utils/contract/GNSPriceAggregator";

function getCollateralDetails(event: ethereum.Event) {
  const network = dataSource.network();
  const collateral = getCollateralFromCallbacksAddress(
    network,
    event.address.toHexString()
  );
  const collateralToUsd = getCollateralPrice(dataSource.network(), collateral);
  return { collateral, collateralToUsd, network };
}

export function handleMarketExecuted(event: MarketExecuted): void {
  const { collateral, collateralToUsd, network } = getCollateralDetails(event);
  const trade = event.params.t;
  const open = event.params.open;
  const collateralSentToTrader = convertDaiToDecimal(
    event.params.daiSentToTrader
  );
  const positionSizeDai = convertDaiToDecimal(event.params.positionSizeDai);
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDaiToDecimal(trade.positionSizeDai).times(leverage);

  log.info("[handleMarketExecuted] {}", [event.transaction.hash.toHexString()]);

  if (open) {
    _handleOpenTrade(
      network,
      collateral,
      collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      network,
      collateral,
      collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      collateralSentToTrader
    );
  }
}

export function handleLimitExecuted(event: LimitExecuted): void {
  const { collateral, collateralToUsd, network } = getCollateralDetails(event);
  const trade = event.params.t;
  const orderType = event.params.orderType;
  const collateralSentToTrader = convertDaiToDecimal(
    event.params.daiSentToTrader
  );
  const positionSizeDai = convertDaiToDecimal(event.params.positionSizeDai); // Pos size less fees on close
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDaiToDecimal(trade.positionSizeDai).times(leverage);
  log.info("[handleLimitExecuted] {}", [event.transaction.hash.toHexString()]);
  if (orderType == 3) {
    _handleOpenTrade(
      network,
      collateral,
      collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      network,
      collateral,
      collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      collateralSentToTrader
    );
  }
}

export function handleBorrowingFeeCharged(event: BorrowingFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const borrowingFee = convertDaiToDecimal(event.params.feeValueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleBorrowingFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addBorrowingFeeStats(trader, borrowingFee, timestamp);
}

export function handleGovFeeCharged(event: GovFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const govFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleGovFeeCharged] {}", [event.transaction.hash.toHexString()]);
  addGovFeeStats(trader, govFee, timestamp);
  updateFeeBasedPoints(trader, govFee, timestamp);
}

export function handleReferralFeeCharged(event: ReferralFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const referralFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleReferralFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addReferralFeeStats(trader, referralFee, timestamp);
  updateFeeBasedPoints(trader, referralFee, timestamp);
}

export function handleTriggerFeeCharged(event: TriggerFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const triggerFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleTriggerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addTriggerFeeStats(trader, triggerFee, timestamp);
  updateFeeBasedPoints(trader, triggerFee, timestamp);
}

export function handleStakerFeeCharged(event: SssFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const stakerFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleStakerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addStakerFeeStats(trader, stakerFee, timestamp);
  updateFeeBasedPoints(trader, stakerFee, timestamp);
}

export function handleLpFeeCharged(event: DaiVaultFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const lpFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleLpFeeCharged] {}", [event.transaction.hash.toHexString()]);
  addLpFeeStats(trader, lpFee, timestamp);
  updateFeeBasedPoints(trader, lpFee, timestamp);
}

function _handleOpenTrade(
  network: string,
  collateral: string,
  collateralToUsd: BigDecimal,
  trader: string,
  pairIndex: BigInt,
  positionSize: BigDecimal,
  timestamp: i32
): void {
  const groupIndex = getGroupIndex(network, collateral, pairIndex).toI32();
  // Add collateral specific stats
  addOpenTradeStats({
    collateral,
    address: trader,
    pairIndex: pairIndex.toI32(),
    groupIndex,
    positionSize,
    timestamp,
  });

  // Calculate and add normalized stats
  const positionSizeUsd = positionSize.times(collateralToUsd);
  addOpenTradeStats({
    collateral: null,
    address: trader,
    pairIndex: pairIndex.toI32(),
    groupIndex,
    positionSize: positionSizeUsd,
    timestamp,
  });
}

function _handleCloseTrade(
  network: string,
  collateral: string,
  collateralToUsd: BigDecimal,
  trader: string,
  pairIndex: BigInt,
  leverage: BigDecimal,
  positionSize: BigDecimal,
  timestamp: i32,
  collateralSentToTrader: BigDecimal
): void {
  const groupIndex = getGroupIndex(network, collateral, pairIndex).toI32();
  const initialCollateral = positionSize.div(leverage);
  const pnl = collateralSentToTrader.minus(initialCollateral);
  const pnlPercentage = pnl
    .div(initialCollateral)
    .times(BigDecimal.fromString("100"));

  // Add collateral specific stats
  addCloseTradeStats({
    collateral,
    address: trader,
    pairIndex: pairIndex.toI32(),
    groupIndex,
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
    pairIndex: pairIndex.toI32(),
    groupIndex,
    positionSize: positionSizeUsd,
    pnl: pnlUsd,
    pnlPercentage,
    timestamp,
  });
}
