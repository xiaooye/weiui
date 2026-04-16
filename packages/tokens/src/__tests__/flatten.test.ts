import { describe, it, expect } from "vitest";
import { flatten } from "../flatten";

describe("flatten", () => {
  it("flattens a nested token tree into path-value pairs", () => {
    const tree = {
      color: { blue: { 500: { $value: "oklch(0.623 0.214 262)", $type: "color" } } },
    };
    const result = flatten(tree);
    expect(result).toHaveLength(1);
    expect(result[0].path).toEqual(["color", "blue", "500"]);
    expect(result[0].token.$value).toBe("oklch(0.623 0.214 262)");
  });

  it("skips keys starting with $", () => {
    const tree = {
      $description: "Top level",
      color: { primary: { $value: "blue", $type: "color" } },
    };
    const result = flatten(tree);
    expect(result).toHaveLength(1);
    expect(result[0].path).toEqual(["color", "primary"]);
  });

  it("handles multiple levels of nesting", () => {
    const tree = {
      font: {
        size: {
          xs: { $value: "12px", $type: "dimension" },
          sm: { $value: "14px", $type: "dimension" },
        },
      },
    };
    const result = flatten(tree);
    expect(result).toHaveLength(2);
  });
});
