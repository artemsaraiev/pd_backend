/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // LikertSurvey demo routes
  "/api/LikertSurvey/_getSurveyQuestions": "public query",
  "/api/LikertSurvey/_getSurveyResponses": "public query",
  "/api/LikertSurvey/_getRespondentAnswers": "public query",
  "/api/LikertSurvey/submitResponse": "allow anyone to submit response",
  "/api/LikertSurvey/updateResponse": "allow anyone to update their response",

  // PaperIndex: pass-through for simple mutations that currently don't need orchestration/auth
  "/api/PaperIndex/addAuthors": "simple mutation; no orchestration",
  "/api/PaperIndex/removeAuthors": "simple mutation; no orchestration",
  "/api/PaperIndex/addLink": "simple mutation; no orchestration",
  "/api/PaperIndex/removeLink": "simple mutation; no orchestration",

  // AnchoredContext
  "/api/AnchoredContext/edit": "simple edit; currently no auth in syncs",
  "/api/AnchoredContext/delete": "simple delete; currently no auth in syncs",

  // DiscussionPub: editorial mutations currently left as passthrough
  "/api/DiscussionPub/editThread": "editorial action; currently no auth in syncs",
  "/api/DiscussionPub/deleteThread": "editorial action; currently no auth in syncs",
  "/api/DiscussionPub/editReply": "editorial action; currently no auth in syncs",
  "/api/DiscussionPub/deleteReply": "editorial action; currently no auth in syncs",

  // IdentityVerification: ancillary operations not yet synced
  "/api/IdentityVerification/addAffiliation": "user self-update; no orchestration",
  "/api/IdentityVerification/updateAffiliation": "user self-update; no orchestration",
  "/api/IdentityVerification/revokeBadge": "admin-like action; currently passthrough",

  // Remove direct Session endpoints; handled via exclusions and syncs

  // Public queries
  "/api/PaperIndex/searchArxiv": "public search query",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Drive these via Requesting + syncs (see backend/src/syncs/a4.sync.ts)

  // PaperIndex
  "/api/PaperIndex/ensure",
  "/api/PaperIndex/updateMeta",
  "/api/PaperIndex/get",
  "/api/PaperIndex/listRecent",

  // AnchoredContext
  "/api/AnchoredContext/create",
  "/api/AnchoredContext/listByPaper",

  // DiscussionPub
  "/api/DiscussionPub/open",
  "/api/DiscussionPub/startThread",
  "/api/DiscussionPub/reply",
  "/api/DiscussionPub/replyTo",
  "/api/DiscussionPub/getPubIdByPaper",
  "/api/DiscussionPub/listThreads",
  "/api/DiscussionPub/listReplies",
  "/api/DiscussionPub/listRepliesTree",
  "/api/DiscussionPub/initIndexes",

  // IdentityVerification
  "/api/IdentityVerification/addORCID",
  "/api/IdentityVerification/addBadge",
  "/api/IdentityVerification/get",
  "/api/IdentityVerification/ensureDoc",

  // LikertSurvey - internal actions (not public)
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",

  // Auth flows - handled via syncs
  "/api/UserAuthentication/register",
  "/api/UserAuthentication/login",
  "/api/login",
  "/api/logout",
  // Internal auth queries should not be public
  "/api/UserAuthentication/_getUserByUsername",
  "/api/UserAuthentication/_getUsername",
  
  // Sessioning - internal concept, use via syncs only
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",
  
  // Block old Session concept (use UserAuthentication + Sessioning instead)
  "/api/Session/login",
  "/api/Session/logout",
  "/api/Session/whoami",
];
