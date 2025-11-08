import { Collection, Db } from "npm:mongodb";
import { generate } from "jsr:@std/uuid/unstable-v7";

interface SessionDoc {
  _id: string; // token
  userId: string;
  createdAt: number;
}

interface UserDoc {
  _id: string; // userId
  username: string;
  createdAt: number;
}

export default class SessionConcept {
  private readonly db: Db;

  constructor(private readonly db: Db) {
    this.db = db;
  }

  private get sessions(): Collection<SessionDoc> {
    return this.db.collection<SessionDoc>("sessions");
  }
  private get users(): Collection<UserDoc> {
    return this.db.collection<UserDoc>("users");
  }

  async login(
    { username }: { username: string },
  ): Promise<{ userId: string; token: string } | { error: string }> {
    try {
      const uname = username.trim();
      if (!uname) throw new Error("username required");
      // upsert user
      const userId = uname; // simplest mapping for now
      await this.users.updateOne(
        { _id: userId },
        { $setOnInsert: { username: uname, createdAt: Date.now() } },
        { upsert: true },
      );
      // create session
      const token = generate();
      await this.sessions.insertOne({ _id: token, userId, createdAt: Date.now() });
      return { userId, token };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async logout(
    { token }: { token: string },
  ): Promise<{ ok: true } | { error: string }> {
    try {
      await this.sessions.deleteOne({ _id: token });
      return { ok: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }

  async whoami(
    { token }: { token: string },
  ): Promise<{ userId: string | null } | { error: string }> {
    try {
      const s = await this.sessions.findOne({ _id: token });
      return { userId: s?.userId ?? null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }
}


