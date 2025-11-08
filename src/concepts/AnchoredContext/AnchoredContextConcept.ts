import { Collection, Db, ObjectId } from "npm:mongodb";

// Valid anchor kinds in the system
export type AnchorKind = "Section" | "Figure" | "Lines";

export default class AnchoredContextConcept {
  private readonly db: Db;

  constructor(private readonly db: Db) {
    this.db = db;
  }

  private get anchors(): Collection<{
    _id: ObjectId;
    paperId: string;
    kind: AnchorKind;
    ref: string;
    snippet: string;
    createdAt: number;
    editedAt?: number;
  }> {
    return this.db.collection("anchors");
  }

  async create(
    { paperId, kind, ref, snippet }: {
      paperId: string;
      kind: AnchorKind;
      ref: string;
      snippet: string;
    },
  ): Promise<{ result: string } | { error: string }> {
    try {
      const now = Date.now();
      const res = await this.anchors.insertOne({
        paperId,
        kind,
        ref,
        snippet,
        createdAt: now,
      } as unknown as { _id: ObjectId });
      return { result: String(res.insertedId) };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async edit(
    { anchorId, ref, snippet }: { anchorId: string; ref?: string; snippet?: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const update: Record<string, unknown> = { editedAt: Date.now() };
      if (ref !== undefined) update.ref = ref;
      if (snippet !== undefined) update.snippet = snippet;
      const res = await this.anchors.updateOne(
        { _id: new ObjectId(anchorId) },
        { $set: update },
      );
      if (res.matchedCount === 0) throw new Error("Anchor not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async delete(
    { anchorId }: { anchorId: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.anchors.deleteOne({ _id: new ObjectId(anchorId) });
      if (res.deletedCount === 0) throw new Error("Anchor not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async listByPaper(
    { paperId }: { paperId: string },
  ): Promise<{ result: Array<{ _id: string; kind: AnchorKind; ref: string; snippet: string }> } | {
    error: string;
  }> {
    try {
      const cur = this.anchors.find({ paperId }).sort({ createdAt: 1 });
      const items = await cur.toArray();
      const result = items.map((a) => ({
        _id: String(a._id),
        kind: a.kind,
        ref: a.ref,
        snippet: a.snippet,
      }));
      return { result: result as Array<{ _id: string; kind: AnchorKind; ref: string; snippet: string }> };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }
}

