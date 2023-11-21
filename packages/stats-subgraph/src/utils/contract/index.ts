import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { DAI_DECIMALS_BD, PRECISION_DECIMALS_BD } from "../constants";
export * from "./GNSPairsStorageV6";

export function convertDai(dai: BigInt): BigDecimal {
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

export function getCollateralFromCallbacksAddress(
  network: string,
  address: string
): string {
  if (address == "0x0000") {
  }
}
