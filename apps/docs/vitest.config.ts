import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "scripts",
          include: ["scripts/**/__tests__/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["src/**/__tests__/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["./src/test-setup.ts"],
        },
      },
    ],
  },
});
