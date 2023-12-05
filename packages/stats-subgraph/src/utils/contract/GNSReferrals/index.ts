import { Address } from "@graphprotocol/graph-ts";
import { GNSReferrals } from "../../../types/GNSTradingCallbacksV6_4_1/GNSReferrals";
import {
  AGGREGATOR_ADDRESSES,
  ZERO_ADDRESS,
  getNetworkCollateralAddresses,
} from "../../constants";

export function getReferralsContract(
  network: string,
  collateral: string
): GNSReferrals {
  const config = getNetworkCollateralAddresses(network, collateral);

  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSReferrals.bind(Address.fromString(config.gnsReferrals));
}

export function getTraderReferrer(
  network: string,
  collateral: string,
  trader: Address
): Address {
  const referrals = getReferralsContract(network, collateral);
  const referrer = referrals.try_getTraderReferrer(trader);
  if (referrer.reverted) {
    return Address.fromString(ZERO_ADDRESS);
  }

  return referrer.value;
}

export function isTraderReferredByAggregator(
  network: string,
  collateral: string,
  trader: Address
): boolean {
  const referrals = getReferralsContract(network, collateral);
  const referrer = referrals.try_getTraderReferrer(trader);
  if (referrer.reverted) {
    return false;
  }

  return AGGREGATOR_ADDRESSES.includes(
    referrer.value.toHexString().toLowerCase()
  );
}
