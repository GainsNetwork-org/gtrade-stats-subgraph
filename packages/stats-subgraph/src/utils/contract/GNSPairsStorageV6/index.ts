import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";
import {
  getNetworkAddresses,
  getNetworkCollateralAddresses,
  MULTI_COLLAT_BLOCK
} from "../../constants";
import { GNSPairsStorageV6 } from "../../../types/GNSTradingCallbacksV6_4_1/GNSPairsStorageV6";
import { GNSMultiCollatDiamond } from "../../../types/GNSTradingCallbacksV6_4_1/GNSMultiCollatDiamond";

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

export function getMultiCollatDiamondContract(
  network: string
): GNSMultiCollatDiamond {
  const config = getNetworkAddresses(network);
  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSMultiCollatDiamond.bind(Address.fromString(config.gnsDiamond));
}


/*

export function getTotalOpenFeeP(
  network: string,
  collateral: string,
  pairIndex: BigInt,
  blockNumber: i32
): BigDecimal {
  const pairsStorageContract = getPairsStorageContract(network, collateral,blockNumber);
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


export function getTotalCloseFeeP(
  network: string,
  collateral: string,
  pairIndex: BigInt,
  isLiq: boolean,
  blockNumber: i32
): BigDecimal {
  const pairsStorageContract = getPairsStorageContract(network, collateral,blockNumber);
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
*/

export function getLiquidationFeeP(pairIndex: BigInt): BigDecimal {
  return BigDecimal.fromString("5");
}

export function getGroupIndex(
  network: string,
  collateral: string,
  pairIndex: BigInt,
  blockNumber: i32
): BigInt {
  if (blockNumber > MULTI_COLLAT_BLOCK) {
    const pairsStorageContract = getMultiCollatDiamondContract(network);
    // return pairsStorageContract.pairs(pairIndex).groupIndex();
    return new BigInt(0);
  } else {
    const pairsStorageContract = getPairsStorageContract(network, collateral);
    return pairsStorageContract.pairs(pairIndex).getGroupIndex();
  }
}
