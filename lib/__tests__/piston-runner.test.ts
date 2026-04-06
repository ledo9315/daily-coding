import { describe, it, expect } from "vitest";
import { pistonHttpEndpoints } from "@/lib/server/piston-runner";

describe("pistonHttpEndpoints", () => {
  it("self-host: Origin → /api/v2/runtimes", () => {
    const u = pistonHttpEndpoints("http://127.0.0.1:2000");
    expect(u.runtimes).toBe("http://127.0.0.1:2000/api/v2/runtimes");
    expect(u.execute).toBe("http://127.0.0.1:2000/api/v2/execute");
  });

  it("legacy EMKC prefix: avoids duplicate /api/v2", () => {
    const u = pistonHttpEndpoints("https://example.org/api/v2/piston");
    expect(u.runtimes).toBe("https://example.org/api/v2/piston/runtimes");
    expect(u.execute).toBe("https://example.org/api/v2/piston/execute");
  });

  it("trims trailing slash", () => {
    const u = pistonHttpEndpoints("http://host:2000/");
    expect(u.execute).toBe("http://host:2000/api/v2/execute");
  });
});
