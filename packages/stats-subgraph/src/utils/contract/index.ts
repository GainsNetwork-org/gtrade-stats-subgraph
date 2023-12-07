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

export function convertDaiToDecimal(dai: BigInt): BigDecimal {
  return dai.toBigDecimal().div(DAI_DECIMALS_BD);
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
    collateralAddresses.ARB.gnsTradingCallbacksV6_4_1.toLowerCase() == address
  ) {
    return COLLATERALS.ARB;
  }

  throw new Error("Callbacks address not found " + address);
}
