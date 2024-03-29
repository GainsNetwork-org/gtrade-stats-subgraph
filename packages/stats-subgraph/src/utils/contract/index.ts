import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import {
  COLLATERALS,
  DAI_DECIMALS_BD,
  PRECISION_DECIMALS_BD,
  getNetworkCollaterals,
} from "../constants";
export * from "./GNSPairsStorageV6";
export * from "./GNSPriceAggregator";
export * from "./GNSReferrals";

export function convertCollateralToDecimal(
  dai: BigInt,
  decimals: BigDecimal
): BigDecimal {
  return dai.toBigDecimal().div(decimals);
}

export function convertPercentage(percentage: BigInt): BigDecimal {
  return percentage.toBigDecimal().div(PRECISION_DECIMALS_BD);
}

export function convertPercentageToDecimal(percentage: BigInt): BigDecimal {
  return percentage
    .toBigDecimal()
    .div(PRECISION_DECIMALS_BD)
    .div(BigDecimal.fromString("100"));
}

export function convertCollateralToUsd(
  amount: BigDecimal,
  collateralToUsd: BigDecimal
): BigDecimal {
  return amount.times(collateralToUsd);
}

export function getCollateralFromCallbacksAddress(
  network: string,
  address: string
): string {
  const collateralAddresses = getNetworkCollaterals(network);
  if (
    collateralAddresses.DAI.gnsTradingCallbacksV6_4_1.toLowerCase() == address
  ) {
    return COLLATERALS.DAI;
  }

  if (
    collateralAddresses.ETH.gnsTradingCallbacksV6_4_1.toLowerCase() == address
  ) {
    return COLLATERALS.ETH;
  }

  if (
    collateralAddresses.USDC.gnsTradingCallbacksV6_4_1.toLowerCase() == address
  ) {
    return COLLATERALS.USDC;
  }

  throw new Error("Callbacks address not found " + address);
}
