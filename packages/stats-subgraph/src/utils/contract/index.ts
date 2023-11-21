import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import {
  COLLATERALS,
  DAI_DECIMALS_BD,
  NETWORK_ADDRESSES,
  PRECISION_DECIMALS_BD,
} from "../constants";
export * from "./GNSPairsStorageV6";

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
  if (NETWORK_ADDRESSES[network][COLLATERALS.DAI] == address) {
    return COLLATERALS.DAI;
  }

  if (NETWORK_ADDRESSES[network][COLLATERALS.ETH] == address) {
    return COLLATERALS.ETH;
  }

  if (NETWORK_ADDRESSES[network][COLLATERALS.ARB] == address) {
    return COLLATERALS.ARB;
  }

  throw new Error("Collateral not supported");
}
