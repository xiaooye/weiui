import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const runtimes = {
  react: { ext: "tsx", packageName: "civaria" },
  vue: { ext: "vue", packageName: "@civaria/vue" },
  solid: { ext: "tsx", packageName: "@civaria/solid" },
  svelte: { ext: "svelte", packageName: "@civaria/svelte" },
  elements: { ext: "html", packageName: "@civaria/elements" },
};

for (const [runtime, contract] of Object.entries(runtimes)) {
  const source = await readFile(
    join(root, `fixtures/runtimes/${runtime}/main.${contract.ext}`),
    "utf8",
  );
  if (!source.includes(contract.packageName)) {
    throw new Error(`${runtime} fixture does not consume ${contract.packageName}`);
  }
}

console.log("Runtime consumption fixtures: OK");
