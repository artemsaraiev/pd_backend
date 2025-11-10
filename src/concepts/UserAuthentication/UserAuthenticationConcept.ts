import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// A simple helper function to hash passwords using the Web Crypto API.
// In a production system, a more robust, salted hashing algorithm like Argon2 or bcrypt would be preferred.
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isMongoError(error: unknown): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error;
}

// Collection prefix for this concept
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept
type User = ID;

/**
 * Represents the state of a single user in the database.
 * a set of `User`s with
 *   a `username` String (unique)
 *   a `passwordHash` String
 */
interface UserDoc {
  _id: User;
  username: string;
  passwordHash: string;
}

/**
 * @concept UserAuthentication
 * @purpose To securely verify a user's identity based on credentials.
 */
export default class UserAuthenticationConcept {
  users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    // Ensure username is unique at the database level
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: no User exists with the given `username`.
   * **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`.
   *
   * **requires**: a User already exists with the given `username`.
   * **effects**: returns an error message.
   */
  async register(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    // Validate MIT email
    if (!/@mit\.edu$/i.test(username)) {
      return { error: "Only MIT email addresses (@mit.edu) are allowed" };
    }

    // Check if a user with this username already exists.
    try {
      const existingUser = await this.users.findOne({ username });
      if (existingUser) {
        return { error: "Email already registered" };
      }

      const passwordHash = await hashPassword(password);
      const newUser: UserDoc = {
        _id: freshID(),
        username,
        passwordHash,
      };

      await this.users.insertOne(newUser);
      return { user: newUser._id };
    } catch (e) {
      // Catch potential duplicate key error from the database index
      if (isMongoError(e) && e.code === 11000) {
        return { error: "Email already registered" };
      }
      // For other unexpected errors, re-throw or handle appropriately
      throw e;
    }
  }

  /**
   * login (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: a User exists with the given `username` and the `password` matches their `passwordHash`.
   * **effects**: returns the matching User `u` as `user`.
   *
   * **requires**: no User exists with the given `username` or the `password` does not match.
   * **effects**: returns an error message.
   */
  async login(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    const user = await this.users.findOne({ username });

    // To prevent timing attacks and username enumeration, use a generic error message.
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const providedPasswordHash = await hashPassword(password);
    if (user.passwordHash !== providedPasswordHash) {
      return { error: "Invalid email or password" };
    }

    return { user: user._id };
  }

  /**
   * _getUserByUsername (username: String): (user: User)
   *
   * **requires**: a User with the given `username` exists.
   * **effects**: returns the corresponding User.
   */
  async _getUserByUsername(
    { username }: { username: string },
  ): Promise<{ user: User }[]> {
    const user = await this.users.findOne({ username });
    if (user) {
      return [{ user: user._id }];
    }
    // As per specification, queries must return an array.
    return [];
  }

  /**
   * _getUsername (user: User): (username: String)
   *
   * **requires**: a User with the given `user` ID exists.
   * **effects**: returns the username of the corresponding User.
   */
  async _getUsername({ user: userId }: { user: User }): Promise<{ username: string }[]> {
    const user = await this.users.findOne({ _id: userId });
    if (user) {
      return [{ username: user.username }];
    }
    return [];
  }
}


