import { log, BigDecimal } from "@graphprotocol/graph-ts";
import {
  HandleOpenTradeInput,
  createOrLoadAggregateTradingStats,
  handleOpenTrade,
} from "../../utils/access";
import { LimitExecuted } from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";
import { getTotalOpenFeeP, getTotalCloseFeeP } from "../../utils/contract";

export function handleLimitExecuted(event: LimitExecuted) {
  const trade = event.params.t;
  const orderType = event.params.orderType;
  const percentProfit = event.params.percentProfit;
  const daiSentToTrader = event.params.daiSentToTrader;
  const positionSizeDai = event.params.positionSizeDai; // Pos size less fees on close
  const leverage = trade.leverage;
  const volume = trade.positionSizeDai.times(leverage);
  log.info("[handleLimitExecuted] {}", [event.transaction.hash.toHexString()]);
  //// If open
  if (orderType == 3) {
    const openFeesP = getTotalOpenFeeP(trade.pairIndex);

    const initialDai = positionSizeDai.divDecimal(
      BigDecimal.fromString("1").minus(openFeesP.toBigDecimal())
    );
    const openFees = initialDai.minus(positionSizeDai.toBigDecimal());
    handleOpenTrade(
      new HandleOpenTradeInput(
        trade.trader.toHexString(),
        trade.pairIndex.toBigDecimal(),
        trade.groupIndex.toBigDecimal(),
        volume,
        openFees,
        event.block.timestamp.toI32()
      ),
      true
    );
  } else if (orderType == 2) {
  } else {
  }

  //// If close
  // Calculate volume
  // Calculate close fees
  // Calculate borrowing fees
  // Calculate pnl
  // Calculate pnl percentage
}
