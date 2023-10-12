// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace GtradeStatsTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
};

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type EpochTradingPointsRecord = {
  /** Address-epochType-epochNumber */
  id: Scalars['ID'];
  address: Scalars['String'];
  epochNumber: Scalars['Int'];
  epochType: EpochType;
  totalFeesPaid: Scalars['BigDecimal'];
  pnl: Scalars['BigDecimal'];
  pnlPercentage: Scalars['BigDecimal'];
  groupsTraded: Array<Scalars['BigDecimal']>;
  loyaltyPoints: Scalars['BigDecimal'];
  volumePoints: Scalars['BigDecimal'];
  absSkillPoints: Scalars['BigDecimal'];
  relSkillPoints: Scalars['BigDecimal'];
  diversityPoints: Scalars['BigDecimal'];
};

export type EpochTradingPointsRecord_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  address?: InputMaybe<Scalars['String']>;
  address_not?: InputMaybe<Scalars['String']>;
  address_gt?: InputMaybe<Scalars['String']>;
  address_lt?: InputMaybe<Scalars['String']>;
  address_gte?: InputMaybe<Scalars['String']>;
  address_lte?: InputMaybe<Scalars['String']>;
  address_in?: InputMaybe<Array<Scalars['String']>>;
  address_not_in?: InputMaybe<Array<Scalars['String']>>;
  address_contains?: InputMaybe<Scalars['String']>;
  address_contains_nocase?: InputMaybe<Scalars['String']>;
  address_not_contains?: InputMaybe<Scalars['String']>;
  address_not_contains_nocase?: InputMaybe<Scalars['String']>;
  address_starts_with?: InputMaybe<Scalars['String']>;
  address_starts_with_nocase?: InputMaybe<Scalars['String']>;
  address_not_starts_with?: InputMaybe<Scalars['String']>;
  address_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  address_ends_with?: InputMaybe<Scalars['String']>;
  address_ends_with_nocase?: InputMaybe<Scalars['String']>;
  address_not_ends_with?: InputMaybe<Scalars['String']>;
  address_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  epochNumber?: InputMaybe<Scalars['Int']>;
  epochNumber_not?: InputMaybe<Scalars['Int']>;
  epochNumber_gt?: InputMaybe<Scalars['Int']>;
  epochNumber_lt?: InputMaybe<Scalars['Int']>;
  epochNumber_gte?: InputMaybe<Scalars['Int']>;
  epochNumber_lte?: InputMaybe<Scalars['Int']>;
  epochNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  epochNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  epochType?: InputMaybe<EpochType>;
  epochType_not?: InputMaybe<EpochType>;
  epochType_in?: InputMaybe<Array<EpochType>>;
  epochType_not_in?: InputMaybe<Array<EpochType>>;
  totalFeesPaid?: InputMaybe<Scalars['BigDecimal']>;
  totalFeesPaid_not?: InputMaybe<Scalars['BigDecimal']>;
  totalFeesPaid_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalFeesPaid_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalFeesPaid_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalFeesPaid_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalFeesPaid_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalFeesPaid_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  pnl?: InputMaybe<Scalars['BigDecimal']>;
  pnl_not?: InputMaybe<Scalars['BigDecimal']>;
  pnl_gt?: InputMaybe<Scalars['BigDecimal']>;
  pnl_lt?: InputMaybe<Scalars['BigDecimal']>;
  pnl_gte?: InputMaybe<Scalars['BigDecimal']>;
  pnl_lte?: InputMaybe<Scalars['BigDecimal']>;
  pnl_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  pnl_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  pnlPercentage?: InputMaybe<Scalars['BigDecimal']>;
  pnlPercentage_not?: InputMaybe<Scalars['BigDecimal']>;
  pnlPercentage_gt?: InputMaybe<Scalars['BigDecimal']>;
  pnlPercentage_lt?: InputMaybe<Scalars['BigDecimal']>;
  pnlPercentage_gte?: InputMaybe<Scalars['BigDecimal']>;
  pnlPercentage_lte?: InputMaybe<Scalars['BigDecimal']>;
  pnlPercentage_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  pnlPercentage_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  groupsTraded?: InputMaybe<Array<Scalars['BigDecimal']>>;
  groupsTraded_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
  groupsTraded_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
  groupsTraded_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
  groupsTraded_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
  groupsTraded_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPoints?: InputMaybe<Scalars['BigDecimal']>;
  loyaltyPoints_not?: InputMaybe<Scalars['BigDecimal']>;
  loyaltyPoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  loyaltyPoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  loyaltyPoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  loyaltyPoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  loyaltyPoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumePoints?: InputMaybe<Scalars['BigDecimal']>;
  volumePoints_not?: InputMaybe<Scalars['BigDecimal']>;
  volumePoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  volumePoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  volumePoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  volumePoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  volumePoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  volumePoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  absSkillPoints?: InputMaybe<Scalars['BigDecimal']>;
  absSkillPoints_not?: InputMaybe<Scalars['BigDecimal']>;
  absSkillPoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  absSkillPoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  absSkillPoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  absSkillPoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  absSkillPoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  absSkillPoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  relSkillPoints?: InputMaybe<Scalars['BigDecimal']>;
  relSkillPoints_not?: InputMaybe<Scalars['BigDecimal']>;
  relSkillPoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  relSkillPoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  relSkillPoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  relSkillPoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  relSkillPoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  relSkillPoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  diversityPoints?: InputMaybe<Scalars['BigDecimal']>;
  diversityPoints_not?: InputMaybe<Scalars['BigDecimal']>;
  diversityPoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  diversityPoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  diversityPoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  diversityPoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  diversityPoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  diversityPoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EpochTradingPointsRecord_filter>>>;
  or?: InputMaybe<Array<InputMaybe<EpochTradingPointsRecord_filter>>>;
};

export type EpochTradingPointsRecord_orderBy =
  | 'id'
  | 'address'
  | 'epochNumber'
  | 'epochType'
  | 'totalFeesPaid'
  | 'pnl'
  | 'pnlPercentage'
  | 'groupsTraded'
  | 'loyaltyPoints'
  | 'volumePoints'
  | 'absSkillPoints'
  | 'relSkillPoints'
  | 'diversityPoints';

export type EpochTradingStatsRecord = {
  /** Address-type-number */
  id: Scalars['ID'];
  /** Address */
  address: Scalars['String'];
  /** Epoch Type */
  epochType: EpochType;
  /** Epoch Number */
  epochNumber: Scalars['Int'];
  /** Total Volume */
  totalVolumePerGroup: Array<Scalars['BigDecimal']>;
  /** Total borrowing fees */
  totalBorrowingFees: Scalars['BigDecimal'];
  /** Pairs Traded */
  pairsTraded: Array<Scalars['Int']>;
  /** Total PnL */
  totalPnl: Scalars['BigDecimal'];
  /** Total PnL Percentage */
  totalPnlPercentage: Scalars['BigDecimal'];
  /** Total gov fees */
  totalGovFees: Scalars['BigDecimal'];
  /** Total referral fees */
  totalReferralFees: Scalars['BigDecimal'];
  /** Total trigger fees */
  totalTriggerFees: Scalars['BigDecimal'];
  /** Total staker fees */
  totalStakerFees: Scalars['BigDecimal'];
  /** Total lp fees */
  totalLpFees: Scalars['BigDecimal'];
};

export type EpochTradingStatsRecord_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  address?: InputMaybe<Scalars['String']>;
  address_not?: InputMaybe<Scalars['String']>;
  address_gt?: InputMaybe<Scalars['String']>;
  address_lt?: InputMaybe<Scalars['String']>;
  address_gte?: InputMaybe<Scalars['String']>;
  address_lte?: InputMaybe<Scalars['String']>;
  address_in?: InputMaybe<Array<Scalars['String']>>;
  address_not_in?: InputMaybe<Array<Scalars['String']>>;
  address_contains?: InputMaybe<Scalars['String']>;
  address_contains_nocase?: InputMaybe<Scalars['String']>;
  address_not_contains?: InputMaybe<Scalars['String']>;
  address_not_contains_nocase?: InputMaybe<Scalars['String']>;
  address_starts_with?: InputMaybe<Scalars['String']>;
  address_starts_with_nocase?: InputMaybe<Scalars['String']>;
  address_not_starts_with?: InputMaybe<Scalars['String']>;
  address_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  address_ends_with?: InputMaybe<Scalars['String']>;
  address_ends_with_nocase?: InputMaybe<Scalars['String']>;
  address_not_ends_with?: InputMaybe<Scalars['String']>;
  address_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  epochType?: InputMaybe<EpochType>;
  epochType_not?: InputMaybe<EpochType>;
  epochType_in?: InputMaybe<Array<EpochType>>;
  epochType_not_in?: InputMaybe<Array<EpochType>>;
  epochNumber?: InputMaybe<Scalars['Int']>;
  epochNumber_not?: InputMaybe<Scalars['Int']>;
  epochNumber_gt?: InputMaybe<Scalars['Int']>;
  epochNumber_lt?: InputMaybe<Scalars['Int']>;
  epochNumber_gte?: InputMaybe<Scalars['Int']>;
  epochNumber_lte?: InputMaybe<Scalars['Int']>;
  epochNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  epochNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalVolumePerGroup?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumePerGroup_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumePerGroup_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumePerGroup_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumePerGroup_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalVolumePerGroup_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalBorrowingFees?: InputMaybe<Scalars['BigDecimal']>;
  totalBorrowingFees_not?: InputMaybe<Scalars['BigDecimal']>;
  totalBorrowingFees_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalBorrowingFees_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalBorrowingFees_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalBorrowingFees_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalBorrowingFees_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalBorrowingFees_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  pairsTraded?: InputMaybe<Array<Scalars['Int']>>;
  pairsTraded_not?: InputMaybe<Array<Scalars['Int']>>;
  pairsTraded_contains?: InputMaybe<Array<Scalars['Int']>>;
  pairsTraded_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  pairsTraded_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  pairsTraded_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  totalPnl?: InputMaybe<Scalars['BigDecimal']>;
  totalPnl_not?: InputMaybe<Scalars['BigDecimal']>;
  totalPnl_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalPnl_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalPnl_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalPnl_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalPnl_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalPnl_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalPnlPercentage?: InputMaybe<Scalars['BigDecimal']>;
  totalPnlPercentage_not?: InputMaybe<Scalars['BigDecimal']>;
  totalPnlPercentage_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalPnlPercentage_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalPnlPercentage_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalPnlPercentage_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalPnlPercentage_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalPnlPercentage_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalGovFees?: InputMaybe<Scalars['BigDecimal']>;
  totalGovFees_not?: InputMaybe<Scalars['BigDecimal']>;
  totalGovFees_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalGovFees_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalGovFees_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalGovFees_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalGovFees_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalGovFees_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalReferralFees?: InputMaybe<Scalars['BigDecimal']>;
  totalReferralFees_not?: InputMaybe<Scalars['BigDecimal']>;
  totalReferralFees_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalReferralFees_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalReferralFees_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalReferralFees_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalReferralFees_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalReferralFees_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalTriggerFees?: InputMaybe<Scalars['BigDecimal']>;
  totalTriggerFees_not?: InputMaybe<Scalars['BigDecimal']>;
  totalTriggerFees_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalTriggerFees_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalTriggerFees_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalTriggerFees_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalTriggerFees_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalTriggerFees_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalStakerFees?: InputMaybe<Scalars['BigDecimal']>;
  totalStakerFees_not?: InputMaybe<Scalars['BigDecimal']>;
  totalStakerFees_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalStakerFees_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalStakerFees_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalStakerFees_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalStakerFees_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalStakerFees_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalLpFees?: InputMaybe<Scalars['BigDecimal']>;
  totalLpFees_not?: InputMaybe<Scalars['BigDecimal']>;
  totalLpFees_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalLpFees_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalLpFees_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalLpFees_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalLpFees_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalLpFees_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<EpochTradingStatsRecord_filter>>>;
  or?: InputMaybe<Array<InputMaybe<EpochTradingStatsRecord_filter>>>;
};

export type EpochTradingStatsRecord_orderBy =
  | 'id'
  | 'address'
  | 'epochType'
  | 'epochNumber'
  | 'totalVolumePerGroup'
  | 'totalBorrowingFees'
  | 'pairsTraded'
  | 'totalPnl'
  | 'totalPnlPercentage'
  | 'totalGovFees'
  | 'totalReferralFees'
  | 'totalTriggerFees'
  | 'totalStakerFees'
  | 'totalLpFees';

export type EpochType =
  | 'day'
  | 'week';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  epochTradingStatsRecord?: Maybe<EpochTradingStatsRecord>;
  epochTradingStatsRecords: Array<EpochTradingStatsRecord>;
  epochTradingPointsRecord?: Maybe<EpochTradingPointsRecord>;
  epochTradingPointsRecords: Array<EpochTradingPointsRecord>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryepochTradingStatsRecordArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryepochTradingStatsRecordsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EpochTradingStatsRecord_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<EpochTradingStatsRecord_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryepochTradingPointsRecordArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryepochTradingPointsRecordsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EpochTradingPointsRecord_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<EpochTradingPointsRecord_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Subscription = {
  epochTradingStatsRecord?: Maybe<EpochTradingStatsRecord>;
  epochTradingStatsRecords: Array<EpochTradingStatsRecord>;
  epochTradingPointsRecord?: Maybe<EpochTradingPointsRecord>;
  epochTradingPointsRecords: Array<EpochTradingPointsRecord>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionepochTradingStatsRecordArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionepochTradingStatsRecordsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EpochTradingStatsRecord_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<EpochTradingStatsRecord_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionepochTradingPointsRecordArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionepochTradingPointsRecordsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EpochTradingPointsRecord_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<EpochTradingPointsRecord_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  epochTradingStatsRecord: InContextSdkMethod<Query['epochTradingStatsRecord'], QueryepochTradingStatsRecordArgs, MeshContext>,
  /** null **/
  epochTradingStatsRecords: InContextSdkMethod<Query['epochTradingStatsRecords'], QueryepochTradingStatsRecordsArgs, MeshContext>,
  /** null **/
  epochTradingPointsRecord: InContextSdkMethod<Query['epochTradingPointsRecord'], QueryepochTradingPointsRecordArgs, MeshContext>,
  /** null **/
  epochTradingPointsRecords: InContextSdkMethod<Query['epochTradingPointsRecords'], QueryepochTradingPointsRecordsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  epochTradingStatsRecord: InContextSdkMethod<Subscription['epochTradingStatsRecord'], SubscriptionepochTradingStatsRecordArgs, MeshContext>,
  /** null **/
  epochTradingStatsRecords: InContextSdkMethod<Subscription['epochTradingStatsRecords'], SubscriptionepochTradingStatsRecordsArgs, MeshContext>,
  /** null **/
  epochTradingPointsRecord: InContextSdkMethod<Subscription['epochTradingPointsRecord'], SubscriptionepochTradingPointsRecordArgs, MeshContext>,
  /** null **/
  epochTradingPointsRecords: InContextSdkMethod<Subscription['epochTradingPointsRecords'], SubscriptionepochTradingPointsRecordsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["gtrade-stats"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      ["graphName"]: Scalars['JSON']
    };
}
