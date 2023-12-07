import { Address } from "@graphprotocol/graph-ts";
import { GNSReferrals } from "../../../types/GNSTradingCallbacksV6_4_1/GNSReferrals";
import {
  AGGREGATOR_ADDRESSES,
  WHITELISTED_REFERRAL_ADDRESSES,
  ZERO_ADDRESS,
  getNetworkAddresses,
} from "../../constants";

export function getReferralsContract(network: string): GNSReferrals {
  const config = getNetworkAddresses(network);

  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSReferrals.bind(Address.fromString(config.gnsReferrals));
}

export function getTraderReferrer(network: string, trader: Address): Address {
  const referrals = getReferralsContract(network);
  const referrer = referrals.try_getTraderReferrer(trader);
  if (referrer.reverted) {
    return Address.fromString(ZERO_ADDRESS);
  }

  return referrer.value;
}

export function isTraderReferredByAggregator(
  network: string,
  trader: Address
): boolean {
  const referrals = getReferralsContract(network);
  const referrer = referrals.try_getTraderReferrer(trader);
  if (referrer.reverted) {
    return false;
  }

  return AGGREGATOR_ADDRESSES.includes(
    referrer.value.toHexString().toLowerCase()
  );
}

export function isTraderReferredByWhitelistedReferral(
  network: string,
  trader: Address
): [boolean, string] {
  const referrals = getReferralsContract(network);
  const referrer = referrals.try_getTraderReferrer(trader);
  if (referrer.reverted) {
    return [false, ""];
  }

  const referrerString = referrer.value.toHexString().toLowerCase();
  return [
    !WHITELISTED_REFERRAL_ADDRESSES.includes(referrerString),
    referrerString,
  ];
}
