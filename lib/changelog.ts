import type { AppLocale } from "@/lib/locale";

export type ChangelogEntry = {
  /** Tag of the matching GitHub release, e.g. `v0.1.0`. */
  version: string;
  /** Release date as `YYYY-MM-DD` - parsed, never shown raw. */
  date: string;
  /**
   * What changed, in the words of someone using the site rather than writing it - one
   * list per language.
   *
   * The prose stays here instead of moving into `messages/<locale>/changelog.json`: a
   * release is a numbered block of sentences that belong together, and a message file
   * would have to key each line by its position in a list nobody ever edits again.
   */
  changes: Record<AppLocale, string[]>;
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
    version: "v0.4.0",
    date: "2026-09-04",
    changes: {
      de: [
        "Die App gibt es jetzt auf Deutsch und Englisch. Umstellen kannst du in den Einstellungen unter „Sprache“; beim ersten Besuch richtet sie sich nach deinem Browser. Die Wahl gilt auch für die E-Mails, die du bekommst.",
        "Alle 40 Aufgaben und alle 23 Achievements sind übersetzt — Titel, Beschreibung, Hinweise und die Namen der Testfälle.",
        "Die Seite ist auf daily-coding.dev umgezogen. Alte Links auf daily-coding.de funktionieren weiter und leiten auf die deutsche Fassung.",
        "Impressum und Datenschutzerklärung gibt es ebenfalls auf Englisch. Maßgeblich bleibt die deutsche Fassung; die englische Seite sagt das jetzt auch.",
        "Datums- und Zahlenangaben folgen der eingestellten Sprache — der 4.9.2026 ist im Englischen 9/4/2026, und 1.500 Punkte werden zu 1,500.",
      ],
      en: [
        "The app now speaks German and English. Switch in the settings under \"Language\"; on a first visit it follows your browser. Your choice applies to the emails you get, too.",
        "All 40 challenges and all 23 achievements are translated - title, description, hints and the names of the test cases.",
        "The site moved to daily-coding.dev. Old links to daily-coding.de keep working and lead to the German version.",
        "The legal notice and the privacy policy are available in English as well. The German version remains the authoritative one, and the English page now says so.",
        "Dates and numbers follow the language you picked - 4.9.2026 becomes 9/4/2026, and 1.500 points become 1,500.",
      ],
    },
  },
  {
    version: "v0.3.0",
    date: "2026-09-03",
    changes: {
      de: [
        "25 neue Challenges, von 15 auf 40: die bekanntesten Aufgaben von LeetCode und Codewars, darunter Trapping Rain Water, Edit Distance, Coin Change und Who likes it? Verteilung danach: 21 leicht, 15 mittel, 4 schwer.",
        "17 neue Achievements, von 6 auf 23, für Streaks, gelöste Sprachen, Kommentare und Bewertungen. Wer sie sich früher verdient hat, bekommt sie rückwirkend mit dem richtigen Datum.",
        "Das Profil zeigt vier Achievements auf einer kompakten Karte; „Alle 23 anzeigen“ öffnet die vollständige Liste, nach Stufe gruppiert von gewöhnlich bis legendär.",
        "TypeScript-Abgaben können Map, Set, padStart und Co. verwenden. Bisher lehnte die Prüfung sie ab, obwohl dasselbe in JavaScript lief.",
        "Auf dem Dashboard steht der Streak-Rekord in der Fußzeile der Karte, und der Punkte-Trend erscheint nur, wenn es aufwärts ging.",
      ],
      en: [
        "25 new challenges, up from 15 to 40: the best-known problems from LeetCode and Codewars, among them Trapping Rain Water, Edit Distance, Coin Change and Who likes it? The spread now: 21 easy, 15 medium, 4 hard.",
        "17 new achievements, up from 6 to 23, for streaks, languages solved, comments and ratings. Anyone who earned one earlier gets it retroactively, dated when it happened.",
        "The profile shows four achievements on a compact card; \"Show all 23\" opens the full list, grouped by tier from common to legendary.",
        "TypeScript submissions can use Map, Set, padStart and the rest. Until now the check rejected them, even though the same code ran in JavaScript.",
        "On the dashboard the streak record sits in the card's footer, and the points trend only shows up when things went up.",
      ],
    },
  },
  {
    version: "v0.2.0",
    date: "2026-08-30",
    changes: {
      de: [
        "Nach einer bestandenen Abgabe führt ein Knopf direkt zur Ergebnisseite, statt nur der Toast, der nach ein paar Sekunden weg ist.",
        "Die Lösungsseite ist neu gebaut: fremde Lösungen stehen in Panels, lassen sich sortieren und filtern, und identische Lösungen sind zu einer Gruppe zusammengefasst.",
        "Fremde Lösungen lassen sich mit „Best Practices“ und „Clever“ bewerten und direkt mit der eigenen vergleichen.",
        "Abgegebener Code wird mit Syntaxhervorhebung angezeigt.",
        "Über der Lösung stehen die Testergebnisse eingeklappt statt der ausgeschriebenen Testfälle.",
        "Kommentare und Bewertungen zur eigenen Lösung erscheinen als Benachrichtigung im Menü.",
        "Die Einstellungen sind in Bereiche mit eigener Seitenleiste aufgeteilt.",
        "Das Profil zeigt die Allzeit-Platzierung an der Stelle der bisherigen Badges-Karte.",
        "Der Footer steht auf allen Seiten, ist in Marken- und Linkspalten gegliedert und weist auf ein neues Release hin.",
        "Level werden ohne Titel geführt.",
        "Beim Teilen erscheint die Startseite als Vorschaubild statt des gezeichneten Motivs.",
        "E-Mails sind als Brief gesetzt statt als Karte.",
        "Das öffentliche Profil bekommt den lila Ambient-Blur der übrigen Seiten, das ambiente Leuchten ist insgesamt heller.",
        "Die Dot-Animation der Karten läuft auch auf Mobilgeräten.",
        "Das Löschen des Kontos ist lesbar und hinter einer klaren Bestätigung.",
        "Formularfelder sind wieder sichtbar abgesetzt, Überschriften auf Profil und Einstellungen einheitlich.",
        "Dropdowns heben grau statt farbig hervor und behalten nach einem Klick keinen Fokusrahmen.",
        "Auf Mobilgeräten hatten Karten doppeltes Padding. Behoben.",
        "Die Sprachauswahl liegt im maximierten Editor wieder über dem Overlay.",
      ],
      en: [
        "After a passing submission a button leads straight to the result page, instead of only the toast that is gone a few seconds later.",
        "The solution page is rebuilt: other people's solutions sit in panels, can be sorted and filtered, and identical ones are collapsed into a single group.",
        "Other people's solutions can be rated \"Best Practices\" and \"Clever\", and compared with your own side by side.",
        "Submitted code is shown with syntax highlighting.",
        "Above the solution the test results sit collapsed, instead of the test cases spelled out in full.",
        "Comments and ratings on your own solution arrive as a notification in the menu.",
        "Settings are split into sections with a sidebar of their own.",
        "The profile shows your all-time rank where the badges card used to be.",
        "The footer is on every page, laid out in a brand column and link columns, and points at a new release.",
        "Levels no longer carry titles.",
        "Shared links preview the landing page instead of the drawn artwork.",
        "Emails are set as a letter rather than a card.",
        "The public profile gets the purple ambient blur of every other page, and the ambient glow is brighter throughout.",
        "The cards' dot animation runs on mobile too.",
        "Deleting your account is readable, and behind a clear confirmation.",
        "Form fields stand out visibly again, and the headings on profile and settings match.",
        "Dropdowns highlight in grey instead of colour and keep no focus ring after a click.",
        "On mobile, cards had double padding. Fixed.",
        "In the maximised editor the language picker sits above the overlay again.",
      ],
    },
  },
  {
    version: "v0.1.0",
    date: "2026-08-29",
    changes: {
      de: [
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
      en: [
        "A successful submission now opens a result page: your own solution, the solutions of other users and the comments on them, instead of the old success dialog.",
        "The code editor can be pulled out to window size. With the cursor in the editor, Ctrl/Cmd+S runs the tests.",
        "Public profile pages: handles are clickable everywhere and lead to a profile that is visible without a login.",
        "The public profile page shows statistics, achievements and the most recently solved challenges.",
        "The leaderboard has a third tab, \"All time\", across every period.",
        "A submission can be overwritten as often as you like until the day flips. A challenge you passed stays passed.",
        "This changelog page, linked in the footer.",
        "Achievements stay unlocked once unlocked, even when a submission is overwritten later.",
        "The starting avatar is derived from the display name instead of the email address.",
        "Under a light system theme, surfaces turned orange on hover. Fixed.",
        "Hovering the profile avatar changes nothing but the border colour.",
        "Text on outline buttons stays readable on hover.",
      ],
    },
  },
];
