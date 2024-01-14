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
  isTraderReferredByAggregator,
} from "../../utils/contract";
import { getCollateralPrice } from "../../utils/contract/GNSPriceAggregator";
import { NETWORKS } from "../../utils/constants";

const startArbitrumBlock = 167165039; // Jan-05-2024 12:00:00 AM +UTC
const eventHash = crypto
  .keccak256(
    ByteArray.fromUTF8("MarketOpenCanceled(uint256,address,uint256,uint8)")
  )
  .toHexString();
function wasTradeOpenCanceled(receipt: ethereum.TransactionReceipt): boolean {
  // Only start checking for canceled trades at this block on Arb where there are active rewards
  if (
    receipt.blockNumber.toI32() < startArbitrumBlock &&
    dataSource.network() == NETWORKS.ARBITRUM
  ) {
    return false;
  }
  const events = receipt.logs;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (event.topics[0].toHexString() == eventHash) {
      return true;
    }
  }
  return false;
}

class CollateralDetails {
  collateral: string;
  collateralToUsd: BigDecimal;
  network: string;
}
function getCollateralDetails(event: ethereum.Event): CollateralDetails {
  const network = dataSource.network();
  const collateral = getCollateralFromCallbacksAddress(
    network,
    event.address.toHexString()
  );
  const collateralToUsd = getCollateralPrice(dataSource.network(), collateral,event.block.number.toI32());
  return { collateral, collateralToUsd, network };
}

export function handleMarketExecuted(event: MarketExecuted): void {
  const collateralDetails = getCollateralDetails(event);
  const trade = event.params.t;
  const open = event.params.open;
  const collateralSentToTrader = convertDaiToDecimal(
    event.params.daiSentToTrader
  );
  const positionSizeDai = convertDaiToDecimal(event.params.positionSizeDai);
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDaiToDecimal(trade.positionSizeDai).times(leverage);

  log.info("[handleMarketExecuted] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trade.trader,event.block.number.toI32())) {
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
      trade.trader.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32(),
      event.block.number.toI32()      
    );
  } else {
    _handleCloseTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      collateralSentToTrader,
      event.block.number.toI32()      
    );
  }
}

export function handleLimitExecuted(event: LimitExecuted): void {
  const collateralDetails = getCollateralDetails(event);
  const trade = event.params.t;
  const orderType = event.params.orderType;
  const collateralSentToTrader = convertDaiToDecimal(
    event.params.daiSentToTrader
  );
  const positionSizeDai = convertDaiToDecimal(event.params.positionSizeDai); // Pos size less fees on close
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDaiToDecimal(trade.positionSizeDai).times(leverage);
  log.info("[handleLimitExecuted] {}", [event.transaction.hash.toHexString()]);

  if (isTraderReferredByAggregator(collateralDetails.network, trade.trader,event.block.number.toI32())) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  if (orderType == 3) {
    _handleOpenTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32(),
      event.block.number.toI32()      
    );
  } else {
    _handleCloseTrade(
      collateralDetails.network,
      collateralDetails.collateral,
      collateralDetails.collateralToUsd,
      trade.trader.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      collateralSentToTrader,
      event.block.number.toI32()      
    );
  }
}

export function handleBorrowingFeeCharged(event: BorrowingFeeCharged): void {
  const collateralDetails = getCollateralDetails(event);
  const trader = event.params.trader.toHexString();
  const borrowingFee = convertDaiToDecimal(event.params.feeValueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleBorrowingFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader),
      event.block.number.toI32()      
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
  const collateralDetails = getCollateralDetails(event);
  const trader = event.params.trader.toHexString();
  const govFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader),
      event.block.number.toI32()      
    )
  ) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  log.info("[handleGovFeeCharged] {}", [event.transaction.hash.toHexString()]);
  addGovFeeStats(trader, govFee, timestamp,collateralDetails.collateral);

  // Calculate and add normalized stats
  const govFeeUsd = govFee.times(collateralDetails.collateralToUsd);
  addGovFeeStats(trader, govFeeUsd, timestamp,null);

  // Confirm the trade was not canceled before adding points
  if (wasTradeOpenCanceled(event.receipt as ethereum.TransactionReceipt)) {
    log.info("[handleGovFeeCharged] Trade canceled, not adding points {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  updateFeeBasedPoints(trader, govFeeUsd, timestamp, event.block.number.toI32(),null);
  updateFeeBasedPoints(trader, govFee, timestamp, event.block.number.toI32(),collateralDetails.collateral);
}

export function handleReferralFeeCharged(event: ReferralFeeCharged): void {
  const collateralDetails = getCollateralDetails(event);
  const trader = event.params.trader.toHexString();
  const referralFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleReferralFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader),
      event.block.number.toI32()      
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
  updateFeeBasedPoints(trader, referralFeeUsd, timestamp,event.block.number.toI32(), null);
}

export function handleTriggerFeeCharged(event: TriggerFeeCharged): void {
  const collateralDetails = getCollateralDetails(event);
  const trader = event.params.trader.toHexString();
  const triggerFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleTriggerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader),
      event.block.number.toI32()      
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
  updateFeeBasedPoints(trader, triggerFeeUsd, timestamp, event.block.number.toI32(),null);
}

export function handleStakerFeeCharged(event: SssFeeCharged): void {
  const collateralDetails = getCollateralDetails(event);
  const trader = event.params.trader.toHexString();
  const stakerFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleStakerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader),
      event.block.number.toI32()      
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
  updateFeeBasedPoints(trader, stakerFeeUsd, timestamp,event.block.number.toI32(), null);
}

export function handleLpFeeCharged(event: DaiVaultFeeCharged): void {
  const collateralDetails = getCollateralDetails(event);
  const trader = event.params.trader.toHexString();
  const lpFee = convertDaiToDecimal(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleLpFeeCharged] {}", [event.transaction.hash.toHexString()]);

  if (
    isTraderReferredByAggregator(
      collateralDetails.network,
      Address.fromString(trader),
      event.block.number.toI32()      
    )
  ) {
    log.info("[handleMarketExecuted] Aggregator referral {}", [
      event.transaction.hash.toHexString(),
    ]);
    return;
  }

  addLpFeeStats(trader, lpFee, timestamp, collateralDetails.collateral);
  updateFeeBasedPoints(trader, lpFee, timestamp, event.block.number.toI32(),collateralDetails.collateral);

  // Calculate and add normalized stats
  const lpFeeUsd = lpFee.times(collateralDetails.collateralToUsd);
  addLpFeeStats(trader, lpFeeUsd, timestamp, null);
  updateFeeBasedPoints(trader, lpFeeUsd, timestamp,event.block.number.toI32(), null);
}

function _handleOpenTrade(
  network: string,
  collateral: string,
  collateralToUsd: BigDecimal,
  trader: string,
  pairIndex: BigInt,
  positionSize: BigDecimal,
  timestamp: i32,
  blockNumber: i32
): void {
  const groupIndex = getGroupIndex(network, collateral, blockNumber,pairIndex).toI32();
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
  blockNumber: i32,  
  collateralSentToTrader: BigDecimal
): void {
  const groupIndex = getGroupIndex(network, collateral, pairIndex,blockNumber).toI32();
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
