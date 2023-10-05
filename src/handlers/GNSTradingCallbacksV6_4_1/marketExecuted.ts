import { BigDecimal, log } from "@graphprotocol/graph-ts";
import {
  createOrLoadAggregateTradingStats,
  addCloseTradeStats,
  addOpenTradeStats,
} from "../../utils/access";
import { MarketExecuted } from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";
import {
  convertDai,
  getGroupIndex,
  getTotalCloseFeeP,
} from "../../utils/contract";

export function handleMarketExecuted(event: MarketExecuted) {
  const trade = event.params.t;
  const open = event.params.open;
  const daiSentToTrader = convertDai(event.params.daiSentToTrader);
  const positionSizeDai = convertDai(event.params.positionSizeDai);
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDai(trade.positionSizeDai).times(leverage);
  log.info("[handleMarketExecuted] {}", [event.transaction.hash.toHexString()]);

  if (open) {
    const openFee = daiSentToTrader.minus(positionSizeDai);
    addOpenTradeStats(
      {
        address: trade.trader.toHexString(),
        pairIndex: trade.pairIndex.toI32(),
        groupIndex: getGroupIndex(trade.pairIndex).toI32(),
        volume,
        openFee,
        timestamp: event.block.timestamp.toI32(),
      },
      true
    );
  } else {
    const closeFeesP = getTotalCloseFeeP(trade.pairIndex, false);
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
        address: trade.trader.toHexString(),
        pairIndex: trade.pairIndex.toI32(),
        groupIndex: getGroupIndex(trade.pairIndex).toI32(),
        volume,
        closeFee,
        borrowingFee,
        pnl,
        pnlPercentage,
        timestamp: event.block.timestamp.toI32(),
      },
      true
    );
  }
}
