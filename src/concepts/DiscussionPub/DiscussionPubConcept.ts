import { Collection, Db, ObjectId } from "npm:mongodb";

export default class DiscussionPubConcept {
  private readonly db: Db;

  constructor(private readonly db: Db) {
    this.db = db;
    // Fire-and-forget index initialization
    void this.initIndexes();
  }

  private get pubs(): Collection<{ _id: ObjectId; paperId: string; createdAt: number }> {
    return this.db.collection("pubs");
  }
  private get threads(): Collection<{
    _id: ObjectId;
    pubId: string;
    author: string;
    anchorId?: string;
    body: string;
    createdAt: number;
    editedAt?: number;
  }> {
    return this.db.collection("threads");
  }
  private get replies(): Collection<{
    _id: ObjectId;
    threadId: string;
    parentId?: string;
    author: string;
    body: string;
    createdAt: number;
    editedAt?: number;
  }> {
    return this.db.collection("replies");
  }

  private async initIndexes(): Promise<void> {
    try {
      await this.pubs.createIndex({ paperId: 1 }, { unique: true });
      await this.threads.createIndex({ pubId: 1 });
      await this.replies.createIndex({ threadId: 1 });
      await this.replies.createIndex({ parentId: 1 });
    } catch {
      // best-effort
    }
  }

  async open(
    { paperId }: { paperId: string },
  ): Promise<{ result: string } | { error: string }> {
    try {
      const now = Date.now();
      try {
        const res = await this.pubs.insertOne({ paperId, createdAt: now } as unknown as { _id: ObjectId });
        return { result: String(res.insertedId) };
      } catch (e) {
        if (String(e).includes("duplicate key")) throw new Error("Pub already exists for paperId");
        throw e;
      }
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async startThread(
    { pubId, author, body, anchorId }: {
      pubId: string;
      author: string;
      body: string;
      anchorId?: string;
    },
  ): Promise<{ result: string } | { error: string }> {
    try {
      const pub = await this.pubs.findOne({ _id: new ObjectId(pubId) }).catch(() => null);
      if (!pub) throw new Error("Pub not found");
      const now = Date.now();
      const res = await this.threads.insertOne({
        pubId,
        author,
        anchorId,
        body,
        createdAt: now,
      } as unknown as { _id: ObjectId });
      return { result: String(res.insertedId) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async reply(
    { threadId, author, body }: { threadId: string; author: string; body: string },
  ): Promise<{ result: string } | { error: string }> {
    try {
      const th = await this.threads.findOne({ _id: new ObjectId(threadId) }).catch(() => null);
      if (!th) throw new Error("Thread not found");
      const now = Date.now();
      const res = await this.replies.insertOne({
        threadId,
        author,
        body,
        createdAt: now,
      } as unknown as { _id: ObjectId });
      return { result: String(res.insertedId) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async replyTo(
    { threadId, parentId, author, body }: { threadId: string; parentId?: string; author: string; body: string },
  ): Promise<{ result: string } | { error: string }> {
    try {
      const th = await this.threads.findOne({ _id: new ObjectId(threadId) }).catch(() => null);
      if (!th) throw new Error("Thread not found");
      if (parentId) {
        const parent = await this.replies.findOne({ _id: new ObjectId(parentId) }).catch(() => null);
        if (!parent) throw new Error("Parent reply not found");
        if (String(parent.threadId) !== String(threadId)) throw new Error("Parent/thread mismatch");
      }
      const now = Date.now();
      const res = await this.replies.insertOne({
        threadId,
        parentId,
        author,
        body,
        createdAt: now,
      } as unknown as { _id: ObjectId });
      return { result: String(res.insertedId) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async editThread(
    { threadId, newBody }: { threadId: string; newBody: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.threads.updateOne(
        { _id: new ObjectId(threadId) },
        { $set: { body: newBody, editedAt: Date.now() } },
      );
      if (res.matchedCount === 0) throw new Error("Thread not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async deleteThread(
    { threadId }: { threadId: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const id = new ObjectId(threadId);
      const del = await this.threads.deleteOne({ _id: id });
      if (del.deletedCount === 0) throw new Error("Thread not found");
      await this.replies.deleteMany({ threadId });
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async editReply(
    { replyId, newBody }: { replyId: string; newBody: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.replies.updateOne(
        { _id: new ObjectId(replyId) },
        { $set: { body: newBody, editedAt: Date.now() } },
      );
      if (res.matchedCount === 0) throw new Error("Reply not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async deleteReply(
    { replyId }: { replyId: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const del = await this.replies.deleteOne({ _id: new ObjectId(replyId) });
      if (del.deletedCount === 0) throw new Error("Reply not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async getPubIdByPaper(
    { paperId }: { paperId: string },
  ): Promise<{ result: string | null } | { error: string }> {
    try {
      const doc = await this.pubs.findOne({ paperId });
      return { result: doc?._id ? String(doc._id) : null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async listThreads(
    { pubId, anchorId }: { pubId: string; anchorId?: string },
  ): Promise<{ result: Array<{ _id: string; author: string; body: string; anchorId?: string; createdAt: number; editedAt?: number }> } | {
    error: string;
  }> {
    try {
      const filter: Record<string, unknown> = { pubId };
      if (anchorId) filter.anchorId = anchorId;
      const cur = this.threads.find(filter).sort({ createdAt: 1 });
      const items = await cur.toArray();
      const result = items.map((t) => ({
        _id: String(t._id),
        author: t.author,
        body: t.body,
        anchorId: t.anchorId,
        createdAt: t.createdAt,
        editedAt: t.editedAt,
      }));
      return {
        result: result as Array<{
          _id: string;
          author: string;
          body: string;
          anchorId?: string;
          createdAt: number;
          editedAt?: number;
        }>,
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async listReplies(
    { threadId }: { threadId: string },
  ): Promise<{ result: Array<{ _id: string; author: string; body: string; createdAt: number; editedAt?: number }> } | {
    error: string;
  }> {
    try {
      const cur = this.replies.find({ threadId }).sort({ createdAt: 1 });
      const items = await cur.toArray();
      const result = items.map((r) => ({
        _id: String(r._id),
        author: r.author,
        body: r.body,
        createdAt: r.createdAt,
        editedAt: r.editedAt,
      }));
      return {
        result: result as Array<{
          _id: string;
          author: string;
          body: string;
          createdAt: number;
          editedAt?: number;
        }>,
      };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async listRepliesTree(
    { threadId }: { threadId: string },
  ): Promise<{ result: Array<any> } | { error: string }> {
    try {
      const cur = this.replies.find({ threadId }).sort({ createdAt: 1 });
      const items = await cur.toArray();
      // Build id->node
      const nodeById: Record<string, any> = {};
      for (const r of items) {
        nodeById[String(r._id)] = {
          _id: String(r._id),
          author: r.author,
          body: r.body,
          createdAt: r.createdAt,
          editedAt: r.editedAt,
          parentId: r.parentId ? String(r.parentId) : undefined,
          children: [] as any[],
        };
      }
      const roots: any[] = [];
      for (const n of Object.values(nodeById)) {
        if (n.parentId && nodeById[n.parentId]) {
          nodeById[n.parentId].children.push(n);
        } else {
          roots.push(n);
        }
      }
      return { result: roots };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }
}

