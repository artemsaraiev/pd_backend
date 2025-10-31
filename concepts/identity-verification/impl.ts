import { Db, Collection } from "npm:mongodb";

export interface VerificationDoc {  // ← export this
  _id: string;
  orcid?: string;
  affiliation?: string;
  badges: string[];
}

export class IdentityVerificationService {
  private db: Db;
  constructor(db: Db) { this.db = db; }
  private verifications(): Collection<VerificationDoc> {
    return this.db.collection<VerificationDoc>("verifications");
  }

  private async ensureDoc(userId: string): Promise<void> {
    await this.verifications().updateOne(
      { _id: userId },
      { $setOnInsert: { badges: [] } },
      { upsert: true },
    );
  }

  async addORCID(userId: string, orcid: string): Promise<void> {
    await this.ensureDoc(userId);
    await this.verifications().updateOne({ _id: userId }, { $set: { orcid } });
  }

  async addAffiliation(userId: string, affiliation: string): Promise<void> {
    await this.ensureDoc(userId);
    await this.verifications().updateOne({ _id: userId }, { $set: { affiliation } });
  }

  async updateAffiliation(userId: string, affiliation?: string): Promise<void> {
    await this.ensureDoc(userId);
    // optional improvement: $unset when clearing
    if (affiliation === undefined) {
      await this.verifications().updateOne({ _id: userId }, { $unset: { affiliation: "" } });
    } else {
      await this.verifications().updateOne({ _id: userId }, { $set: { affiliation } });
    }
  }

  async addBadge(userId: string, badge: string): Promise<void> {
    await this.ensureDoc(userId);
    await this.verifications().updateOne({ _id: userId }, { $addToSet: { badges: badge } });
  }

  async revokeBadge(userId: string, badge: string): Promise<void> {
    const res = await this.verifications().updateOne({ _id: userId }, { $pull: { badges: badge } });
    if (res.matchedCount === 0) return; // no-op if missing
  }

  async get(userId: string): Promise<VerificationDoc | null> {
    const doc = await this.verifications().findOne({ _id: userId });
    return doc ?? null;
  }
}

