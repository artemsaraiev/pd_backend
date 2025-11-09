import { Hono } from "jsr:@hono/hono";
import { getDb } from "@utils/database.ts";
import { walk } from "jsr:@std/fs";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { toFileUrl } from "jsr:@std/path/to-file-url";

// Parse command-line arguments for port and base URL
const flags = parseArgs(Deno.args, {
  string: ["port", "baseUrl"],
  default: {
    port: "8000",
    baseUrl: "/api",
  },
});

const PORT = parseInt(flags.port, 10);
const BASE_URL = flags.baseUrl;
const CONCEPTS_DIR = "src/concepts";

/**
 * Main server function to initialize DB, load concepts, and start the server.
 */
async function main() {
  const [db] = await getDb();
  const app = new Hono();

  app.get("/", (c) => c.text("Concept Server is running."));

  // PDF proxy to avoid CORS/Range issues when fetching from arXiv
  app.options(`${BASE_URL}/pdf/:id`, (c) => {
    return c.text("", 204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Range",
      "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range",
      "Vary": "Origin",
    });
  });
  app.get(`${BASE_URL}/pdf/:id`, async (c) => {
    const id = c.req.param("id");
    try {
      const upstream = await fetch(`https://arxiv.org/pdf/${encodeURIComponent(id)}.pdf`, {
        redirect: "follow",
        headers: { "User-Agent": "ConceptBox/0.1" },
      });
      if (!upstream.ok || !upstream.body) {
        return c.text(`Upstream error (${upstream.status})`, upstream.status, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Range",
          "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range",
          "Vary": "Origin",
        });
      }
      const acceptRanges = upstream.headers.get("accept-ranges") ?? "bytes";
      const contentLength = upstream.headers.get("content-length") ?? undefined;
      const contentRange = upstream.headers.get("content-range") ?? undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=86400",
        "Accept-Ranges": acceptRanges,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range",
        "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range",
        "Vary": "Origin",
      };
      if (contentLength) headers["Content-Length"] = contentLength;
      if (contentRange) headers["Content-Range"] = contentRange;
      return new Response(upstream.body, { status: upstream.status, headers });
    } catch (e) {
      console.error("PDF proxy error:", e);
      return c.text("Failed to fetch PDF", 502, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Range",
        "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range",
        "Vary": "Origin",
      });
    }
  });

  // --- Dynamic Concept Loading and Routing ---
  console.log(`Scanning for concepts in ./${CONCEPTS_DIR}...`);

  for await (
    const entry of walk(CONCEPTS_DIR, {
      maxDepth: 1,
      includeDirs: true,
      includeFiles: false,
    })
  ) {
    if (entry.path === CONCEPTS_DIR) continue; // Skip the root directory

    const conceptName = entry.name;
    const conceptFilePath = `${entry.path}/${conceptName}Concept.ts`;

    try {
      const modulePath = toFileUrl(Deno.realPathSync(conceptFilePath)).href;
      const module = await import(modulePath);
      const ConceptClass = module.default;

      if (
        typeof ConceptClass !== "function" ||
        !ConceptClass.name.endsWith("Concept")
      ) {
        console.warn(
          `! No valid concept class found in ${conceptFilePath}. Skipping.`,
        );
        continue;
      }

      const instance = new ConceptClass(db);
      const conceptApiName = conceptName;
      console.log(
        `- Registering concept: ${conceptName} at ${BASE_URL}/${conceptApiName}`,
      );

      const methodNames = Object.getOwnPropertyNames(
        Object.getPrototypeOf(instance),
      )
        .filter((name) =>
          name !== "constructor" && typeof instance[name] === "function"
        );

      for (const methodName of methodNames) {
        const actionName = methodName;
        const route = `${BASE_URL}/${conceptApiName}/${actionName}`;

        app.post(route, async (c) => {
          try {
            const body = await c.req.json().catch(() => ({})); // Handle empty body
            const result = await instance[methodName](body);
            return c.json(result);
          } catch (e) {
            console.error(`Error in ${conceptName}.${methodName}:`, e);
            return c.json({ error: "An internal server error occurred." }, 500);
          }
        });
        console.log(`  - Endpoint: POST ${route}`);
      }
    } catch (e) {
      console.error(
        `! Error loading concept from ${conceptFilePath}:`,
        e,
      );
    }
  }

  console.log(`\nServer listening on http://localhost:${PORT}`);
  Deno.serve({ port: PORT }, app.fetch);
}

// Run the server
main();
