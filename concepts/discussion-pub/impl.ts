import { Db, Collection, ObjectId } from "npm:mongodb";

interface PubDoc { _id: ObjectId; paperId: string; createdAt: number }
interface ThreadDoc { _id: ObjectId; pubId: string; author: string; anchorId?: string; body: string; createdAt: number; editedAt?: number }
interface ReplyDoc { _id: ObjectId; threadId: string; author: string; body: string; createdAt: number; editedAt?: number }

export class DiscussionPubService {
  private db: Db;
  constructor(db: Db) { this.db = db; }
  private pubs(): Collection<PubDoc> { return this.db.collection<PubDoc>("pubs"); }
  private threads(): Collection<ThreadDoc> { return this.db.collection<ThreadDoc>("threads"); }
  private replies(): Collection<ReplyDoc> { return this.db.collection<ReplyDoc>("replies"); }

  async initIndexes(): Promise<void> {
    await this.pubs().createIndex({ paperId: 1 }, { unique: true });
    await this.threads().createIndex({ pubId: 1 });
    await this.replies().createIndex({ threadId: 1 });
  }

  async open(paperId: string): Promise<string> {
    const now = Date.now();
    try {
      const res = await this.pubs().insertOne({ paperId, createdAt: now } as unknown as PubDoc);
      return String(res.insertedId);
    } catch (e) {
      if (String(e).includes("duplicate key")) throw new Error("Pub already exists for paperId");
      throw e;
    }
  }

  async startThread(pubId: string, author: string, body: string, anchorId?: string): Promise<string> {
    const pub = await this.pubs().findOne({ _id: new ObjectId(pubId) }).catch(() => null);
    if (!pub) throw new Error("Pub not found");
    const now = Date.now();
    const res = await this.threads().insertOne({ pubId, author, anchorId, body, createdAt: now } as unknown as ThreadDoc);
    return String(res.insertedId);
  }

  async reply(threadId: string, author: string, body: string): Promise<string> {
    const th = await this.threads().findOne({ _id: new ObjectId(threadId) }).catch(() => null);
    if (!th) throw new Error("Thread not found");
    const now = Date.now();
    const res = await this.replies().insertOne({ threadId, author, body, createdAt: now } as unknown as ReplyDoc);
    return String(res.insertedId);
  }

  async editThread(threadId: string, newBody: string): Promise<void> {
    const res = await this.threads().updateOne(
      { _id: new ObjectId(threadId) },
      { $set: { body: newBody, editedAt: Date.now() } },
    );
    if (res.matchedCount === 0) throw new Error("Thread not found");
  }

  async deleteThread(threadId: string): Promise<void> {
    const id = new ObjectId(threadId);
    const del = await this.threads().deleteOne({ _id: id });
    if (del.deletedCount === 0) throw new Error("Thread not found");
    await this.replies().deleteMany({ threadId });
  }

  async editReply(replyId: string, newBody: string): Promise<void> {
    const res = await this.replies().updateOne(
      { _id: new ObjectId(replyId) },
      { $set: { body: newBody, editedAt: Date.now() } },
    );
    if (res.matchedCount === 0) throw new Error("Reply not found");
  }

  async deleteReply(replyId: string): Promise<void> {
    const del = await this.replies().deleteOne({ _id: new ObjectId(replyId) });
    if (del.deletedCount === 0) throw new Error("Reply not found");
  }

  async getPubIdByPaper(paperId: string): Promise<string | null> {
    const doc = await this.pubs().findOne({ paperId });
    return doc?._id ? String(doc._id) : null;
  }

  async listThreads(pubId: string, anchorId?: string): Promise<Array<{
    _id: string; author: string; body: string; anchorId?: string; createdAt: number; editedAt?: number;
  }>> {
    const filter: Record<string, unknown> = { pubId };
    if (anchorId) filter.anchorId = anchorId;
    const cur = this.threads().find(filter).sort({ createdAt: 1 });
    const items = await cur.toArray();
    return items.map((t) => ({
      _id: String(t._id), author: t.author, body: t.body,
      anchorId: t.anchorId, createdAt: t.createdAt, editedAt: t.editedAt,
    }));
  }

  async listReplies(threadId: string): Promise<Array<{
    _id: string; author: string; body: string; createdAt: number; editedAt?: number;
  }>> {
    const cur = this.replies().find({ threadId }).sort({ createdAt: 1 });
    const items = await cur.toArray();
    return items.map((r) => ({
      _id: String(r._id), author: r.author, body: r.body,
      createdAt: r.createdAt, editedAt: r.editedAt,
    }));
  }
}


