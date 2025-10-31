import { Db, ObjectId, Collection } from "npm:mongodb";

export type AnchorKind = 'Section'|'Figure'|'Lines';

interface AnchorDoc { _id: ObjectId; paperId: string; kind: AnchorKind; ref: string; snippet: string; createdAt: number; editedAt?: number }

export class AnchoredContextService {
  private db: Db;
  constructor(db: Db) { this.db = db; }
  private anchors(): Collection<AnchorDoc> { return this.db.collection<AnchorDoc>("anchors"); }

  async create(paperId: string, kind: AnchorKind, ref: string, snippet: string): Promise<string> {
    const now = Date.now();
    const res = await this.anchors().insertOne({ paperId, kind, ref, snippet, createdAt: now } as unknown as AnchorDoc);
    return String(res.insertedId);
  }

  async edit(anchorId: string, ref?: string, snippet?: string): Promise<void> {
    const update: Record<string, unknown> = { editedAt: Date.now() };
    if (ref !== undefined) update.ref = ref;
    if (snippet !== undefined) update.snippet = snippet;
    const res = await this.anchors().updateOne({ _id: new ObjectId(anchorId) }, { $set: update });
    if (res.matchedCount === 0) throw new Error("Anchor not found");
  }

  async delete(anchorId: string): Promise<void> {
    const res = await this.anchors().deleteOne({ _id: new ObjectId(anchorId) });
    if (res.deletedCount === 0) throw new Error("Anchor not found");
  }

  async listByPaper(paperId: string): Promise<Array<{
    _id: string; kind: AnchorKind; ref: string; snippet: string;
  }>> {
    const cur = this.anchors().find({ paperId }).sort({ createdAt: 1 });
    const items = await cur.toArray();
    return items.map((a) => ({
      _id: String(a._id), kind: a.kind, ref: a.ref, snippet: a.snippet,
    }));
  }
}


