import { Address, BigDecimal, log } from "@graphprotocol/graph-ts";
import { GNSPriceAggregator } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPriceAggregator";
import { IChainlinkFeed } from "../../../types/GNSTradingCallbacksV6_4_1/IChainlinkFeed";
import { getNetworkCollateralAddresses, MULTI_COLLAT_BLOCK } from "../../constants";

export function getPriceAggregatorContract(
  network: string,
  collateral: string,
  blockNumber: i32
): GNSPriceAggregator {
  const config = getNetworkCollateralAddresses(network, collateral);
  if (config == null) {
    throw new Error("Network not supported");
  }
  if(blockNumber > MULTI_COLLAT_BLOCK) {
    return GNSPriceAggregator.bind(Address.fromString(config.gnsPriceAggregator));
  }
  else {
    return GNSPriceAggregator.bind(Address.fromString(config.gnsPriceAggregator_Old));
  }
}

// For backwards compatibility this function returns 1 if the price feed is not found
// @todo once multicollat is deployed to mainnet, this function should throw an error
export function getCollateralPrice(
  network: string,
  collateral: string,
  blockNumber: i32
): BigDecimal {
  const priceAggregator = getPriceAggregatorContract(network, collateral,blockNumber);
  const priceFeed = priceAggregator.try_collateralPriceFeed();
  if (priceFeed.reverted) {
    // log.warn("Price feed not found");
    return BigDecimal.fromString("1");
  }
  const feed = IChainlinkFeed.bind(priceFeed.value);
  const price = feed.try_latestRoundData();
  if (price.reverted) {
    // log.warn("Latest round data missing");
    return BigDecimal.fromString("1");
  }

  const precision = priceAggregator.try_getCollateralPrecision();

  return price.value
    .getValue1()
    .toBigDecimal()
    .div(precision.value.toBigDecimal());
}
