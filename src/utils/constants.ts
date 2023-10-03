import { BigDecimal } from "@graphprotocol/graph-ts";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const ZERO_BD = BigDecimal.fromString("0");

export const ARBITRUM = "arbitrum-one";

class NetworkAddresses {
  gnsPairsStorageV6!: string;
}

export const ARBITRUM_ADDRESSES: NetworkAddresses = {
  gnsPairsStorageV6: "0xd85E038593d7A098614721EaE955EC2022B9B91B",
};

export const EPOCH_TYPE = {
  DAY: "DAY",
  WEEK: "WEEK",
  MONTH: "MONTH",
};
