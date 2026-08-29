import { beforeAll, describe, expect, it } from "vitest";
import { buildWrappedProgram } from "@/lib/server/io-harness";
import { executeWithPiston } from "@/lib/server/piston-runner";
import type { CodeLanguageId } from "@/lib/challenge-languages";

/**
 * The one test that would have caught TS2580 on the day it appeared.
 *
 * Every other test here checks the string the harness builds, never whether the result runs.
 * That is how the TypeScript harness could reference `require` and `process` for weeks while
 * Piston's image, which has no @types/node, rejected every submission at compile time - users
 * saw 0/5 with a compiler error where a test result belonged.
 *
 * Skips itself when nothing answers at PISTON_API_URL, so CI and a laptop without Docker stay
 * green. Run it with `pnpm infra:up` for real coverage.
 */
const ORIGIN = (process.env.PISTON_API_URL ?? "http://127.0.0.1:2000").replace(/\/+$/u, "");

let pistonUp = false;

beforeAll(async () => {
  try {
    const res = await fetch(`${ORIGIN}/api/v2/runtimes`, {
      signal: AbortSignal.timeout(2000),
    });
    pistonUp = res.ok;
  } catch {
    pistonUp = false;
  }
});

/** Same algorithm in each language, same entry point name per the seed's convention. */
const SOLUTIONS: Record<CodeLanguageId, { code: string; callable: string }> = {
  javascript: {
    callable: "maxSubArray",
    code: `function maxSubArray(nums) {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
  },
  typescript: {
    callable: "maxSubArray",
    code: `function maxSubArray(nums: number[]): number {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
  },
  python: {
    callable: "max_sub_array",
    code: `def max_sub_array(nums):
    best = cur = nums[0]
    for n in nums[1:]:
        cur = max(n, cur + n)
        best = max(best, cur)
    return best`,
  },
  ruby: {
    callable: "max_sub_array",
    code: `def max_sub_array(nums)
  best = cur = nums[0]
  nums[1..].each do |n|
    cur = [n, cur + n].max
    best = [best, cur].max
  end
  best
end`,
  },
  rust: {
    callable: "max_sub_array",
    code: `fn max_sub_array(nums: Vec<i64>) -> i64 {
    let mut best = nums[0];
    let mut cur = nums[0];
    for &n in nums.iter().skip(1) {
        cur = if cur + n > n { cur + n } else { n };
        if cur > best { best = cur; }
    }
    best
}`,
  },
  csharp: {
    callable: "MaxSubArray",
    code: `static int MaxSubArray(int[] nums) {
        int best = nums[0], cur = nums[0];
        for (int i = 1; i < nums.Length; i++) {
            cur = Math.Max(nums[i], cur + nums[i]);
            best = Math.Max(best, cur);
        }
        return best;
    }`,
  },
  cpp: {
    callable: "maxSubArray",
    code: `int maxSubArray(vector<int> nums) {
    int best = nums[0], cur = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        cur = max(nums[i], cur + nums[i]);
        best = max(best, cur);
    }
    return best;
}`,
  },
  go: {
    callable: "maxSubArray",
    code: `func maxSubArray(nums []int) int {
	best, cur := nums[0], nums[0]
	for _, n := range nums[1:] {
		if cur+n > n {
			cur = cur + n
		} else {
			cur = n
		}
		if cur > best {
			best = cur
		}
	}
	return best
}`,
  },
  java: {
    callable: "maxSubArray",
    code: `static int maxSubArray(int[] nums) {
    int best = nums[0], cur = nums[0];
    for (int i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]);
        best = Math.max(best, cur);
    }
    return best;
}`,
  },
  php: {
    callable: "maxSubArray",
    code: `<?php

function maxSubArray($nums) {
    $best = $cur = $nums[0];
    for ($i = 1; $i < count($nums); $i++) {
        $cur = max($nums[$i], $cur + $nums[$i]);
        $best = max($best, $cur);
    }
    return $best;
}`,
  },
};

const CASES: [string, string][] = [
  ["[-2,1,-3,4,-1,2,1,-5,4]", "6"],
  ["[1]", "1"],
  ["[-1,-2,-3]", "-1"],
];

describe.each(Object.keys(SOLUTIONS) as CodeLanguageId[])("Piston: %s", (language) => {
  const { code, callable } = SOLUTIONS[language];

  it.each(CASES)("%s ergibt %s", async (stdin, expected) => {
    if (!pistonUp) {
      console.warn(`[piston] kein Container unter ${ORIGIN}, Test übersprungen`);
      return;
    }

    const program = buildWrappedProgram(language, code, callable, stdin);
    const result = await executeWithPiston(language, program, stdin);

    /*
      Not a failed test but a runtime that never started. Mono's JIT dies with an assertion in
      tramp-amd64.c under the QEMU emulation the amd64 image needs on Apple Silicon; on the x86
      host it runs in 15 ms. Failing here would only report the laptop.
    */
    if (result.stderr.includes("Sandbox keeper received fatal signal")) {
      console.warn(`[piston] ${language}: Laufzeit startet hier nicht (Emulation?), Test übersprungen`);
      return;
    }

    // The message matters more than the assertion: a compile error is why nothing ran.
    expect(result.compileFailed, result.compileOutput).toBe(false);
    expect(result.stdout.trim(), result.stderr).toBe(expected);
  }, 30_000);
});
