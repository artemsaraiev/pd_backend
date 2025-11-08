### A4c migration notes (backend)

- Short answer: migrate. Keep the wrappers only as a temporary bridge.
- Why both existed: A4a used service classes under `backend/concepts/*` + `server.ts`. A4c discovers concept classes under `backend/src/concepts/*` via the Requesting action server and optional syncs.
- What’s better now: Move logic into `backend/src/concepts/*` and retire `backend/concepts/*` and `server.ts`.

Completed changes:
- Inlined service logic into concept classes:
  - `backend/src/concepts/PaperIndex/PaperIndexConcept.ts`
  - `backend/src/concepts/AnchoredContext/AnchoredContextConcept.ts`
  - `backend/src/concepts/DiscussionPub/DiscussionPubConcept.ts`
  - `backend/src/concepts/IdentityVerification/IdentityVerificationConcept.ts`
- Removed imports of old service classes from these files.
- Deleted legacy A4a server and service implementations:
  - removed `backend/server.ts`
  - removed `backend/concepts/*/impl.ts`

Additional changes (latest):
- Added authentication concepts and syncs:
  - `backend/src/concepts/UserAuthentication/UserAuthenticationConcept.ts`
  - `backend/src/concepts/Sessioning/SessioningConcept.ts`
  - `backend/src/syncs/auth.sync.ts`
- Requesting passthrough updated (exclusions/inclusions) to route auth and protected flows through syncs; hid internal helper routes.
- Discussion flow fixes:
  - `DiscussionPubConcept`: initialize indexes at startup.
  - `backend/src/syncs/a4.sync.ts`: added explicit handlers for `listThreads` with/without filters; simplified `open/startThread/reply` to avoid timeouts; deduped overlapping syncs to prevent double firings.
- Search:
  - `PaperIndex.searchArxiv` added (regex XML parsing, no DOMParser).
  - Exposed `/api/PaperIndex/searchArxiv` as an included public route.
- Ensure flow:
  - Adjusted ensure sync to match `{ id }` (id-only) so requests without `title` don’t time out.

Next steps:
- Verify via `deno task import` then `deno task start`, click through UI and watch backend logs.
- When verified, delete `backend/concepts/*` and the old `server.ts`.
- Keep passthroughs only for intended public routes; use syncs where orchestration/auth is needed.


