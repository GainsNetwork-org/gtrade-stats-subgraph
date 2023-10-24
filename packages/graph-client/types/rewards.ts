import { EpochType } from "./../.graphclient";

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

export type LoyaltyTier = {
  lowerBound: number;
  upperBound: number;
  returnValue: number;
};