import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { GNSMultiCollatDiamond } from "../../../types/GNSMultiCollatDiamond/GNSMultiCollatDiamond";
import {
  AGGREGATOR_ADDRESSES,
  exponentToBigDecimal,
  getDiamondAddress,
  isWhitelistedReferralByEpoch,
} from "../../constants";

export class WhitelistedReferralResponse {
  whitelisted: boolean;
  referrer: string;
}

export function getMultiCollatDiamondContract(
  network: string
): GNSMultiCollatDiamond {
  const contractAddress = getDiamondAddress(network);
  return GNSMultiCollatDiamond.bind(Address.fromString(contractAddress));
}

export function isTraderReferredByAggregator(
  network: string,
  trader: Address
): boolean {
  const diamond = getMultiCollatDiamondContract(network);
  const referrer = diamond.try_getTraderActiveReferrer(trader);
  if (referrer.reverted) {
    return false;
  }
  return AGGREGATOR_ADDRESSES.includes(
    referrer.value.toHexString().toLowerCase()
  );
}

export function isTraderReferredByWhitelistedReferral(
  network: string,
  trader: Address,
  epochNumber: i32
): WhitelistedReferralResponse {
  const diamond = getMultiCollatDiamondContract(network);
  const referrer = diamond.try_getTraderActiveReferrer(trader);
  if (referrer.reverted) {
    return { whitelisted: false, referrer: "" };
  }
  const referrerString = referrer.value.toHexString().toLowerCase();
  return {
    whitelisted: isWhitelistedReferralByEpoch(referrerString, epochNumber),
    referrer: referrerString,
  };
}

// For backwards compatibility this function returns 1 if the price feed is not found
export function getCollateralPrice(
  network: string,
  collateralIndex: i32
): BigDecimal {
  const diamond = getMultiCollatDiamondContract(network);
  const collateralPriceUsd = diamond.try_getCollateralPriceUsd(collateralIndex);
  if (collateralPriceUsd.reverted) {
    // log.warn("Price feed not found");
    return BigDecimal.fromString("1");
  }
  const price = collateralPriceUsd.value;
  return price.toBigDecimal().div(exponentToBigDecimal(8));
}

export function getGroupIndex(network: string, pairIndex: BigInt): BigInt {
  const pairsStorageContract = getMultiCollatDiamondContract(network);
  return pairsStorageContract.pairs(pairIndex).groupIndex;
}
