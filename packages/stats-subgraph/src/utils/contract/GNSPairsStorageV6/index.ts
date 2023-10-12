import {
  Address,
  dataSource,
  BigInt,
  BigDecimal,
} from "@graphprotocol/graph-ts";
import {
  NETWORKS,
  ARBITRUM_ADDRESSES,
  POLYGON_ADDRESSES,
} from "../../constants";
import { GNSPairsStorageV6 } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPairsStorageV6";
import { convertPercentage } from "..";

export function getPairsStorageContract(): GNSPairsStorageV6 {
  const config =
    dataSource.network() == NETWORKS.ARBITRUM
      ? ARBITRUM_ADDRESSES
      : dataSource.network() == NETWORKS.POLYGON
      ? POLYGON_ADDRESSES
      : null;

  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSPairsStorageV6.bind(Address.fromString(config.gnsPairsStorageV6));
}

/**
 * @param pairIndex
 * @returns totalOpenFeeP = pairOpenFeeP * 2 + pairNftLimitOrderFeeP
 */
export function getTotalOpenFeeP(pairIndex: BigInt): BigDecimal {
  const pairsStorageContract = getPairsStorageContract();
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
  pairIndex: BigInt,
  isLiq: boolean
): BigDecimal {
  const pairsStorageContract = getPairsStorageContract();
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

export function getGroupIndex(pairIndex: BigInt): BigInt {
  const pairsStorageContract = getPairsStorageContract();
  return pairsStorageContract.pairs(pairIndex).getGroupIndex();
}
