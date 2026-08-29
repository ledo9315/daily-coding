export type ChangelogEntry = {
  /** Tag of the matching GitHub release, e.g. `v0.1.0`. */
  version: string;
  /** Release date as `YYYY-MM-DD` - parsed, never shown raw. */
  date: string;
  /** What changed, in the words of someone using the site rather than writing it. */
  changes: string[];
};

/**
 * One entry per release, newest first - not one per merge. A merge is a developer-sized
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
      "Nach einer erfolgreichen Abgabe öffnet sich eine Ergebnisseite: eigene Lösung, die Lösungen anderer Nutzer und Kommentare dazu, statt des bisherigen Erfolgs-Fensters.",
      "Der Code-Editor lässt sich auf Fenstergröße aufziehen. Steht der Cursor im Editor, führt Strg/Cmd+S die Tests aus.",
      "Öffentliche Profilseiten: Handles sind überall klickbar und führen auf ein Profil, das ohne Login sichtbar ist.",
      "Die öffentliche Profilseite zeigt Statistiken, Achievements und die zuletzt gelösten Challenges.",
      "Die Rangliste hat einen dritten Tab „Gesamt“ über alle Zeiträume hinweg.",
      "Eine Abgabe lässt sich bis zum Tageswechsel beliebig oft überschreiben. Eine bestandene Challenge bleibt dabei bestanden.",
      "Diese Changelog-Seite, verlinkt im Footer.",
      "Einmal freigeschaltete Achievements bleiben freigeschaltet, auch wenn eine Abgabe später überschrieben wird.",
      "Der Start-Avatar wird aus dem Anzeigenamen abgeleitet statt aus der E-Mail-Adresse.",
      "Bei hellem System-Theme färbten sich Flächen beim Hovern orange. Behoben.",
      "Beim Hovern über den Profil-Avatar wechselt nur noch der Rahmen die Farbe.",
      "Text auf Outline-Buttons bleibt beim Hovern lesbar.",
    ],
  },
];
