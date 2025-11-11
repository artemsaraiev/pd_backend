# Final Project Problem Framing

## Project: Paper Discussion Platform

---

## 1) Problem Statement

### Domain

**Academic research communication & collaboration.**
We follow research communities where discourse around new papers is fragmented across Slack threads, hard-to-accepted-in conferences, X/Twitter, YouTube comments, and other forums. We care about making this engagement more liquid: easier to find, join, and reference, so that feedback, error‑finding, and idea exchange happen earlier and more often.

### Problem

**Fragmented, low‑signal discussion for specific papers.**
For any given paper, relevant discussion is scattered and hard to locate. Lab‑intreernal thads are invisible to outsiders; social media is hype‑driven and ephemeral; YouTube comments are diffuse and not anchored to precise parts of the paper, top-tier conferences have a small capacity of papers they can accept. This raises the cost of asking good questions, surfacing corrections, and building on others' insights.

### Stakeholders

* **Authors (researchers)** — benefit from targeted feedback, errata discovery, new suggestions, and clarifications tied to specific passages/figures.
* **Engaged readers (students/early‑career researchers)** — need a place to ask scoped questions and see authoritative answers.
* **General technical audience** — can contribute applied perspectives; currently excluded by lab silos.
* **Moderators/maintainers** — keep discourse high‑signal and civil with light‑weight tools.

### Evidence & Comparables 

We use the evidence we found since the assignment 1:

Our main evidence is our personal experience and our researcher friends' experiences. However, this problem is acknowledged, which can be seen by many discussions on reddit and forums about common ways to engage in paper discussions. More sources are below:

- [Academia StackExchange: Is there a good site for holding online discussions of scientific papers?](https://academia.stackexchange.com/questions/2385/is-there-a-good-site-for-holding-online-discussions-of-scientific-papers) — multiple users note there is no centralized, widely adopted platform.
- [r/academia thread: Is there a forum where people can discuss academic papers?](https://www.reddit.com/r/academia/comments/1czi7dt/is_there_a_forum_where_people_can_discuss/) — discussions mostly happen in small labs or fragmented spaces.
- [r/academia comment (example)](https://www.reddit.com/r/academia/comments/1czi7dt/comment/l5gnlik/) — lab-level discussions are ad hoc and rarely accessible to outsiders.
- [alphaXiv announcement (Stanford AI Lab)](https://x.com/StanfordAILab/status/1818669016325800216) — interest in tools that help summarize and share arXiv papers.
- [PubPeer](https://pubpeer.com/) — post-publication peer review exists, but adoption is niche.
- [ResearchGate Q&A](https://www.researchgate.net/questions) — paper discussions exist, but engagement quality is often criticized.
- [X/Twitter search: arXiv paper discussion](https://x.com/search?q=arxiv%20paper%20discussion&src=typed_query) — popular, hype-driven threads; decent reach, poor depth.
- [Nature editorial: The future of peer review](https://communities.springernature.com/posts/the-future-of-peer-review) — recognizes gaps in post-publication discourse.
- [LSE Impact blog: Why we need to talk about academic peer review](https://blogs.lse.ac.uk/impactofsocialsciences/2016/02/17/breaking-the-traditional-mould-of-peer-review/) — existing tools do not incentivize serious engagement.

List of Comparables:

1. **PubPeer** — niche adoption for post‑publication review; demonstrates value of per‑paper threads but lacks broad, anchored discussion.
2. **ResearchGate Q&A** — general forum with mixed engagement quality; signals demand for discussion features.
3. **X/Twitter paper threads** — high reach but low structure; discovery decays quickly; limited depth.
4. **alphaXiv/summary tools** — interest in better paper discovery & summaries; adjacent but not a discussion venue.
5. **Lab Slack 'paper‑dump' channels** — common, but private and ad‑hoc; threads are not discoverable by field.
6. **Papiers (papiers.ai)** – redesigned arXiv interface with AI summaries, wiki‑style breakdowns, lineage graphs, mind maps, and live social context (swap arxiv → papiers on any paper URL). Focuses on reading and discovery, not anchored discussion. Complementary to PubDiscuss: can deep‑link from Papiers to a canonical per‑paper pub by DOI/arXiv.
7. **YouTube explainer comments** — activity exists but comments are detached from paper sections/figures and spread across duplicate videos.

---

## 2) Application Pitch 

**Name**: **PubDiscuss** (per‑paper '**pub**' for anchored **discussion**)

**Motivation**: Finding and joining serious discussion for *this* paper is hard; PubDiscuss creates a canonical, anchored discussion space keyed by DOI/arXiv where authors and readers meet.

**Possible features**

1. **Discussion Pubs (per DOI/arXiv)** — Every paper gets a canonical home. Why it helps: eliminates fragmentation; one link to share. Impact: authors and readers converge; moderators have one venue to maintain.
2. **Inline Anchors & Highlighted Threads** — Comments attach to a section/figure/line range. Why it helps: precise context, less talking past each other, easier error‑finding. Impact: authors resolve specific misconceptions; readers learn faster.
3. **Verified Identity Badges (ORCID/affiliation)** — Optional ORCID or institutional email yields badges (Author, Affiliation). Why it helps: establishes trust without doxxing. Impact: readers can triage expert replies; authors gain visibility.
4. **Upvoting** — per‑thread and per‑reply upvotes (no downvotes). Why it helps: quickly surfaces high‑signal answers/explanations. Impact: default sort favors helpful anchored content; authors/mods can still pin.
5. **Wide range of reply content** — Link to other papers/posts, embed images, and render LaTeX math. Why it helps: enables precise derivations and evidence‑backed answers. Impact: higher‑quality anchored threads; reusable explanations.
6. **Cross‑paper linking** — Reference anchors in other papers and show backlinks. Why it helps: connects related proofs/results. Impact: builds a navigable graph of anchored discussions across the literature.
7. **AI‑augmented search** — Semantic and citation‑aware search across pubs and linked papers. Why it helps: finds related anchors/explanations beyond keywords. Impact: faster discovery of answers and prior work.

---

## 3) UI Sketches

### Sketch 1: Home / Discover
![Sketch 1](assets/a2/a2_1.png)

### Sketch 2: Paper Discussion
![Sketch 2](assets/a2/a2_2.png)

### Sketch 3: Create Inline Anchor
![Sketch 3](assets/a2/a2_3.png)

### Sketch 4: Author Reply
![Sketch 4](assets/a2/a2_4.png)

### Sketch 5: Peer Reply
![Sketch 5](assets/a2/a2_5.png)

---
# 4) Value Sensitive Design (Ethical) Analysis

### Example Insight 1 — Variation in Human Ability (Stakeholders)
- **Criterion**: Stakeholders → Variation in Human Ability
- **Observation**: Inline anchors and snippet previews assume strong visual parsing. Users with low vision or dyslexia may struggle to select precise lines or parse anchors. Mis-anchoring could lead to wrong context and misunderstandings. This reduces accessibility and undermines high-signal discussion. Color blind people may have difficulty identifying highlighted text.
- **Design response**: Add keyboard-friendly anchor creation, screen-reader-compatible labels, and an ‘anchor by section heading’ option that doesn’t require fine cursor selection. Add a possibiity to choose highlighting color scheme. Dark mode can reduce eye stress for vision health concious people.

### Example Insight 2 — Reappropriation (Time)
- **Criterion**: Time → Reappropriation
- **Observation**: Over years, research communities may reappropriate PubDiscuss as a lightweight errata system or informal post-publication peer review. Without structure, comment threads might evolve into de-facto judgement venues (e.g., public shaming, scooping accusations).
- **Design response**: Introduce structured tags like 'Clarification', 'Erratum', 'Speculation', and moderation tools to differentiate critique from claims.

### Example Insight 3 — Widespread Use (Pervasiveness)
- **Criterion**: Pervasiveness → Widespread Use
- **Observation**: If PubDiscuss becomes widely adopted, researchers may face an expectation to monitor every pub for their papers, increasing cognitive load. This could worsen burnout or push senior authors toward silence, leaving early-career researchers exposed to more criticism.
- **Design response**: Allow authors to set boundaries: 'Do not notify me', delegate moderation to verified co-authors, and enable time-window batching of mentions.

### Example Insight 4 — Community & Frictionless Knowledge Access (Values)
- **Criterion**: Values → Community, Accessibility, Friction Reduction
- **Observation**: A core value of PubDiscuss is lowering barriers to join scholarly conversations and strengthening scientific community. However, features like ORCID verification and detailed anchor creation may intimidate newcomers or students who lack credentials. This can recreate existing hierarchies and subtly discourage open participation, reducing the very community cohesion and low-friction exchange the platform aims to promote.
- **Design response**: Add a ‘starter mode’ for new users with simplified posting, auto-generated anchors, and optional anonymity for questions. Make verification enhancements rather than requirements, and celebrate high-quality contributions from non-verified users through community spotlights or badges. Provide an optional view to show only verified/authorized users’ comments when higher trust is desired.

### Example Insight 5 — Privacy vs. Trust (Values)
- **Criterion**: Values → Privacy vs. Trust
- **Observation**: Verified identity badges increase trust and elevate authoritative answers, but they also pressure users to reveal affiliation or ORCID data that they may prefer to keep private. Early-career researchers or those in sensitive workplaces may feel forced to verify to be taken seriously, creating a tension between fostering trust and respecting personal privacy.
- **Design response**: Allow anonymous posting for questions while keeping verification required for badges/roles; clearly separate verified identity signals from participation rights.

---
## 5) User Journey 

**Persona**: Artem, a twelveth‑year PhD student in ML. On Slack, his advisor asks him to check a new paper. Artem sees this arXiv paper shared on X/Twitter with little to no discussions, and wants to understand Section 3.2 better.

1. **Trigger** — Artem goes to PubDiscuss and clicks on 'Discuss this paper on PubDiscuss', landing on the paper's pub ([Sketch 1](#sketch-1-home--discover)). He follows the paper.
2. **Anchor & Ask** — He selects lines in Section 3.2 and opens 'New Anchor' ([Sketch 2](#sketch-2-paper-discussion)). PubDiscuss captures a snippet and opens a thread pre‑filled with the anchor. He posts a question ([Sketch 3](#sketch-3-create-inline-anchor)).
3. **Author/User Response** — The first author (badge 'Author' + ORCID) replies in the anchored thread clarifying an assumption and correcting a typo ([Sketch 4](#sketch-4-author-reply)). The badge helps Artem trust the answer.
4. **Learn More** — A verified lab mate adds a short derivation as a reply, anchored to the same section ([Sketch 5](#sketch-5-peer-reply)). The thread accumulates precise, reusable context.
5. **Feedback loop** – Artem reads author's reply and comes up with a follow up question. However, this question has been answered by his lab mate ([Sketch 5](#sketch-5-peer-reply)), so Artem is happy, and understands Section 3.2 now.
6. **Outcome** — When others arrive later (from Slack or X), they can jump to the anchored thread and avoid repeating the same question. The canonical pub consolidates discussion and elevates the best explanations.

---

## Scope & Real‑App Constraints

* **Minimal viable concepts**: PaperIndex, DiscussionPub, AnchoredContext, IdentityVerification. PDF storage, full‑text search, moderation, and recommendation systems are out of scope for now.
* **Friction reduction**: Sign‑in with verified domain (like `.edu` or `openai.com`, or `google.com`, or `anthropic.com`, etc) email; optional ORCID verification for badges. Starting a thread requires only pasting a DOI/arXiv id; the pub is auto‑created via `ensurePub`.
* **No network effects required**: Per‑PubDiscusss are useful even with a few posts; authors can link their paper’s pub from arXiv or personal sites. The app is already useful at a lab scale (~10 people).

## Risks & Mitigations

* **Anchor drift** — Store anchors as stable identifiers (section labels/figure numbers) plus human snippet; avoid brittle PDF byte offsets.
* **Low adoption** — Make it really easy to adopt by ensuring every paper has a simple, permanent URL, and by minimizing friction for avg user. In other words,  solved by ease of sharing and great usability (hard to implement).
* **Spam/low signal** — Light‑weight moderation role (badge), verification, and mention‑based notifications only.
