## Backend Design (A4c)

This document summarizes the backend design and the final shape of the system for A4c. It reflects the changes captured in the changes log and maps them to the rubrics and core flows.

References:
- Backend changes log: [`backend/changes_for_4c.md`](backend/changes_for_4c.md)
- Frontend changes log: [`frontend/changes_for_4c.md`](frontend/changes_for_4c.md)

### Scope and Goals
- Expand the app to include robust authorization.
- Add threaded discussions with anchors bound to papers.
- Rethink anchoring to support quoting/annotation.
- Add PDF proxy support and annotation capture to connect discussion to the document.
- Support nested replies (Reddit-style trees).
- Add search via arXiv and expose a simple endpoint to the frontend.

### Concepts and Actions
- Requesting server fronts all HTTP and converts excluded routes into `Requesting.request` actions (then responded with `Requesting.respond`).
- Discussion, Anchoring, Paper indexing, Identity/Auth implemented as first-class concepts.
- Consolidated and de-duplicated syncs to ensure each request triggers exactly one backend action (preventing duplicates in data).

Key concept implementation notes (see linked changes log for details):
- Authorization:
  - `UserAuthentication` and `Sessioning` concepts added and routed via syncs.
  - MIT email validation, SHA-256 hashing, and session-based flows.
- Discussion:
  - `DiscussionPub` manages pubs, threads, replies.
  - Threads can be anchored to a document anchor (`anchorId`).
  - Replies now support `parentId` enabling arbitrary nesting; added indexes `{ threadId: 1 }`, `{ parentId: 1 }`.
  - Tree API: `listRepliesTree({ threadId })` returns nested structure for efficient retrieval.
- Anchoring:
  - `AnchoredContext` stores anchors created from PDF text selections.
- Papers/Search:
  - `PaperIndex.searchArxiv` added and routed as a public endpoint for frontend search.
- PDF Support:
  - Proxy endpoint `GET /api/pdf/:id` streams arXiv PDFs with range support to avoid CORS issues for the viewer.

### Syncs and Routing
- Included vs excluded routes are set so that:
  - Public-simple routes (like search) can be passed through.
  - Auth-sensitive or orchestrated flows (register/login/session; starting threads/replies; list trees) go through syncs.
- Duplicated sync patterns were removed. Each operation now has at most two syncs where necessary (e.g., with and without optional parameters like `anchorId`), avoiding multiple matches for the same request.
- Example fixes:
  - `startThread`: split into “with anchorId” and “without anchorId”, removed `session` from pattern-matching.
  - `reply` and `replyTo`: one clear sync each; optional params not matched when not needed.
  - `listThreads`: split into “with anchorId filter” and “without filter”.

Outcome:
- No double-firing of actions; the duplicates issue (double threads/replies) is resolved.

### Data Model (high level)
- pubs: discussion instances per paper.
- threads: `{ _id, pubId, author, body, anchorId? }`.
- replies: `{ _id, threadId, parentId?, author, body }` with indexes for both thread and parent.
- users/sessions: stored via `UserAuthentication` and `Sessioning`.

### Security and Access
- Authentication enforced in syncs for protected flows (create thread/reply, create anchor).
- Public routes are explicitly included; internal helpers are excluded from public access.

### Operational Notes
- Build/start tasks generate imports for concepts and syncs.
- Clear DB script added for demo/testing.
- Backend logs show `Requesting` traces for observability (useful for submission trace export).

### Rubric Alignment
- Functionality: All core flows implemented (auth, anchors, threads, nested replies, PDF proxy, search).
- Authentication: Guarded via syncs; access controlled in back end.
- Syncs: Consolidated, de-duplicated, and factored for clarity.
- Deployment: Ready for Render; proxy and CORS accounted for (see changes log).
- Video/Trace: Requesting traces provide a clear backend story for the demo.


