import { BigDecimal, log, BigInt } from "@graphprotocol/graph-ts";
import {
  addBorrowingFeeStats,
  addCloseTradeStats,
  addGovFeeStats,
  addLpFeeStats,
  addOpenTradeStats,
  addReferralFeeStats,
  addStakerFeeStats,
  addTriggerFeeStats,
  updateRewards
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
  convertDai,
  getGroupIndex,
  getLiquidationFeeP,
} from "../../utils/contract";

export function handleMarketExecuted(event: MarketExecuted): void {
  const trade = event.params.t;
  const open = event.params.open;
  const daiSentToTrader = convertDai(event.params.daiSentToTrader);
  const positionSizeDai = convertDai(event.params.positionSizeDai);
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDai(trade.positionSizeDai).times(leverage);
  log.info("[handleMarketExecuted] {}", [event.transaction.hash.toHexString()]);

  if (open) {
    _handleOpenTrade(
      trade.trader.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      trade.trader.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      daiSentToTrader
    );
  }
}

export function handleLimitExecuted(event: LimitExecuted): void {
  const trade = event.params.t;
  const orderType = event.params.orderType;
  const daiSentToTrader = convertDai(event.params.daiSentToTrader);
  const positionSizeDai = convertDai(event.params.positionSizeDai); // Pos size less fees on close
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDai(trade.positionSizeDai).times(leverage);
  log.info("[handleLimitExecuted] {}", [event.transaction.hash.toHexString()]);
  if (orderType == 3) {
    _handleOpenTrade(
      trade.trader.toHexString(),
      trade.pairIndex,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      trade.trader.toHexString(),
      trade.pairIndex,
      leverage,
      volume,
      event.block.timestamp.toI32(),
      daiSentToTrader
    );
  }
}

export function handleBorrowingFeeCharged(event: BorrowingFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const borrowingFee = convertDai(event.params.feeValueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleBorrowingFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addBorrowingFeeStats(trader, borrowingFee, timestamp);
}

export function handleGovFeeCharged(event: GovFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const govFee = convertDai(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleGovFeeCharged] {}", [event.transaction.hash.toHexString()]);
  addGovFeeStats(trader, govFee, timestamp);
  updateRewards(trader, govFee, timestamp);

}

export function handleReferralFeeCharged(event: ReferralFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const referralFee = convertDai(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleReferralFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addReferralFeeStats(trader, referralFee, timestamp);
  updateRewards(trader, referralFee, timestamp);

}

export function handleTriggerFeeCharged(event: TriggerFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const triggerFee = convertDai(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleTriggerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addTriggerFeeStats(trader, triggerFee, timestamp);
  updateRewards(trader, triggerFee, timestamp);
}

export function handleStakerFeeCharged(event: SssFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const stakerFee = convertDai(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleStakerFeeCharged] {}", [
    event.transaction.hash.toHexString(),
  ]);
  addStakerFeeStats(trader, stakerFee, timestamp);
  updateRewards(trader, stakerFee, timestamp);
}

export function handleLpFeeCharged(event: DaiVaultFeeCharged): void {
  const trader = event.params.trader.toHexString();
  const lpFee = convertDai(event.params.valueDai);
  const timestamp = event.block.timestamp.toI32();
  log.info("[handleLpFeeCharged] {}", [event.transaction.hash.toHexString()]);
  addLpFeeStats(trader, lpFee, timestamp);
  updateRewards(trader, lpFee, timestamp);
}

function _handleOpenTrade(
  trader: string,
  pairIndex: BigInt,
  positionSize: BigDecimal,
  timestamp: i32
): void {
  addOpenTradeStats({
    address: trader,
    pairIndex: pairIndex.toI32(),
    groupIndex: getGroupIndex(pairIndex).toI32(),
    positionSize,
    timestamp,
  });
}

function _handleCloseTrade(
  trader: string,
  pairIndex: BigInt,
  leverage: BigDecimal,
  positionSize: BigDecimal,
  timestamp: i32,
  daiSentToTrader: BigDecimal
): void {
  const initialCollateral = positionSize.div(leverage);
  const pnl = daiSentToTrader.minus(initialCollateral);
  const pnlPercentage = pnl
    .div(initialCollateral)
    .times(BigDecimal.fromString("100"));

  addCloseTradeStats({
    address: trader,
    pairIndex: pairIndex.toI32(),
    groupIndex: getGroupIndex(pairIndex).toI32(),
    positionSize,
    pnl,
    pnlPercentage,
    timestamp,
  });
  
}
