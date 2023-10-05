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
  positionSizeDai: BigDecimal,
  volume: BigDecimal,
  timestamp: number
): void {
  const openFeesP = getTotalOpenFeeP(pairIndex);

  const initialDai = positionSizeDai.div(
    BigDecimal.fromString("1").minus(
      openFeesP.div(BigDecimal.fromString("100"))
    )
  );
  const openFee = initialDai.minus(positionSizeDai);
  addOpenTradeStats(
    {
      address: trader,
      pairIndex: pairIndex.toI32(),
      groupIndex: getGroupIndex(pairIndex).toI32(),
      volume,
      openFee,
      timestamp,
    },
    true
  );
}

function _handleCloseTrade(
  trader: string,
  pairIndex: BigInt,
  positionSizeDai: BigDecimal,
  volume: BigDecimal,
  timestamp: number,
  daiSentToTrader: BigDecimal,
  isLiq: boolean
): void {
  const closeFeesP = getTotalCloseFeeP(pairIndex, isLiq);
  const closeFee = positionSizeDai
    .div(
      BigDecimal.fromString("1").minus(
        closeFeesP.div(BigDecimal.fromString("100"))
      )
    )
    .minus(positionSizeDai);

  // @todo Get borrowing fee
  const borrowingFee = BigDecimal.fromString("0");

  const pnl = daiSentToTrader.minus(positionSizeDai);
  const pnlPercentage = pnl.div(positionSizeDai);

  addCloseTradeStats(
    {
      address: trader,
      pairIndex: pairIndex.toI32(),
      groupIndex: getGroupIndex(pairIndex).toI32(),
      volume,
      closeFee,
      borrowingFee,
      pnl,
      pnlPercentage,
      timestamp,
    },
    true
  );
}
