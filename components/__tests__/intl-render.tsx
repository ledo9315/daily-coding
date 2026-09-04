import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";

/**
 * Every namespace of one locale, keyed by namespace - the same shape `i18n/request.ts`
 * hands to the provider in the app. Read from disk rather than imported, so a namespace
 * added later needs no change here.
 *
 * The return type is left inferred on purpose. `createTranslator` derives its key type from
 * the messages it is handed, and annotating this `Record<string, unknown>` narrows every key
 * to `never`; the inferred type matches what `useTranslations` sees in the app.
 */
export function messagesFor(locale: string) {
  const dir = resolve(process.cwd(), "messages", locale);
  return Object.fromEntries(
    readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => [
        file.replace(/\.json$/, ""),
        JSON.parse(readFileSync(resolve(dir, file), "utf8")),
      ])
  );
}

/**
 * Components that format a number or a date read the locale from next-intl's context, and
 * anything with a label reads its messages from there too. The root layout provides both in
 * the app; a bare `renderToStaticMarkup` provides nothing and the hook throws. German by
 * default, because these tests assert German output.
 */
export function renderWithIntl(node: ReactElement, locale = "de"): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={messagesFor(locale)}>
      {node}
    </NextIntlClientProvider>
  );
}
