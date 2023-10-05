import { log, BigDecimal } from "@graphprotocol/graph-ts";
import {
  addOpenTradeStatsInput,
  createOrLoadAggregateTradingStats,
  addCloseTradeStats,
  addOpenTradeStats,
} from "../../utils/access";
import { LimitExecuted } from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";
import {
  getTotalOpenFeeP,
  getTotalCloseFeeP,
  convertDai,
  convertPercentage,
  getGroupIndex,
} from "../../utils/contract";

export function handleLimitExecuted(event: LimitExecuted) {
  const trade = event.params.t;
  const orderType = event.params.orderType;
  const daiSentToTrader = convertDai(event.params.daiSentToTrader);
  const positionSizeDai = convertDai(event.params.positionSizeDai); // Pos size less fees on close
  const leverage = trade.leverage.toBigDecimal();
  const volume = convertDai(trade.positionSizeDai).times(leverage);
  log.info("[handleLimitExecuted] {}", [event.transaction.hash.toHexString()]);
  if (orderType == 3) {
    const openFeesP = getTotalOpenFeeP(trade.pairIndex);

    const initialDai = positionSizeDai.div(
      BigDecimal.fromString("1").minus(
        openFeesP.div(BigDecimal.fromString("100"))
      )
    );
    const openFee = initialDai.minus(positionSizeDai);
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
    const closeFeesP = getTotalCloseFeeP(trade.pairIndex, orderType == 2);
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
