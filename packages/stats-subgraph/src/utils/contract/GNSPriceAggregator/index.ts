import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { GNSPriceAggregator } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPriceAggregator";
import { IChainlinkFeed } from "../../../types/GNSTradingCallbacksV6_4_1/IChainlinkFeed";
import { NETWORK_ADDRESSES } from "../../constants";

export function getPriceAggregatorContract(
  network: string,
  collateral: string
): GNSPriceAggregator {
  const config = NETWORK_ADDRESSES[network][collateral];

  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSPriceAggregator.bind(Address.fromString(config.gnsPriceAggregator));
}

// For backwards compatibility this function returns 1 if the price feed is not found
// @todo once multicollat is deployed to mainnet, this function should throw an error
export function getCollateralPrice(
  network: string,
  collateral: string
): BigDecimal {
  const priceAggregator = getPriceAggregatorContract(network, collateral);
  const priceFeed = priceAggregator.try_collateralPriceFeed();
  if (priceFeed.reverted) {
    console.warn("Price feed not found");
    return BigDecimal.fromString("1");
  }
  const feed = IChainlinkFeed.bind(priceFeed.value);
  const price = feed.try_latestRoundData();
  if (price.reverted) {
    console.warn("Latest round data missing");
    return BigDecimal.fromString("1");
  }

  const precision = priceAggregator.try_getCollateralPrecision();

  return price.value
    .getValue1()
    .toBigDecimal()
    .div(precision.value.toBigDecimal());
}
