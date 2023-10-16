import { EpochTradingPointsRecord } from "@gainsnetwork/graph-client";
import { EpochTradingPoints } from "./types";

export const transformEpochTradingPointsRecord = (
  record: EpochTradingPointsRecord
): EpochTradingPoints => ({
  ...record,
  epochType: record.epochType,
  epochNumber: Number(record.epochNumber),
  address: record.address,
  loyaltyPoints: Number(record.loyaltyPoints),
  volumePoints: Number(record.volumePoints),
  absSkillPoints: Number(record.absSkillPoints),
  relSkillPoints: Number(record.relSkillPoints),
  diversityPoints: Number(record.diversityPoints),
});
