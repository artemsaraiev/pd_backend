import { actions, Sync } from "@engine";
import {
  PaperIndex,
  AnchoredContext,
  DiscussionPub,
  IdentityVerification,
  Requesting,
  Sessioning,
  UserAuthentication,
} from "@concepts";

// PaperIndex
export const PaperIndexEnsureRequest: Sync = ({ request, id }) => ({
  when: actions([Requesting.request, { path: "/PaperIndex/ensure", id }, { request }]),
  then: actions([PaperIndex.ensure, { id }]),
});

export const PaperIndexEnsureResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/PaperIndex/ensure" }, { request }],
    [PaperIndex.ensure, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

export const PaperIndexUpdateMeta: Sync = ({ request, id, title }) => ({
  when: actions([Requesting.request, { path: "/PaperIndex/updateMeta", id, title }, { request }]),
  then: actions([PaperIndex.updateMeta, { id, title }], [Requesting.respond, { request, ok: true }]),
});

export const PaperIndexGetRequest: Sync = ({ request, id }) => ({
  when: actions([Requesting.request, { path: "/PaperIndex/get", id }, { request }]),
  then: actions([PaperIndex.get, { id }]),
});

export const PaperIndexGetResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/PaperIndex/get" }, { request }],
    [PaperIndex.get, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

export const PaperIndexListRecentRequest: Sync = ({ request, limit }) => ({
  when: actions([Requesting.request, { path: "/PaperIndex/listRecent", limit }, { request }]),
  then: actions([PaperIndex.listRecent, { limit }]),
});

export const PaperIndexListRecentResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/PaperIndex/listRecent" }, { request }],
    [PaperIndex.listRecent, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// AnchoredContext
export const AnchoredCreateRequest: Sync = ({ request, paperId, kind, ref, snippet }) => ({
  when: actions([Requesting.request, { path: "/AnchoredContext/create", paperId, kind, ref, snippet }, { request }]),
  then: actions([AnchoredContext.create, { paperId, kind, ref, snippet }]),
});

export const AnchoredCreateResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/AnchoredContext/create" }, { request }],
    [AnchoredContext.create, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

export const AnchoredListByPaperRequest: Sync = ({ request, paperId }) => ({
  when: actions([Requesting.request, { path: "/AnchoredContext/listByPaper", paperId }, { request }]),
  then: actions([AnchoredContext.listByPaper, { paperId }]),
});

export const AnchoredListByPaperResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/AnchoredContext/listByPaper" }, { request }],
    [AnchoredContext.listByPaper, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// DiscussionPub
export const DiscussionOpenRequest: Sync = ({ request, paperId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/open", paperId }, { request }]),
  then: actions([DiscussionPub.open, { paperId }]),
});

export const DiscussionOpenResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/open" }, { request }],
    [DiscussionPub.open, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// startThread with anchorId
export const DiscussionStartThreadWithAnchorRequest: Sync = ({ request, pubId, author, body, anchorId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/startThread", pubId, author, body, anchorId }, { request }]),
  then: actions([DiscussionPub.startThread, { pubId, author, body, anchorId }]),
});

// startThread without anchorId
export const DiscussionStartThreadRequest: Sync = ({ request, pubId, author, body }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/startThread", pubId, author, body }, { request }]),
  then: actions([DiscussionPub.startThread, { pubId, author, body }]),
});

export const DiscussionStartThreadResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/startThread" }, { request }],
    [DiscussionPub.startThread, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// Reply - handles with or without session
export const DiscussionReplyRequest: Sync = ({ request, threadId, author, body }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/reply", threadId, author, body }, { request }]),
  then: actions([DiscussionPub.reply, { threadId, author, body }]),
});

export const DiscussionReplyResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/reply" }, { request }],
    [DiscussionPub.reply, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// Support nested replies
export const DiscussionReplyToRequest: Sync = ({ request, threadId, parentId, author, body }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/replyTo", threadId, parentId, author, body }, { request }]),
  then: actions([DiscussionPub.replyTo, { threadId, parentId, author, body }]),
});

export const DiscussionReplyToResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/replyTo" }, { request }],
    [DiscussionPub.replyTo, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

export const DiscussionGetPubIdByPaperRequest: Sync = ({ request, paperId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/getPubIdByPaper", paperId }, { request }]),
  then: actions([DiscussionPub.getPubIdByPaper, { paperId }]),
});

export const DiscussionGetPubIdByPaperResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/getPubIdByPaper" }, { request }],
    [DiscussionPub.getPubIdByPaper, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// listThreads with anchorId filter
export const DiscussionListThreadsWithAnchorRequest: Sync = ({ request, pubId, anchorId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/listThreads", pubId, anchorId }, { request }]),
  then: actions([DiscussionPub.listThreads, { pubId, anchorId }]),
});

// listThreads without anchorId filter
export const DiscussionListThreadsRequest: Sync = ({ request, pubId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/listThreads", pubId }, { request }]),
  then: actions([DiscussionPub.listThreads, { pubId }]),
});

export const DiscussionListThreadsResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/listThreads" }, { request }],
    [DiscussionPub.listThreads, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

export const DiscussionListRepliesRequest: Sync = ({ request, threadId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/listReplies", threadId }, { request }]),
  then: actions([DiscussionPub.listReplies, { threadId }]),
});

export const DiscussionListRepliesResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/listReplies" }, { request }],
    [DiscussionPub.listReplies, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// Tree-structured replies
export const DiscussionListRepliesTreeRequest: Sync = ({ request, threadId }) => ({
  when: actions([Requesting.request, { path: "/DiscussionPub/listRepliesTree", threadId }, { request }]),
  then: actions([DiscussionPub.listRepliesTree, { threadId }]),
});

export const DiscussionListRepliesTreeResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/DiscussionPub/listRepliesTree" }, { request }],
    [DiscussionPub.listRepliesTree, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});

// IdentityVerification
export const IdentityAddORCIDRequest: Sync = ({ request, userId, orcid }) => ({
  when: actions([Requesting.request, { path: "/IdentityVerification/addORCID", userId, orcid }, { request }]),
  then: actions([IdentityVerification.addORCID, { userId, orcid }], [Requesting.respond, { request, ok: true }]),
});

export const IdentityAddBadgeRequest: Sync = ({ request, userId, badge }) => ({
  when: actions([Requesting.request, { path: "/IdentityVerification/addBadge", userId, badge }, { request }]),
  then: actions([IdentityVerification.addBadge, { userId, badge }], [Requesting.respond, { request, ok: true }]),
});

export const IdentityGetRequest: Sync = ({ request, userId }) => ({
  when: actions([Requesting.request, { path: "/IdentityVerification/get", userId }, { request }]),
  then: actions([IdentityVerification.get, { userId }]),
});

export const IdentityGetResponse: Sync = ({ request, result }) => ({
  when: actions(
    [Requesting.request, { path: "/IdentityVerification/get" }, { request }],
    [IdentityVerification.get, {}, { result }],
  ),
  then: actions([Requesting.respond, { request, result }]),
});


