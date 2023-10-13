import { EpochTradingPointsRecord, EpochType } from ".graphclient";

export type EpochTradingPoints = {
  epochType: EpochType;
  epochNumber: number;
  address: string;
  loyaltyPoints: number;
  volumePoints: number;
  absSkillPoints: number;
  relSkillPoints: number;
  diversityPoints: number;
};

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
