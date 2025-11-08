import { Collection, Db } from "npm:mongodb";

// Local copy of VerificationDoc to remove dependency on old services
export interface VerificationDoc {
  _id: string;
  orcid?: string;
  affiliation?: string;
  badges: string[];
}

export default class IdentityVerificationConcept {
  private readonly db: Db;

  constructor(private readonly db: Db) {
    this.db = db;
  }

  private get verifications(): Collection<VerificationDoc> {
    return this.db.collection<VerificationDoc>("verifications");
  }

  private async ensureDoc(userId: string): Promise<void> {
    await this.verifications.updateOne(
      { _id: userId },
      { $setOnInsert: { badges: [] } },
      { upsert: true },
    );
  }

  async addORCID(
    { userId, orcid }: { userId: string; orcid: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      await this.ensureDoc(userId);
      await this.verifications.updateOne({ _id: userId }, { $set: { orcid } });
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async addAffiliation(
    { userId, affiliation }: { userId: string; affiliation: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      await this.ensureDoc(userId);
      await this.verifications.updateOne({ _id: userId }, { $set: { affiliation } });
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async updateAffiliation(
    { userId, affiliation }: { userId: string; affiliation?: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      await this.ensureDoc(userId);
      if (affiliation === undefined) {
        await this.verifications.updateOne({ _id: userId }, { $unset: { affiliation: "" } });
      } else {
        await this.verifications.updateOne({ _id: userId }, { $set: { affiliation } });
      }
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async addBadge(
    { userId, badge }: { userId: string; badge: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      await this.ensureDoc(userId);
      await this.verifications.updateOne({ _id: userId }, { $addToSet: { badges: badge } });
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async revokeBadge(
    { userId, badge }: { userId: string; badge: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      await this.verifications.updateOne({ _id: userId }, { $pull: { badges: badge } });
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async get(
    { userId }: { userId: string },
  ): Promise<{ result: VerificationDoc | null } | { error: string }> {
    try {
      const doc = await this.verifications.findOne({ _id: userId });
      return { result: (doc ?? null) as VerificationDoc | null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }
}

