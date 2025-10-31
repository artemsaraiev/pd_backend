### App-wide design evolution (A2 –> A4a)
In A2, some concept actions leaked cross‑concept knowledge (e.g., an action in IdentityVerification checking authors in PaperIndex) and several concepts lacked edit/delete surfaces that would have left the system in dead‑ends. For A4a, I refactored the system into four independent service classes (one per concept), each owning its Mongo collections and enforcing only local preconditions; any cross‑concept checks are deferred to future synchronizations (A4c).

I also tightened typing and error behavior: all actions take only ids/primitives; updates throw on missing local ids; and idempotent operations use Mongo set semantics. Tests create state exclusively through actions and assert stored state, keeping concepts black‑box and modular.

### Pointers to interesting moments
- Modularity refactor from A2 feedback. I removed cross‑concept requires from specs and implementations so each action validates only local state; cross‑concept logic will be expressed as syncs later. See specs in [`paper-index/spec.md`](paper-index/spec.md), [`discussion-pub/spec.md`](discussion-pub/spec.md), [`anchored-context/spec.md`](anchored-context/spec.md), [`identity-verification/spec.md`](identity-verification/spec.md) and notes in their design notes: [`paper-index/design-notes.md`](paper-index/design-notes.md), [`discussion-pub/design-notes.md`](discussion-pub/design-notes.md), [`anchored-context/design-notes.md`](anchored-context/design-notes.md), [`identity-verification/design-notes.md`](identity-verification/design-notes.md).

- Added edit/delete to avoid dead ends (again, based on the feedback from TA). A2’s lack of edits would have prevented recovery (e.g., adding authors later or fixing bodies). I added `updateMeta`/`removeAuthors`/`removeLink` in [`paper-index/impl.ts`](paper-index/impl.ts) and full edit/delete surfaces in the other concepts: [`discussion-pub/impl.ts`](discussion-pub/impl.ts), [`anchored-context/impl.ts`](anchored-context/impl.ts), [`identity-verification/impl.ts`](identity-verification/impl.ts); tests demonstrate these flows in each concept’s tests: [`paper-index/test.ts`](paper-index/test.ts), [`discussion-pub/test.ts`](discussion-pub/test.ts), [`anchored-context/test.ts`](anchored-context/test.ts), [`identity-verification/test.ts`](identity-verification/test.ts).

- `_id` typing decision: strings vs `ObjectId`. To keep concepts decoupled and tests simple, `PaperIndex` uses string `_id` typed via `Collection<PaperDoc>`; collections that are naturally generated (`pubs`, `threads`, `replies`, `anchors`) use `ObjectId`. See [`paper-index/impl.ts`](paper-index/impl.ts) (typed `_id: string`) and [`discussion-pub/impl.ts`](discussion-pub/impl.ts) (static `ObjectId` usage).

- Unique pub per paper enforced via index. I added a unique index on `paperId` and made duplicate opens error with a clear message. See `initIndexes()` and `open()` in [`discussion-pub/impl.ts`](discussion-pub/impl.ts), exercised in [`discussion-pub/test.ts`](discussion-pub/test.ts) and captured in [`discussion-pub/test-output.md`](discussion-pub/test-output.md).

- Cascade delete on thread removal (explicit policy). Deleting a thread cascades to remove all its replies, preventing orphaned data and simplifying clients. See `deleteThread()` in [`discussion-pub/impl.ts`](discussion-pub/impl.ts) and the "cascades" variant in [`discussion-pub/test.ts`](discussion-pub/test.ts) (output in [`discussion-pub/test-output.md`](discussion-pub/test-output.md)).

- Set semantics and idempotence for collections. To prevent dupes and ensure idempotent writes, I used `$addToSet`/`$pull` throughout (authors, links, badges). Examples: `addAuthors`/`removeAuthors` and `addLink`/`removeLink` in [`paper-index/impl.ts`](paper-index/impl.ts), and `addBadge`/`revokeBadge` in [`identity-verification/impl.ts`](identity-verification/impl.ts) with variants proven in tests.

- Error policy: strict local requires with helpful failures. All updates throw if the local id doesn’t exist; some removals are no‑op by design (e.g., `revokeBadge` on missing doc). See [`identity-verification/impl.ts`](identity-verification/impl.ts) and error variants in concept tests: [`paper-index/test.ts`](paper-index/test.ts), [`discussion-pub/test.ts`](discussion-pub/test.ts), [`anchored-context/test.ts`](anchored-context/test.ts), [`identity-verification/test.ts`](identity-verification/test.ts) with snapshots recorded in each `test-output.md`.

- Deno typings and test ergonomics. Tests initially failed on `crypto`/`console`; I fixed via project libs in [`../deno.json`](../deno.json) and per‑file DOM references, and switched asserts to `deno.land/std` for reliability. See the headers and imports in concept tests: [`paper-index/test.ts`](paper-index/test.ts), [`discussion-pub/test.ts`](discussion-pub/test.ts), [`anchored-context/test.ts`](anchored-context/test.ts), [`identity-verification/test.ts`](identity-verification/test.ts).

- Safe test DB lifecycle. The helper creates short, unique DB names and drops the DB on teardown, then closes the client to keep Atlas clean. See [`_test/db.ts`](_test/db.ts) and the test outputs showing fresh collections per run, e.g., [`anchored-context/test-output.md`](anchored-context/test-output.md).

- Anchors are purely logical to preserve modularity. I kept `AnchoredContext` independent of PDF storage/parsing by storing kind/ref/snippet only; other concepts only hold anchor ids as opaque strings. See [`anchored-context/spec.md`](anchored-context/spec.md) and [`discussion-pub/impl.ts`](discussion-pub/impl.ts) where `anchorId` is stored without validation.

See concept folders for specs, implementations, tests, and `test-output.md` captures alongside each test.


### A4b backend updates to support frontend lists (Oct 28)
- Added read/list queries so the frontend can render without refreshes:
  - `PaperIndex.get(id)` returns the paper doc (id/title).
  - `AnchoredContext.listByPaper(paperId)` returns anchors for a paper.
  - `DiscussionPub.getPubIdByPaper(paperId)` resolves pub id if opened.
  - `DiscussionPub.listThreads(pubId, anchorId?)` returns threads with timestamps.
  - `DiscussionPub.listReplies(threadId)` returns replies with timestamps.
  - `IdentityVerification.get(userId)` fetches the verification record.
- Exposed routes in `server.ts` under `/api/*` for the above queries, following the existing `{ result: ... }` convention and CORS settings.
- No breaking changes to action surfaces; list/get are additive. This keeps tests valid while enabling FE browsing flows and a narrated demo.
