import { log } from "@graphprotocol/graph-ts";
import { createOrLoadAggregateTradingStats } from "../../utils/access";
import { MarketExecuted } from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";

export function handleMarketExecuted(event: MarketExecuted) {
  console.log("marketExecuted");
}
