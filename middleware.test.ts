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

    const res = await middleware(req("http://localhost:3000/profile"));
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(res.status).toBe(307);
    const loc = res.headers.get("location");
    expect(loc).toContain("/login");
    expect(loc).toContain("callbackUrl=%2Fprofile");
  });

  it("redirects to login when token is missing on protected path", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    const res = await middleware(req("http://localhost:3000/profile"));
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

  it("protects /challenge (exact path, no subpath)", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    const res = await middleware(req("http://localhost:3000/challenge"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fchallenge");
  });

  it("allows /admin when token exists (admin role is checked in the app via DB)", async () => {
    mockGetToken.mockResolvedValueOnce({ sub: "u1", role: "user" });
    const res = await middleware(
      req("http://localhost:3000/admin/challenges/new"),
    );
    expect(res.headers.get("location")).toBeNull();
  });

  it("protects /settings path", async () => {
    mockGetToken.mockResolvedValueOnce(null);
    const res = await middleware(req("http://localhost:3000/settings"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fsettings");
  });

  /**
   * #114: the app answers on daily-coding.de and on the vercel.app alias with identical
   * content. Without a marker, a search engine may index the alias as the real thing and
   * the brand name never appears in the results. A redirect would fix it too, but it
   * would also close the fallback route the alias provides if DNS ever breaks.
   */
  describe("indexing of the vercel.app alias", () => {
    it("marks it noindex", async () => {
      const res = await middleware(req("https://daily-coding-challenge-ui.vercel.app/landing"));
      expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    });

    it("leaves the canonical host indexable", async () => {
      const res = await middleware(req("https://daily-coding.de/landing"));
      expect(res.headers.get("x-robots-tag")).toBeNull();
    });

    it("marks it on protected paths too, where it redirects to the login", async () => {
      mockGetToken.mockResolvedValueOnce(null);
      const res = await middleware(req("https://preview-xyz.vercel.app/profile"));
      expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    });

    it("does not mistake a lookalike host for the alias", async () => {
      const res = await middleware(req("https://vercel.app.daily-coding.de/landing"));
      expect(res.headers.get("x-robots-tag")).toBeNull();
    });
  });
});
