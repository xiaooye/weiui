import { Project } from "ts-morph";
import { join } from "node:path";

const project = new Project({
  tsConfigFilePath: join(process.cwd(), "tsconfig.base.json"),
  skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths([
  "packages/react/src/components/**/*.tsx",
  "packages/headless/src/**/*.ts",
]);

let total = 0;
let documented = 0;
const missing: string[] = [];

for (const file of project.getSourceFiles()) {
  for (const iface of file.getInterfaces()) {
    if (!iface.isExported()) continue;
    if (!iface.getName().endsWith("Props")) continue;
    for (const prop of iface.getProperties()) {
      total++;
      const hasDoc = prop.getJsDocs().some((d) => d.getDescription().trim().length > 0);
      if (hasDoc) documented++;
      else missing.push(`${file.getFilePath()}:${prop.getStartLineNumber()} ${iface.getName()}.${prop.getName()}`);
    }
  }
}

const coverage = total === 0 ? 100 : (documented / total) * 100;
console.log(`JSDoc coverage on Props: ${documented}/${total} (${coverage.toFixed(1)}%)`);
if (coverage < 95) {
  console.log(`\n${missing.length} undocumented props:`);
  missing.slice(0, 30).forEach((m) => console.log(`  ${m}`));
  if (missing.length > 30) console.log(`  ...and ${missing.length - 30} more`);
  process.exit(1);
}
