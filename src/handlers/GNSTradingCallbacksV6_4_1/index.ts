import { BigDecimal, log, BigInt } from "@graphprotocol/graph-ts";
import { addCloseTradeStats, addOpenTradeStats } from "../../utils/access";
import {
  MarketExecuted,
  LimitExecuted,
} from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";
import {
  convertDai,
  getGroupIndex,
  getTotalCloseFeeP,
  getTotalOpenFeeP,
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
      positionSizeDai,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      trade.trader.toHexString(),
      trade.pairIndex,
      positionSizeDai,
      volume,
      event.block.timestamp.toI32(),
      daiSentToTrader,
      false
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
      positionSizeDai,
      volume,
      event.block.timestamp.toI32()
    );
  } else {
    _handleCloseTrade(
      trade.trader.toHexString(),
      trade.pairIndex,
      positionSizeDai,
      volume,
      event.block.timestamp.toI32(),
      daiSentToTrader,
      orderType == 2
    );
  }
}

function _handleOpenTrade(
  trader: string,
  pairIndex: BigInt,
  collateral: BigDecimal,
  positionSize: BigDecimal,
  timestamp: i32
): void {
  const openFeesDecimal = getTotalOpenFeeP(pairIndex).div(
    BigDecimal.fromString("100")
  );

  const leverage = positionSize.div(collateral);
  const openFee = collateral
    .times(leverage)
    .times(openFeesDecimal)
    .div(BigDecimal.fromString("1").minus(leverage.times(openFeesDecimal)));

  addOpenTradeStats(
    {
      address: trader,
      pairIndex: pairIndex.toI32(),
      groupIndex: getGroupIndex(pairIndex).toI32(),
      positionSize,
      openFee,
      timestamp,
    },
    true
  );
}

function _handleCloseTrade(
  trader: string,
  pairIndex: BigInt,
  collateral: BigDecimal,
  positionSize: BigDecimal,
  timestamp: i32,
  daiSentToTrader: BigDecimal,
  isLiq: boolean
): void {
  const closeFeesDecimal = getTotalCloseFeeP(pairIndex, isLiq).div(
    BigDecimal.fromString("100")
  );
  const closeFee = positionSize.times(closeFeesDecimal);

  // @todo Get borrowing fee
  const borrowingFee = BigDecimal.fromString("0");

  const pnl = daiSentToTrader.minus(collateral);
  const pnlPercentage = pnl.div(collateral).times(BigDecimal.fromString("100"));

  addCloseTradeStats(
    {
      address: trader,
      pairIndex: pairIndex.toI32(),
      groupIndex: getGroupIndex(pairIndex).toI32(),
      positionSize,
      closeFee,
      borrowingFee,
      pnl,
      pnlPercentage,
      timestamp,
    },
    true
  );
}
