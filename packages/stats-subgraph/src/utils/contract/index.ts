import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { PRECISION_DECIMALS_BD } from "../constants";
export * from "./GNSMultiCollatDiamond";

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
