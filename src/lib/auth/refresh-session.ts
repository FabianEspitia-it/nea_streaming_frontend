export {
  tryRefreshTokens,
  tryRefreshTokensFromCandidates,
  type RefreshedTokens,
} from "@/lib/auth/try-refresh-tokens";

/** @deprecated Usa tryRefreshTokensFromCandidates */
export { tryRefreshTokensFromCandidates as resolveRefreshedSession } from "@/lib/auth/try-refresh-tokens";
