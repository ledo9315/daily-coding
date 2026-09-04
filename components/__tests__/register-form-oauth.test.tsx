import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { RegisterForm } from "@/components/register-form";
import auth from "@/messages/de/auth.json";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const render = (props: Parameters<typeof RegisterForm>[0]) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="de" messages={{ auth }}>
      <RegisterForm {...props} />
    </NextIntlClientProvider>
  );

/**
 * #137: the OAuth buttons only sat on `/login`, although `findOrCreateOAuthUser` creates an
 * account for a first-time provider sign-in. Registration via GitHub or Google already
 * worked - it was just invisible on the page new users actually land on.
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
    expect(html).not.toContain(auth.oauthButtons.separator);
  });

  it("keeps the e-mail and password fields either way", () => {
    const html = render({ githubEnabled: true, googleEnabled: true });
    for (const field of ['id="name"', 'id="email"', 'id="password"']) {
      expect(html).toContain(field);
    }
    expect(html).toContain(auth.registerForm.submit);
  });

  it("communicates the display-name constraints before submission", () => {
    const html = render({ githubEnabled: false, googleEnabled: false });

    expect(html).toContain('id="name"');
    expect(html).toContain('minLength="2"');
    expect(html).toContain('maxLength="50"');
    expect(html).toContain(auth.registerForm.nameRequirements.replace("{max}", "50"));
  });
});
