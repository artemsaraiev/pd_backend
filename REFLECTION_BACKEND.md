## Reflection (Backend)

References:
- Backend changes log: [`backend/changes_for_4c.md`](backend/changes_for_4c.md)
- Frontend changes log: [`frontend/changes_for_4c.md`](frontend/changes_for_4c.md)

### What I focused on
- I was mainly expanding functionality: authorization, threads, anchoring, PDF proxy/annotation, nested replies, and arXiv search.
- I adopted an existing, well-done authorization concept from conceptbox and integrated it with syncs (registration, login, sessions).

### Where I got stuck
- PDF-related work consumed far more time than expected (even though most of the heavy lifting is on the frontend). I needed the backend proxy (`/api/pdf/:id`) to make range requests and CORS work, otherwise the viewer failed in production-like setups.
- Sync reliability: I broke syncing multiple times. The biggest issues were duplicated sync variants that matched the same request and caused “double” effects (2× threads, 2× replies), and a broken frame binding once that prevented replies from appearing at all.
- Another source of bugs: mixing optional parameters (e.g., `anchorId`, `session`) in `when` patterns. If both “with” and “without” variants were present, the same request could match twice.

### How I fixed things
- Consolidated and de-duplicated syncs to one or two patterns per operation:
  - `startThread`: split into “with anchorId” and “without anchorId”; removed `session` from pattern matching.
  - `reply` and `replyTo`: one clear sync each; optional params not matched when not required.
  - `listThreads`: split into “with anchorId filter” and “without filter”.
- Ensured `Requesting.respond` pairs correctly with the triggering actions so requests don’t hang and logging stays intelligible.
- Added the PDF proxy endpoint to stabilize the viewer.

### What I’d do differently
- Resist adding many sync variants early. Start with the minimal shape and only split patterns when an optional parameter truly changes routing.
- Keep a focused test loop (create thread, reply, nested reply, filter by anchor) and a DB reset script handy to catch duplicates/regressions quickly.

### Takeaways
- The Requesting + syncs architecture is powerful for orchestrating authentication and cross-concept flows, but it demands discipline in pattern design to avoid accidental multi-matches.
- Simple logging/traces and small helper scripts (DB clear) dramatically speed up iteration.


