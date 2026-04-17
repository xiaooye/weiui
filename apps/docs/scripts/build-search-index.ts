import { writeSearchIndex } from "../src/lib/search-index";
import { join } from "node:path";

const out = join(process.cwd(), "public", "search-index.json");
writeSearchIndex(out);
console.log("Wrote search index:", out);
