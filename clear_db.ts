// Clear all data from MongoDB for a fresh demo
import "jsr:@std/dotenv/load";
import { MongoClient } from "npm:mongodb";

async function clearDatabase() {
  const DB_CONN = Deno.env.get("MONGODB_URL");
  const DB_NAME = Deno.env.get("DB_NAME");
  
  if (!DB_CONN || !DB_NAME) {
    console.error("Missing MONGODB_URL or DB_NAME environment variables");
    Deno.exit(1);
  }

  const client = new MongoClient(DB_CONN);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db(DB_NAME);
    const collections = await db.listCollections().toArray();
    
    console.log(`\nFound ${collections.length} collections:`);
    for (const col of collections) {
      console.log(`  - ${col.name}`);
    }
    
    console.log("\nDropping all collections...");
    for (const col of collections) {
      await db.collection(col.name).drop();
      console.log(`  ✓ Dropped ${col.name}`);
    }
    
    console.log("\n✅ Database cleared! Ready for a fresh demo.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

clearDatabase();

