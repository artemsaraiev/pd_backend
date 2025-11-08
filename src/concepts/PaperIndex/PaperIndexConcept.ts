import { Collection, Db } from "npm:mongodb";
// No DOMParser needed; parse XML via regex for portability

export default class PaperIndexConcept {
  private readonly db: Db;

  constructor(private readonly db: Db) {
    this.db = db;
  }

  private get papers(): Collection<{
    _id: string;
    title?: string;
    authors: string[];
    links: string[];
    createdAt?: number;
  }> {
    return this.db.collection("papers");
  }

  /**
   * searchArxiv: simple arXiv search by query string.
   * Returns up to 10 items with arXiv id and title.
   */
  async searchArxiv(
    { q }: { q: string },
  ): Promise<{ result: Array<{ id: string; title?: string }> } | { error: string }> {
    try {
      const query = q.trim();
      if (!query) return { result: [] };
      const url =
        `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);
      const xml = await res.text();
      const items: Array<{ id: string; title?: string }> = [];
      const entryRegex = /<entry[\s\S]*?<\/entry>/g;
      const entries = xml.match(entryRegex) ?? [];
      for (const e of entries) {
        const idMatch = e.match(/<id>\s*([^<]+)\s*<\/id>/);
        const titleMatch = e.match(/<title>\s*([\s\S]*?)\s*<\/title>/);
        if (!idMatch) continue;
        const linkText = idMatch[1];
        const m = linkText.match(/arxiv\.org\/abs\/([^/]+)$/);
        const id = m ? m[1] : linkText;
        const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : undefined;
        items.push({ id, title });
      }
      return { result: items };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async ensure(
    { id, title }: { id: string; title?: string },
  ): Promise<{ result: string } | { error: string }> {
    try {
      const setOnInsert: Record<string, unknown> = {
        _id: id,
        authors: [],
        links: [],
        createdAt: Date.now(),
      };
      if (title !== undefined) setOnInsert.title = title;
      await this.papers.updateOne(
        { _id: id },
        { $setOnInsert: setOnInsert },
        { upsert: true },
      );
      return { result: id };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async updateMeta(
    { id, title }: { id: string; title?: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const update: Record<string, unknown> = {};
      if (title !== undefined) update.title = title;
      const res = await this.papers.updateOne({ _id: id }, { $set: update });
      if (res.matchedCount === 0) throw new Error("Paper not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async addAuthors(
    { id, authors }: { id: string; authors: string[] },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.papers.updateOne(
        { _id: id },
        { $addToSet: { authors: { $each: authors } } },
      );
      if (res.matchedCount === 0) throw new Error("Paper not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async removeAuthors(
    { id, authors }: { id: string; authors: string[] },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.papers.updateOne(
        { _id: id },
        { $pull: { authors: { $in: authors } } },
      );
      if (res.matchedCount === 0) throw new Error("Paper not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async addLink(
    { id, url }: { id: string; url: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.papers.updateOne(
        { _id: id },
        { $addToSet: { links: url } },
      );
      if (res.matchedCount === 0) throw new Error("Paper not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async removeLink(
    { id, url }: { id: string; url: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      const res = await this.papers.updateOne(
        { _id: id },
        { $pull: { links: url } },
      );
      if (res.matchedCount === 0) throw new Error("Paper not found");
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async get(
    { id }: { id: string },
  ): Promise<{ result: unknown | null } | { error: string }> {
    try {
      const result = await this.papers.findOne({ _id: id });
      return { result: result ?? null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async listRecent(
    { limit }: { limit?: number },
  ): Promise<{ result: Array<{ _id: string; title?: string; createdAt?: number }> } | {
    error: string;
  }> {
    try {
      const cur = this.papers
        .find({}, { projection: { _id: 1, title: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .limit(limit ?? 20);
      const items = await cur.toArray();
      return { result: items as Array<{ _id: string; title?: string; createdAt?: number }> };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }
}

