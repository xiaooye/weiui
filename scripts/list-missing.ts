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

for (const file of project.getSourceFiles()) {
  for (const iface of file.getInterfaces()) {
    if (!iface.isExported()) continue;
    if (!iface.getName().endsWith("Props")) continue;
    for (const prop of iface.getProperties()) {
      const hasDoc = prop.getJsDocs().some((d) => d.getDescription().trim().length > 0);
      if (!hasDoc) {
        console.log(`${file.getFilePath()}:${prop.getStartLineNumber()} ${iface.getName()}.${prop.getName()}`);
      }
    }
  }
}
