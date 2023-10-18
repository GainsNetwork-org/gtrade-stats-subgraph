import { mergeResolvers } from "@graphql-tools/merge";
import type { Resolvers } from "./../.graphclient/index.js";
import { resolvers as rewardsResolvers } from "./rewards";

export const resolvers: Resolvers = mergeResolvers([rewardsResolvers]);
