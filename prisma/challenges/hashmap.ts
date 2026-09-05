import { BASE_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function hashMap(operations) {\n  // Your solution here\n  return [];\n}",
  typescript: "function hashMap(operations: any[]): any[] {\n  // Your solution here\n  return [];\n}",
  python: "def hash_map(operations):\n    # Your solution here\n    return []\n",
  php: "<?php\n\nfunction hashMap($operations) {\n    // Your solution here\n    return [];\n}\n",
  ruby: "def hash_map(operations)\n  # Your solution here\n  []\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-hashmap",
  title: "Hash Map Implementation",
  description:
    "Implementiere hashMap(operations).\n\n" +
    "Verarbeite eine Liste von Operationen und gib ein Array mit dem Ergebnis jeder " +
    "Operation zurück. Jede Operation ist [typ, key] oder [typ, key, value].\n\n" +
    '"set" speichert value und ergibt null. "get" gibt den gespeicherten value zurück ' +
    'oder null, wenn der Schlüssel fehlt. "has" gibt einen Boolean zurück. "delete" ' +
    "gibt zurück, ob der Schlüssel vorhanden war.\n\n" +
    "Die Datenstruktur bringt jede Sprache mit. Die Aufgabe ist, ihr Verhalten exakt " +
    "nachzubilden: Was passiert beim Überschreiben, was beim Löschen von etwas, das " +
    "gar nicht da war.",
  difficulty: "medium",
  points: 150,
  categoryId: CATEGORY.datenstrukturen,
  hints: [
    {
      title: "Die Idee",
      body:
        "Zwei Dinge laufen parallel: der Zustand, der zwischen den Operationen " +
        "bestehen bleibt, und das Protokoll, das du zurückgibst. Jede Operation " +
        "verändert den Zustand und hängt genau einen Eintrag ans Protokoll, auch " +
        "dann, wenn sie nichts Sichtbares liefert.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Leg eine Map bzw. ein Dictionary an und ein leeres Ergebnis-Array. Geh die " +
        "Operationen der Reihe nach durch und verzweige über den Typ im ersten " +
        "Element.\n\n" +
        "Bei set schreibst du den Wert und hängst null an. Bei get liest du und hängst " +
        "den Wert oder null an. Bei has hängst du an, ob der Schlüssel existiert. Bei " +
        "delete fragst du zuerst, ob er existiert, entfernst ihn dann und hängst die " +
        "Antwort von vorher an.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Das Ergebnis-Array ist genauso lang wie die Operationsliste. Wer bei set " +
        "nichts anhängt, weil es nichts zurückgibt, verschiebt alle folgenden " +
        "Ergebnisse um eine Position.\n\n" +
        "Bei delete muss die Prüfung vor dem Löschen stehen. Danach ist der Schlüssel " +
        "weg und die Antwort immer false.\n\n" +
        "Ein fehlender Schlüssel ergibt null, nicht undefined und nicht None. In " +
        "JavaScript liefert map.get genau dann undefined. Das musst du auf null " +
        "abbilden, sonst fällt es beim JSON-Vergleich auf.",
    },
  ],
  examples: [
    {
      input: '[["set","a",1],["get","a"],["get","b"]]',
      output: "[null,1,null]",
    },
  ],
  supportedLanguages: [...BASE_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "hashMap",
      typescript: "hashMap",
      python: "hash_map",
      ruby: "hash_map",
      php: "hashMap",
    },
  },
  testCases: [
    {
      id: 1,
      name: "Set und Get",
      input: '[["set","a",1],["get","a"],["get","b"]]',
      expected: "[null,1,null]",
    },
    {
      id: 2,
      name: "Überschreiben",
      input: '[["set","x",5],["set","x",9],["get","x"]]',
      expected: "[null,null,9]",
    },
    {
      id: 3,
      name: "Has und Delete",
      input: '[["set","k",7],["has","k"],["delete","k"],["has","k"],["get","k"]]',
      expected: "[null,true,true,false,null]",
    },
    { id: 4, name: "Fehlender Schlüssel", input: '[["get","nope"]]', expected: "[null]" },
    {
      id: 5,
      name: "Delete nicht vorhanden",
      input: '[["set","a",1],["set","b",2],["delete","c"],["get","b"]]',
      expected: "[null,null,false,2]",
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
  translations: {
    en: {
      title: "Hash Map Implementation",
      description:
        "Implement hashMap(operations).\n\n" +
        "Process a list of operations and return an array holding the result of every " +
        "operation. Each operation is [type, key] or [type, key, value].\n\n" +
        '"set" stores value and yields null. "get" returns the stored value, or null ' +
        'when the key is missing. "has" returns a boolean. "delete" returns whether the ' +
        "key was there.\n\n" +
        "Every language ships this data structure. The task is to reproduce its behavior " +
        "exactly: what happens when you overwrite something, and when you delete " +
        "something that was never there.",
      hints: [
        {
          title: "The idea",
          body:
            "Two things run side by side: the state that survives from one operation to " +
            "the next, and the log you return. Every operation changes the state and " +
            "appends exactly one entry to the log, even when it produces nothing " +
            "visible.",
        },
        {
          title: "The implementation",
          body:
            "Create a map or dictionary and an empty result array. Walk the operations in " +
            "order and branch on the type in the first element.\n\n" +
            "For set you write the value and append null. For get you read and append the " +
            "value or null. For has you append whether the key exists. For delete you ask " +
            "first whether it exists, then remove it and append the answer you got before.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The result array is exactly as long as the list of operations. Append nothing " +
            "for set because it returns nothing, and every result after it moves up one " +
            "position.\n\n" +
            "For delete, the check has to come before the removal. Afterwards the key is " +
            "gone and the answer is always false.\n\n" +
            "A missing key yields null, not undefined and not None. In this case " +
            "JavaScript's map.get returns exactly that: undefined. You have to map it " +
            "onto null, or the JSON comparison catches it.",
        },
      ],
      testCaseNames: {
        "1": "Set and get",
        "2": "Overwriting",
        "3": "Has and delete",
        "4": "Missing key",
        "5": "Delete a key that is not there",
      },
    },
  },
};
