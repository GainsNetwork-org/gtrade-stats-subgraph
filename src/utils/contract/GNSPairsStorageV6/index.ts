import { Address, dataSource, BigInt } from "@graphprotocol/graph-ts";
import { NETWORKS, ARBITRUM_ADDRESSES } from "../../constants";
import { GNSPairsStorageV6 } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPairsStorageV6";

export function getPairsStorageContract(): GNSPairsStorageV6 {
  const config =
    dataSource.network() == NETWORKS.ARBITRUM ? ARBITRUM_ADDRESSES : null;
  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSPairsStorageV6.bind(Address.fromString(config.gnsPairsStorageV6));
}

/**
 * @param pairIndex
 * @returns totalOpenFeeP = pairOpenFeeP * 2 + pairNftLimitOrderFeeP
 */
export function getTotalOpenFeeP(pairIndex: BigInt): BigInt {
  const pairsStorageContract = getPairsStorageContract();
  const pairOpenFeeP = pairsStorageContract.pairOpenFeeP(pairIndex);
  const pairNftLimitOrderFeeP =
    pairsStorageContract.pairNftLimitOrderFeeP(pairIndex);

  return pairOpenFeeP.times(BigInt.fromI32(2)).plus(pairNftLimitOrderFeeP);
}

/**
 * @param pairIndex
 * @param isLiq
 * @returns totalCloseFeeP = pairCloseFeeP + pairNftLimitOrderFeeP
 */
export function getTotalCloseFeeP(pairIndex: BigInt, isLiq: boolean): BigInt {
  const pairsStorageContract = getPairsStorageContract();
  let pairCloseFeeP = pairsStorageContract.pairCloseFeeP(pairIndex);
  if (isLiq) {
    // @todo change
    pairCloseFeeP = pairsStorageContract.pairCloseFeeP(pairIndex);
  }
  const pairNftLimitOrderFeeP =
    pairsStorageContract.pairNftLimitOrderFeeP(pairIndex);

  return pairCloseFeeP.plus(pairNftLimitOrderFeeP);
}
