// Simple concept HTTP server for A4
// Endpoints: POST /api/{Concept}/{action} with JSON body; some GET queries added.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { MongoClient } from "npm:mongodb";

import { PaperIndexService } from "./concepts/paper-index/impl.ts";
import { AnchoredContextService } from "./concepts/anchored-context/impl.ts";
import { DiscussionPubService } from "./concepts/discussion-pub/impl.ts";
import { IdentityVerificationService } from "./concepts/identity-verification/impl.ts";

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "*",
    },
    ...init,
  });
}

const mongoUrl = Deno.env.get("MONGODB_URL");
if (!mongoUrl) {
  console.error("MONGODB_URL is required");
}
const dbName = Deno.env.get("DB_NAME") ?? "a4_dev";

const client = new MongoClient(mongoUrl ?? "mongodb://127.0.0.1:27017");
await client.connect();
const db = client.db(dbName);

const paperIndex = new PaperIndexService(db);
const anchors = new AnchoredContextService(db);
const discuss = new DiscussionPubService(db);
await discuss.initIndexes().catch(() => {});

type Handler = (req: Request, url: URL) => Promise<Response> | Response;

function notFound() { return json({ error: "Not found" }, { status: 404 }); }

// Routing
const routes: Record<string, Handler> = {
  // PaperIndex actions
  "POST /api/PaperIndex/ensure": async (req) => {
    const body = await req.json();
    const id = String(body.id);
    const title = body.title as string | undefined;
    const result = await paperIndex.ensure(id, title);
    return json({ result });
  },
  "POST /api/PaperIndex/get": async (req) => {
    const body = await req.json();
    const result = await paperIndex.get(String(body.id));
    return json({ result });
  },
  "POST /api/PaperIndex/listRecent": async (req) => {
    const body = await req.json().catch(() => ({}));
    const limit = typeof body.limit === "number" ? Math.max(1, Math.min(100, body.limit)) : 20;
    const result = await paperIndex.listRecent(limit);
    return json({ result });
  },
  "POST /api/PaperIndex/updateMeta": async (req) => {
    const body = await req.json();
    await paperIndex.updateMeta(String(body.id), body.title as string | undefined);
    return json({ ok: true });
  },
  "POST /api/PaperIndex/addAuthors": async (req) => {
    const body = await req.json();
    await paperIndex.addAuthors(String(body.id), body.authors as string[]);
    return json({ ok: true });
  },
  "POST /api/PaperIndex/removeAuthors": async (req) => {
    const body = await req.json();
    await paperIndex.removeAuthors(String(body.id), body.authors as string[]);
    return json({ ok: true });
  },
  "POST /api/PaperIndex/addLink": async (req) => {
    const body = await req.json();
    await paperIndex.addLink(String(body.id), String(body.url));
    return json({ ok: true });
  },
  "POST /api/PaperIndex/removeLink": async (req) => {
    const body = await req.json();
    await paperIndex.removeLink(String(body.id), String(body.url));
    return json({ ok: true });
  },

  // AnchoredContext actions
  "POST /api/AnchoredContext/create": async (req) => {
    const body = await req.json();
    const result = await anchors.create(String(body.paperId), body.kind, String(body.ref), String(body.snippet));
    return json({ result });
  },
  "POST /api/AnchoredContext/listByPaper": async (req) => {
    const body = await req.json();
    const result = await anchors.listByPaper(String(body.paperId));
    return json({ result });
  },
  "POST /api/AnchoredContext/edit": async (req) => {
    const body = await req.json();
    await anchors.edit(String(body.anchorId), body.ref as (string|undefined), body.snippet as (string|undefined));
    return json({ ok: true });
  },
  "POST /api/AnchoredContext/delete": async (req) => {
    const body = await req.json();
    await anchors.delete(String(body.anchorId));
    return json({ ok: true });
  },

  // DiscussionPub actions
  "POST /api/DiscussionPub/open": async (req) => {
    const body = await req.json();
    const result = await discuss.open(String(body.paperId));
    return json({ result });
  },
  "POST /api/DiscussionPub/getPubIdByPaper": async (req) => {
    const body = await req.json();
    const result = await discuss.getPubIdByPaper(String(body.paperId));
    return json({ result });
  },
  "POST /api/DiscussionPub/startThread": async (req) => {
    const body = await req.json();
    const result = await discuss.startThread(String(body.pubId), String(body.author), String(body.body), body.anchorId as (string|undefined));
    return json({ result });
  },
  "POST /api/DiscussionPub/listThreads": async (req) => {
    const body = await req.json();
    const result = await discuss.listThreads(String(body.pubId), body.anchorId as (string|undefined));
    return json({ result });
  },
  "POST /api/DiscussionPub/reply": async (req) => {
    const body = await req.json();
    const result = await discuss.reply(String(body.threadId), String(body.author), String(body.body));
    return json({ result });
  },
  "POST /api/DiscussionPub/listReplies": async (req) => {
    const body = await req.json();
    const result = await discuss.listReplies(String(body.threadId));
    return json({ result });
  },
  "POST /api/DiscussionPub/editThread": async (req) => {
    const body = await req.json();
    await discuss.editThread(String(body.threadId), String(body.newBody));
    return json({ ok: true });
  },
  "POST /api/DiscussionPub/deleteThread": async (req) => {
    const body = await req.json();
    await discuss.deleteThread(String(body.threadId));
    return json({ ok: true });
  },
  "POST /api/DiscussionPub/editReply": async (req) => {
    const body = await req.json();
    await discuss.editReply(String(body.replyId), String(body.newBody));
    return json({ ok: true });
  },
  "POST /api/DiscussionPub/deleteReply": async (req) => {
    const body = await req.json();
    await discuss.deleteReply(String(body.replyId));
    return json({ ok: true });
  },

  // IdentityVerification actions
  "POST /api/IdentityVerification/addORCID": async (req) => {
    const body = await req.json();
    await (new IdentityVerificationService(db)).addORCID(String(body.userId), String(body.orcid));
    return json({ ok: true });
  },
  "POST /api/IdentityVerification/get": async (req) => {
    const body = await req.json();
    const result = await (new IdentityVerificationService(db)).get(String(body.userId));
    return json({ result });
  },
  "POST /api/IdentityVerification/addAffiliation": async (req) => {
    const body = await req.json();
    await (new IdentityVerificationService(db)).addAffiliation(String(body.userId), String(body.affiliation));
    return json({ ok: true });
  },
  "POST /api/IdentityVerification/updateAffiliation": async (req) => {
    const body = await req.json();
    await (new IdentityVerificationService(db)).updateAffiliation(String(body.userId), body.affiliation as (string|undefined));
    return json({ ok: true });
  },
  "POST /api/IdentityVerification/addBadge": async (req) => {
    const body = await req.json();
    await (new IdentityVerificationService(db)).addBadge(String(body.userId), String(body.badge));
    return json({ ok: true });
  },
  "POST /api/IdentityVerification/revokeBadge": async (req) => {
    const body = await req.json();
    await (new IdentityVerificationService(db)).revokeBadge(String(body.userId), String(body.badge));
    return json({ ok: true });
  },
};

console.log(`Concept server listening on http://localhost:8000/api`);

await serve(async (req) => {
  const { method } = req;
  const url = new URL(req.url);

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "*",
      },
    });
  }

  const key = `${method} ${url.pathname}`;
  const handler = routes[key];
  if (!handler) return notFound();

  try {
    return await handler(req, url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, { status: 400 });
  }
}, { port: 8000 });


