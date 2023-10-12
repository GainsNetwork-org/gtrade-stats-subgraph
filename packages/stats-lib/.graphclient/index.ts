// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { GtradeStatsTypes } from './sources/gtrade-stats/types';
import * as importedModule$0 from "./sources/gtrade-stats/introspectionSchema";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AggregateTradingStat: ResolverTypeWrapper<AggregateTradingStat>;
  AggregateTradingStat_filter: AggregateTradingStat_filter;
  AggregateTradingStat_orderBy: AggregateTradingStat_orderBy;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  EpochType: EpochType;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  OrderDirection: OrderDirection;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  UserPointStat: ResolverTypeWrapper<UserPointStat>;
  UserPointStat_filter: UserPointStat_filter;
  UserPointStat_orderBy: UserPointStat_orderBy;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AggregateTradingStat: AggregateTradingStat;
  AggregateTradingStat_filter: AggregateTradingStat_filter;
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  Query: {};
  String: Scalars['String'];
  Subscription: {};
  UserPointStat: UserPointStat;
  UserPointStat_filter: UserPointStat_filter;
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type entityDirectiveArgs = { };

export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String'];
};

export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String'];
};

export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AggregateTradingStatResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['AggregateTradingStat'] = ResolversParentTypes['AggregateTradingStat']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  epochType?: Resolver<ResolversTypes['EpochType'], ParentType, ContextType>;
  epochNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalVolumePerGroup?: Resolver<Array<ResolversTypes['BigDecimal']>, ParentType, ContextType>;
  totalBorrowingFees?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  pairsTraded?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  totalPnl?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalPnlPercentage?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalGovFees?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalReferralFees?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalTriggerFees?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalStakerFees?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalLpFees?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type QueryResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  aggregateTradingStat?: Resolver<Maybe<ResolversTypes['AggregateTradingStat']>, ParentType, ContextType, RequireFields<QueryaggregateTradingStatArgs, 'id' | 'subgraphError'>>;
  aggregateTradingStats?: Resolver<Array<ResolversTypes['AggregateTradingStat']>, ParentType, ContextType, RequireFields<QueryaggregateTradingStatsArgs, 'skip' | 'first' | 'subgraphError'>>;
  userPointStat?: Resolver<Maybe<ResolversTypes['UserPointStat']>, ParentType, ContextType, RequireFields<QueryuserPointStatArgs, 'id' | 'subgraphError'>>;
  userPointStats?: Resolver<Array<ResolversTypes['UserPointStat']>, ParentType, ContextType, RequireFields<QueryuserPointStatsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  aggregateTradingStat?: SubscriptionResolver<Maybe<ResolversTypes['AggregateTradingStat']>, "aggregateTradingStat", ParentType, ContextType, RequireFields<SubscriptionaggregateTradingStatArgs, 'id' | 'subgraphError'>>;
  aggregateTradingStats?: SubscriptionResolver<Array<ResolversTypes['AggregateTradingStat']>, "aggregateTradingStats", ParentType, ContextType, RequireFields<SubscriptionaggregateTradingStatsArgs, 'skip' | 'first' | 'subgraphError'>>;
  userPointStat?: SubscriptionResolver<Maybe<ResolversTypes['UserPointStat']>, "userPointStat", ParentType, ContextType, RequireFields<SubscriptionuserPointStatArgs, 'id' | 'subgraphError'>>;
  userPointStats?: SubscriptionResolver<Array<ResolversTypes['UserPointStat']>, "userPointStats", ParentType, ContextType, RequireFields<SubscriptionuserPointStatsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
}>;

export type UserPointStatResolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['UserPointStat'] = ResolversParentTypes['UserPointStat']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  weekNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  loyaltyPoints?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  volumePoints?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  skillPoints?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  totalPoints?: Resolver<ResolversTypes['BigDecimal'], ParentType, ContextType>;
  loyaltyPointsPerDay?: Resolver<Array<ResolversTypes['BigDecimal']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext> = ResolversObject<{
  AggregateTradingStat?: AggregateTradingStatResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Int8?: GraphQLScalarType;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  UserPointStat?: UserPointStatResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = GtradeStatsTypes.Context & BaseMeshContext;


const baseDir = pathModule.join(typeof __dirname === 'string' ? __dirname : '/', '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/gtrade-stats/introspectionSchema":
      return Promise.resolve(importedModule$0) as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const gtradeStatsTransforms = [];
const additionalTypeDefs = [] as any[];
const gtradeStatsHandler = new GraphqlHandler({
              name: "gtrade-stats",
              config: {"endpoint":"https://api.thegraph.com/subgraphs/name/gainsnetwork-org/{context.config.graphName:gtrade-stats-arbitrum}"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("gtrade-stats"),
              logger: logger.child("gtrade-stats"),
              importFn,
            });
sources[0] = {
          name: 'gtrade-stats',
          handler: gtradeStatsHandler,
          transforms: gtradeStatsTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      {
        document: GetAggregateTradingStatDocument,
        get rawSDL() {
          return printWithCache(GetAggregateTradingStatDocument);
        },
        location: 'GetAggregateTradingStatDocument.graphql'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type GetAggregateTradingStatQueryVariables = Exact<{
  aggregateTradingStatId: Scalars['ID'];
}>;


export type GetAggregateTradingStatQuery = { aggregateTradingStat?: Maybe<Pick<AggregateTradingStat, 'address' | 'epochType' | 'epochNumber' | 'totalVolumePerGroup' | 'totalBorrowingFees' | 'pairsTraded' | 'totalPnl' | 'totalPnlPercentage' | 'totalGovFees' | 'totalReferralFees' | 'totalTriggerFees' | 'totalStakerFees' | 'totalLpFees'>> };


export const GetAggregateTradingStatDocument = gql`
    query GetAggregateTradingStat($aggregateTradingStatId: ID!) {
  aggregateTradingStat(id: $aggregateTradingStatId) {
    address
    epochType
    epochNumber
    totalVolumePerGroup
    totalBorrowingFees
    pairsTraded
    totalPnl
    totalPnlPercentage
    totalGovFees
    totalReferralFees
    totalTriggerFees
    totalStakerFees
    totalLpFees
  }
}
    ` as unknown as DocumentNode<GetAggregateTradingStatQuery, GetAggregateTradingStatQueryVariables>;


export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    GetAggregateTradingStat(variables: GetAggregateTradingStatQueryVariables, options?: C): Promise<GetAggregateTradingStatQuery> {
      return requester<GetAggregateTradingStatQuery, GetAggregateTradingStatQueryVariables>(GetAggregateTradingStatDocument, variables, options) as Promise<GetAggregateTradingStatQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;