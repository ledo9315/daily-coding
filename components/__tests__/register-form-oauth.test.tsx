import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RegisterForm } from "@/components/register-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const render = (props: Parameters<typeof RegisterForm>[0]) =>
  renderToStaticMarkup(<RegisterForm {...props} />);

/**
 * #137: the OAuth buttons only sat on `/login`, although `findOrCreateOAuthUser` creates an
 * account for a first-time provider sign-in. Registration via GitHub or Google already
 * worked — it was just invisible on the page new users actually land on.
 */
describe("RegisterForm", () => {
  it("offers GitHub when it is enabled", () => {
    const html = render({ githubEnabled: true, googleEnabled: false });
    expect(html).toContain("GitHub");
    expect(html).not.toContain(">Google<");
  });

  it("offers Google when it is enabled", () => {
    const html = render({ githubEnabled: false, googleEnabled: true });
    expect(html).toContain("Google");
    expect(html).not.toContain(">GitHub<");
  });

  it("shows no separator when no provider is configured", () => {
    // Same as on the login page: an "or continue with" rule above nothing reads as broken.
    const html = render({ githubEnabled: false, googleEnabled: false });
    expect(html).not.toContain("Oder weitermachen mit");
  });

  it("keeps the e-mail and password fields either way", () => {
    const html = render({ githubEnabled: true, googleEnabled: true });
    for (const field of ['id="name"', 'id="email"', 'id="password"']) {
      expect(html).toContain(field);
    }
    expect(html).toContain("REGISTRIEREN");
  });
});
