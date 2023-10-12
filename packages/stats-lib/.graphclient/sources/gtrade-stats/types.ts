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

export type AggregateTradingStat = {
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

export type AggregateTradingStat_filter = {
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
  and?: InputMaybe<Array<InputMaybe<AggregateTradingStat_filter>>>;
  or?: InputMaybe<Array<InputMaybe<AggregateTradingStat_filter>>>;
};

export type AggregateTradingStat_orderBy =
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

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type EpochType =
  | 'day'
  | 'week';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Query = {
  aggregateTradingStat?: Maybe<AggregateTradingStat>;
  aggregateTradingStats: Array<AggregateTradingStat>;
  userPointStat?: Maybe<UserPointStat>;
  userPointStats: Array<UserPointStat>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QueryaggregateTradingStatArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryaggregateTradingStatsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AggregateTradingStat_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AggregateTradingStat_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryuserPointStatArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryuserPointStatsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserPointStat_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UserPointStat_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Subscription = {
  aggregateTradingStat?: Maybe<AggregateTradingStat>;
  aggregateTradingStats: Array<AggregateTradingStat>;
  userPointStat?: Maybe<UserPointStat>;
  userPointStats: Array<UserPointStat>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type SubscriptionaggregateTradingStatArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionaggregateTradingStatsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AggregateTradingStat_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<AggregateTradingStat_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionuserPointStatArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionuserPointStatsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UserPointStat_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UserPointStat_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type UserPointStat = {
  /** Address-epochType-epochNumber */
  id: Scalars['ID'];
  address: Scalars['String'];
  weekNumber: Scalars['Int'];
  loyaltyPoints: Scalars['BigDecimal'];
  volumePoints: Scalars['BigDecimal'];
  skillPoints: Scalars['BigDecimal'];
  totalPoints: Scalars['BigDecimal'];
  loyaltyPointsPerDay: Array<Scalars['BigDecimal']>;
};

export type UserPointStat_filter = {
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
  weekNumber?: InputMaybe<Scalars['Int']>;
  weekNumber_not?: InputMaybe<Scalars['Int']>;
  weekNumber_gt?: InputMaybe<Scalars['Int']>;
  weekNumber_lt?: InputMaybe<Scalars['Int']>;
  weekNumber_gte?: InputMaybe<Scalars['Int']>;
  weekNumber_lte?: InputMaybe<Scalars['Int']>;
  weekNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  weekNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  skillPoints?: InputMaybe<Scalars['BigDecimal']>;
  skillPoints_not?: InputMaybe<Scalars['BigDecimal']>;
  skillPoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  skillPoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  skillPoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  skillPoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  skillPoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  skillPoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalPoints?: InputMaybe<Scalars['BigDecimal']>;
  totalPoints_not?: InputMaybe<Scalars['BigDecimal']>;
  totalPoints_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalPoints_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalPoints_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalPoints_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalPoints_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalPoints_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPointsPerDay?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPointsPerDay_not?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPointsPerDay_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPointsPerDay_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPointsPerDay_not_contains?: InputMaybe<Array<Scalars['BigDecimal']>>;
  loyaltyPointsPerDay_not_contains_nocase?: InputMaybe<Array<Scalars['BigDecimal']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UserPointStat_filter>>>;
  or?: InputMaybe<Array<InputMaybe<UserPointStat_filter>>>;
};

export type UserPointStat_orderBy =
  | 'id'
  | 'address'
  | 'weekNumber'
  | 'loyaltyPoints'
  | 'volumePoints'
  | 'skillPoints'
  | 'totalPoints'
  | 'loyaltyPointsPerDay';

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
  aggregateTradingStat: InContextSdkMethod<Query['aggregateTradingStat'], QueryaggregateTradingStatArgs, MeshContext>,
  /** null **/
  aggregateTradingStats: InContextSdkMethod<Query['aggregateTradingStats'], QueryaggregateTradingStatsArgs, MeshContext>,
  /** null **/
  userPointStat: InContextSdkMethod<Query['userPointStat'], QueryuserPointStatArgs, MeshContext>,
  /** null **/
  userPointStats: InContextSdkMethod<Query['userPointStats'], QueryuserPointStatsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
      /** null **/
  aggregateTradingStat: InContextSdkMethod<Subscription['aggregateTradingStat'], SubscriptionaggregateTradingStatArgs, MeshContext>,
  /** null **/
  aggregateTradingStats: InContextSdkMethod<Subscription['aggregateTradingStats'], SubscriptionaggregateTradingStatsArgs, MeshContext>,
  /** null **/
  userPointStat: InContextSdkMethod<Subscription['userPointStat'], SubscriptionuserPointStatArgs, MeshContext>,
  /** null **/
  userPointStats: InContextSdkMethod<Subscription['userPointStats'], SubscriptionuserPointStatsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Subscription['_meta'], Subscription_metaArgs, MeshContext>
  };

  export type Context = {
      ["gtrade-stats"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      ["graphName"]: Scalars['JSON']
    };
}
