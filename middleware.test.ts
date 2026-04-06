import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetToken = vi.fn();

vi.mock("next-auth/jwt", () => ({
  getToken: (opts: unknown) => mockGetToken(opts),
}));

describe("middleware", () => {
  let middleware: (req: NextRequest) => ReturnType<
    typeof import("./middleware").middleware
  >;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.AUTH_SECRET = "unit-test-secret";
    delete process.env.NEXTAUTH_SECRET;
    middleware = (await import("./middleware")).middleware;
  });

  afterEach(() => {
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    vi.unstubAllEnvs();
  });

  function req(url: string) {
    return new NextRequest(new URL(url));
  }

  it("passes through for unprotected paths without calling getToken", async () => {
    const res = await middleware(req("http://localhost:3000/login"));
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects to login with callbackUrl when no secret is set", async () => {
    delete process.env.AUTH_SECRET;
    vi.resetModules();
    middleware = (await import("./middleware")).middleware;

    const res = await middleware(req("http://localhost:3000/dashboard"));
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(res.status).toBe(307);
    const loc = res.headers.get("location");
    expect(loc).toContain("/login");
    expect(loc).toContain("callbackUrl=%2Fdashboard");
  });

  it("redirects to login when token is missing on protected path", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    const res = await middleware(req("http://localhost:3000/dashboard"));
    expect(mockGetToken).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login");
    expect(res.headers.get("location")).toContain("callbackUrl");
  });

  it("allows request when token is present", async () => {
    mockGetToken.mockResolvedValueOnce({ sub: "user-1" });
    const res = await middleware(req("http://localhost:3000/profile/settings"));
    expect(res.headers.get("location")).toBeNull();
  });

  it("protects nested routes under /challenge", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    const res = await middleware(
      req("http://localhost:3000/challenge/abc-123")
    );
    expect(res.status).toBe(307);
  });

  it("protects /challenge (ohne Unterpfad)", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    const res = await middleware(req("http://localhost:3000/challenge"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fchallenge");
  });
});
