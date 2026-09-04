import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createTranslator } from "next-intl";
import api from "@/messages/de/api.json";
import auth from "@/messages/de/auth.json";
import challenge from "@/messages/de/challenge.json";
import changelog from "@/messages/de/changelog.json";
import community from "@/messages/de/community.json";
import dashboard from "@/messages/de/dashboard.json";
import email from "@/messages/de/email.json";
import legal from "@/messages/de/legal.json";
import profile from "@/messages/de/profile.json";

/**
 * Every namespace, imported rather than read from disk: `createTranslator` derives its key
 * type from the object it is handed, and a `Record<string, unknown>` narrows every key to
 * `never`.
 */
const MESSAGES = {
  api,
  auth,
  challenge,
  changelog,
  community,
  dashboard,
  email,
  legal,
  profile,
};

/**
 * Stand-in for `next-intl/server` in route-handler tests.
 *
 * Outside the react-server build - which Vitest never uses - `getTranslations` throws
 * "not supported in Client Components". The replacement translates through the real
 * German catalogues rather than echoing the key back, so the assertions keep checking the
 * text a German caller receives and a key missing from `messages/de/<ns>.json` fails the
 * test instead of silently rendering its own path.
 *
 * Use it as the factory of a hoisted mock:
 *
 *     vi.mock("next-intl/server", async () =>
 *       (await import("@/app/api/__tests__/api-translations-mock")).apiTranslationsMock()
 *     );
 */
type Namespace = keyof typeof MESSAGES;

/**
 * The one namespace asked for in a language other than German, read from disk: only the
 * German catalogues are imported above, and importing eighteen files to serve the handful
 * of routes that translate for an explicit locale is worse than one read per call.
 */
function catalogueOf(locale: string, namespace: Namespace): typeof MESSAGES {
  const file = resolve(process.cwd(), "messages", locale, `${namespace}.json`);
  return { ...MESSAGES, [namespace]: JSON.parse(readFileSync(file, "utf8")) };
}

export function apiTranslationsMock() {
  return {
    /**
     * Both call forms of the real `getTranslations`: the namespace alone, which follows the
     * request locale, and `{ locale, namespace }`, which a handler uses when it has to
     * answer in a language other than the caller's.
     */
    getTranslations: async <N extends Namespace>(
      options: N | { locale: string; namespace: N }
    ) => {
      if (typeof options === "string") {
        return createTranslator({ locale: "de", messages: MESSAGES, namespace: options });
      }
      const { locale, namespace } = options;
      return createTranslator({
        locale,
        messages: locale === "de" ? MESSAGES : catalogueOf(locale, namespace),
        namespace,
      });
    },
    getLocale: async () => "de",
  };
}
