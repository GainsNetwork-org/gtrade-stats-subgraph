import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import { getNetworkCollateralAddresses } from "../../constants";
import { GNSPairsStorageV6 } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPairsStorageV6";
import { convertPercentage } from "..";

export function getPairsStorageContract(
  network: string,
  collateral: string
): GNSPairsStorageV6 {
  const collateralAddresses = getNetworkCollateralAddresses(
    network,
    collateral
  );

  if (collateralAddresses == null) {
    throw new Error("Network not supported");
  }
  return GNSPairsStorageV6.bind(
    Address.fromString(collateralAddresses.gnsPairsStorageV6)
  );
}

/**
 * @param pairIndex
 * @returns totalOpenFeeP = pairOpenFeeP * 2 + pairNftLimitOrderFeeP
 */
export function getTotalOpenFeeP(
  network: string,
  collateral: string,
  pairIndex: BigInt
): BigDecimal {
  const pairsStorageContract = getPairsStorageContract(network, collateral);
  const pairOpenFeeP = convertPercentage(
    pairsStorageContract.pairOpenFeeP(pairIndex)
  );
  const pairNftLimitOrderFeeP = convertPercentage(
    pairsStorageContract.pairNftLimitOrderFeeP(pairIndex)
  );

  return pairOpenFeeP
    .times(BigDecimal.fromString("2"))
    .plus(pairNftLimitOrderFeeP);
}

/**
 * @param pairIndex
 * @param isLiq
 * @returns totalCloseFeeP = pairCloseFeeP + pairNftLimitOrderFeeP
 */
export function getTotalCloseFeeP(
  network: string,
  collateral: string,
  pairIndex: BigInt,
  isLiq: boolean
): BigDecimal {
  const pairsStorageContract = getPairsStorageContract(network, collateral);
  const pairCloseFeeP = convertPercentage(
    pairsStorageContract.pairCloseFeeP(pairIndex)
  );

  let pairNftLimitOrderFeeP = convertPercentage(
    pairsStorageContract.pairNftLimitOrderFeeP(pairIndex)
  );

  if (isLiq) {
    // Liquidiation fee handled externally
    pairNftLimitOrderFeeP = BigDecimal.fromString("0");
  }

  return pairCloseFeeP.plus(pairNftLimitOrderFeeP);
}

export function getLiquidationFeeP(pairIndex: BigInt): BigDecimal {
  return BigDecimal.fromString("5");
}

export function getGroupIndex(
  network: string,
  collateral: string,
  pairIndex: BigInt
): BigInt {
  const pairsStorageContract = getPairsStorageContract(network, collateral);
  return pairsStorageContract.pairs(pairIndex).getGroupIndex();
}
