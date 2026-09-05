import { BASE_LANGUAGES, CATEGORY, type ChallengeContent } from "./types";

const starter = {
  javascript: "function inorderTraversal(root) {\n  // Your solution here\n  return [];\n}",
  typescript:
    "function inorderTraversal(root: any): number[] {\n  // Your solution here\n  return [];\n}",
  python: "def inorder_traversal(root):\n    # Your solution here\n    return []\n",
  php: "<?php\n\nfunction inorderTraversal($root) {\n    // Your solution here\n    return [];\n}\n",
  ruby: "def inorder_traversal(root)\n  # Your solution here\n  []\nend\n",
};

export const challenge: ChallengeContent = {
  id: "challenge-binary-tree",
  title: "Binary Tree Traversal",
  description:
    "Implementiere inorderTraversal(root).\n\n" +
    "Gib die Knotenwerte in In-order-Reihenfolge als Array zurück: erst der linke " +
    "Teilbaum, dann die Wurzel, dann der rechte. Ein Knoten hat die Form " +
    "{ val, left, right }, leere Teilbäume sind null.\n\n" +
    "Bei einem Suchbaum ist das Ergebnis sortiert, nicht durch Zufall, sondern weil " +
    "genau das die Ordnung ist, die ein Suchbaum herstellt.",
  difficulty: "hard",
  points: 200,
  categoryId: CATEGORY.baeume,
  hints: [
    {
      title: "Die Idee",
      body:
        "Jeder Teilbaum ist selbst wieder ein Baum. Was du für die Wurzel tust, tust " +
        "du für jeden Knoten: links alles einsammeln, dann den eigenen Wert, dann " +
        "rechts alles einsammeln.\n\n" +
        "Die Rekursion endet dort, wo kein Knoten mehr ist, und ein leerer Baum " +
        "steuert eine leere Liste bei.",
    },
    {
      title: "Die Umsetzung",
      body:
        "Ist root null, gib ein leeres Array zurück. Sonst setze drei Teile " +
        "aneinander: das Ergebnis des Aufrufs für root.left, den Wert root.val als " +
        "einzelnes Element, das Ergebnis des Aufrufs für root.right.\n\n" +
        "Wer keine Arrays zusammenbauen will, gibt stattdessen eine gemeinsame Liste " +
        "durch alle Aufrufe durch und hängt den Wert an der richtigen Stelle an.",
    },
    {
      title: "Woran die meisten scheitern",
      body:
        "Die Reihenfolge der drei Schritte. Wird der eigene Wert vor dem linken " +
        "Teilbaum angehängt, ist das Pre-order: der Suchbaum kommt dann als [2,1,3] " +
        "statt [1,2,3] heraus. Alle Testfälle bis auf den Einzelknoten fallen darüber.\n\n" +
        "Der Abbruch bei null muss vor jedem Zugriff stehen, nicht nur ganz oben. " +
        "Jeder Blattknoten hat zwei null-Kinder, ohne die Prüfung greifst du auf " +
        "root.val eines nicht vorhandenen Knotens zu.\n\n" +
        "Der leere Baum ist selbst eine Eingabe: root ist dann direkt null, und die " +
        "Antwort ist das leere Array.",
    },
  ],
  translations: {
    en: {
      title: "Binary Tree Traversal",
      description:
        "Implement inorderTraversal(root).\n\n" +
        "Return the node values in in-order as an array: first the left subtree, then " +
        "the root, then the right one. A node has the shape { val, left, right }, empty " +
        "subtrees are null.\n\n" +
        "For a search tree the result comes out sorted, not by accident, but because " +
        "that is exactly the order a search tree establishes.",
      hints: [
        {
          title: "The idea",
          body:
            "Every subtree is a tree in its own right. What you do for the root, you do " +
            "for every node: collect everything on the left, then your own value, then " +
            "everything on the right.\n\n" +
            "The recursion ends where there is no node left, and an empty tree " +
            "contributes an empty list.",
        },
        {
          title: "The implementation",
          body:
            "If root is null, return an empty array. Otherwise put three parts together: " +
            "the result of the call for root.left, the value root.val as a single " +
            "element, the result of the call for root.right.\n\n" +
            "If you would rather not stitch arrays together, pass one shared list through " +
            "all the calls instead and append the value at the right moment.",
        },
        {
          title: "Where most people go wrong",
          body:
            "The order of the three steps. Append your own value before the left subtree " +
            "and you have pre-order: the search tree then comes out as [2,1,3] instead " +
            "of [1,2,3]. Every test case except the single node trips over it.\n\n" +
            "The null check has to come before every access, not just at the very top. " +
            "Every leaf node has two null children, without the check you reach for " +
            "root.val of a node that is not there.\n\n" +
            "The empty tree is an input of its own: root is null right away, and the " +
            "answer is the empty array.",
        },
      ],
      testCaseNames: {
        "1": "Empty tree",
        "2": "Single node",
        "3": "Right-heavy",
        "4": "Search tree",
        "5": "Complete tree",
      },
    },
  },
  examples: [
    {
      input: '{ "val": 2, "left": { "val": 1 }, "right": { "val": 3 } }',
      output: "[1,2,3]",
    },
  ],
  supportedLanguages: [...BASE_LANGUAGES],
  evaluationConfig: {
    callableByLanguage: {
      javascript: "inorderTraversal",
      typescript: "inorderTraversal",
      python: "inorder_traversal",
      ruby: "inorder_traversal",
      php: "inorderTraversal",
    },
  },
  testCases: [
    { id: 1, name: "Leerer Baum", input: "null", expected: "[]" },
    {
      id: 2,
      name: "Einzelner Knoten",
      input: '{"val":1,"left":null,"right":null}',
      expected: "[1]",
    },
    {
      id: 3,
      name: "Rechts-lastig",
      input:
        '{"val":1,"left":null,"right":{"val":2,"left":{"val":3,"left":null,"right":null},"right":null}}',
      expected: "[1,3,2]",
    },
    {
      id: 4,
      name: "Suchbaum",
      input:
        '{"val":2,"left":{"val":1,"left":null,"right":null},"right":{"val":3,"left":null,"right":null}}',
      expected: "[1,2,3]",
    },
    {
      id: 5,
      name: "Vollständiger Baum",
      input:
        '{"val":4,"left":{"val":2,"left":{"val":1,"left":null,"right":null},"right":{"val":3,"left":null,"right":null}},"right":{"val":6,"left":{"val":5,"left":null,"right":null},"right":{"val":7,"left":null,"right":null}}}',
      expected: "[1,2,3,4,5,6,7]",
    },
  ],
  starterCodes: starter,
  starterCode: starter.javascript,
};
