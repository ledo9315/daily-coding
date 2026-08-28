export type ChangelogEntry = {
  /** Tag of the matching GitHub release, e.g. `v0.1.0`. */
  version: string;
  /** Release date as `YYYY-MM-DD` — parsed, never shown raw. */
  date: string;
  /** What changed, in the words of someone using the site rather than writing it. */
  changes: string[];
};

/**
 * One entry per release, newest first — not one per merge. A merge is a developer-sized
 * unit; a release is the one a user can read in a sitting.
 *
 * Written by hand rather than pulled from the GitHub API: what belongs here is a
 * selection in user language, and an API call would put the network in the request path
 * of a page that changes a few times a year.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "v0.1.0",
    date: "2026-08-29",
    changes: [
      "Öffentliche Profilseiten: Handles sind überall klickbar und führen auf ein Profil, das ohne Login sichtbar ist.",
      "Die öffentliche Profilseite zeigt jetzt Statistiken, Achievements und die zuletzt gelösten Challenges.",
      "Die Rangliste hat einen dritten Tab „Gesamt“ über alle Zeiträume hinweg.",
      "Eine Abgabe lässt sich bis zum Tageswechsel beliebig oft überschreiben. Eine bestandene Challenge bleibt dabei bestanden.",
      "Der Start-Avatar wird aus dem Anzeigenamen abgeleitet statt aus der E-Mail-Adresse.",
      "Text auf Outline-Buttons bleibt beim Hovern lesbar.",
    ],
  },
];
