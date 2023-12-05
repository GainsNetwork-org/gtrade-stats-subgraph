import { Address } from "@graphprotocol/graph-ts";
import { GNSReferrals } from "../../../types/GNSTradingCallbacksV6_4_1/GNSReferrals";
import { getNetworkCollateralAddresses } from "../../constants";

export function getReferralsContract(
  network: string,
  collatera: string
): GNSReferrals {
  const config = getNetworkCollateralAddresses(network, collatera);

  if (config == null) {
    throw new Error("Network not supported");
  }
  return GNSReferrals.bind(Address.fromString(config.gnsReferrals));
}
