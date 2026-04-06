import { describe, it, expect } from "vitest";
import { MONACO_THEME_FRAPPE } from "@/lib/monaco-catppuccin-frappe";

describe("monaco-catppuccin-frappe", () => {
  it("exports stable theme id", () => {
    expect(MONACO_THEME_FRAPPE).toBe("catppuccin-frappe");
  });
});
