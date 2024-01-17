import { Address, BigDecimal, log } from "@graphprotocol/graph-ts";
import { GNSPriceAggregator } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPriceAggregator";
import { IChainlinkFeed } from "../../../types/GNSTradingCallbacksV6_4_1/IChainlinkFeed";
import {
  getNetworkCollateralAddresses,
  getMultiCollatBlock,
} from "../../constants";

export function getPriceAggregatorContract(
  network: string,
  collateral: string,
  blockNumber: i32
): GNSPriceAggregator {
  const config = getNetworkCollateralAddresses(network, collateral);
  const multiCollatBlock = getMultiCollatBlock(network);
  if (config == null) {
    throw new Error("Network not supported");
  }
  if (blockNumber > multiCollatBlock) {
    return GNSPriceAggregator.bind(
      Address.fromString(config.gnsPriceAggregator)
    );
  } else {
    return GNSPriceAggregator.bind(
      Address.fromString(config.gnsPriceAggregator_Old)
    );
  }
}

// For backwards compatibility this function returns 1 if the price feed is not found
export function getCollateralPrice(
  network: string,
  collateral: string,
  blockNumber: i32
): BigDecimal {
  const priceAggregator = getPriceAggregatorContract(
    network,
    collateral,
    blockNumber
  );
  const collateralPriceUsd = priceAggregator.try_getCollateralPriceUsd();
  if (collateralPriceUsd.reverted) {
    // log.warn("Price feed not found");
    return BigDecimal.fromString("1");
  }
  const price = collateralPriceUsd.value;
  return price.toBigDecimal().div(BigDecimal.fromString(1e8 + ""));
}
