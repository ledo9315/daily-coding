/**
 * One `<script type="application/ld+json">` per call. The object is serialised here so the
 * pages hand over data, not markup; `</script>` inside a string is escaped, because a
 * challenge title or description is user-editable in the admin panel and must not be able
 * to close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
