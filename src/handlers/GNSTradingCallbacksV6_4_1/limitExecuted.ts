import { log } from "@graphprotocol/graph-ts";
import { createOrLoadAggregateTradingStats } from "../../utils/access";
import { LimitExecuted } from "../../types/GNSTradingCallbacksV6_4_1/GNSTradingCallbacksV6_4_1";

export function handleLimitExecuted(event: LimitExecuted) {
  console.log("limitExecuted");
}
