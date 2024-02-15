import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { GNSReferrals } from "../../../types/GNSTradingCallbacksV6_4_1/GNSReferrals";
import { GNSMultiCollatDiamond } from "../../../types/GNSTradingCallbacksV6_4_1/GNSMultiCollatDiamond";
import {
  AGGREGATOR_ADDRESSES,
  WHITELISTED_REFERRAL_ADDRESSES,
  ZERO_ADDRESS,
  getNetworkAddresses,
  getMultiCollatBlock,
  isWhitelistedReferralByEpoch,
} from "../../constants";

export function getReferralsContract(network: string): GNSReferrals {
  const config = getNetworkAddresses(network);
  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSReferrals.bind(Address.fromString(config.gnsReferrals));
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
export function getTraderReferrer(network: string, trader: Address): Address {
  const block =0;
  const referrals = getReferralsContract(network,block);
  const referrer = referrals.try_getTraderReferrer(trader);
  if (referrer.reverted) {
    return Address.fromString(ZERO_ADDRESS);
  }

  return referrer.value;
}
*/
export function isTraderReferredByAggregator(
  network: string,
  trader: Address,
  blockNumber: i32
): boolean {
  const multiCollatBlock = getMultiCollatBlock(network);
  if (blockNumber > multiCollatBlock) {
    const diamond = getMultiCollatDiamondContract(network);
    const referrer = diamond.try_getTraderReferrer(trader);
    if (referrer.reverted) {
      return false;
    }

    return AGGREGATOR_ADDRESSES.includes(
      referrer.value.toHexString().toLowerCase()
    );
  } else {
    const referrals = getReferralsContract(network);
    const referrer = referrals.try_getTraderReferrer(trader);
    if (referrer.reverted) {
      return false;
    }

    return AGGREGATOR_ADDRESSES.includes(
      referrer.value.toHexString().toLowerCase()
    );
  }
}

export class WhitelisedReferralResponse {
  whitelisted: boolean;
  referrer: string;
}
export function isTraderReferredByWhitelistedReferral(
  network: string,
  trader: Address,
  blockNumber: i32,
  epochNumber: i32
): WhitelisedReferralResponse {
  const multiCollatBlock = getMultiCollatBlock(network);
  if (blockNumber > multiCollatBlock) {
    const diamond = getMultiCollatDiamondContract(network);
    const referrer = diamond.try_getTraderReferrer(trader);
    if (referrer.reverted) {
      return { whitelisted: false, referrer: "" };
    }
    const referrerString = referrer.value.toHexString().toLowerCase();
    return {
      whitelisted: isWhitelistedReferralByEpoch(referrerString, epochNumber),
      referrer: referrerString,
    };
  } else {
    const referrals = getReferralsContract(network);
    const referrer = referrals.try_getTraderReferrer(trader);
    if (referrer.reverted) {
      return { whitelisted: false, referrer: "" };
    }

    const referrerString = referrer.value.toHexString().toLowerCase();
    return {
      whitelisted: isWhitelistedReferralByEpoch(referrerString, epochNumber),
      referrer: referrerString,
    };
  }
}
