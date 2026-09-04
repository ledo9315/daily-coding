import type { ChallengeContent } from "./types";
import { challenge as arrayManipulation } from "./array-manipulation";
import { challenge as bestTimeToBuyAndSellStock } from "./best-time-to-buy-and-sell-stock";
import { challenge as binarySearch } from "./binary-search";
import { challenge as binaryTree } from "./binary-tree";
import { challenge as bitCounting } from "./bit-counting";
import { challenge as climbingStairs } from "./climbing-stairs";
import { challenge as coinChange } from "./coin-change";
import { challenge as containerWithMostWater } from "./container-with-most-water";
import { challenge as containsDuplicate } from "./contains-duplicate";
import { challenge as countVowels } from "./count-vowels";
import { challenge as digitalRoot } from "./digital-root";
import { challenge as duplicateEncoder } from "./duplicate-encoder";
import { challenge as editDistance } from "./edit-distance";
import { challenge as findTheOddInt } from "./find-the-odd-int";
import { challenge as fizzBuzz } from "./fizzbuzz";
import { challenge as hashMap } from "./hashmap";
import { challenge as houseRobber } from "./house-robber";
import { challenge as humanReadableTime } from "./human-readable-time";
import { challenge as jumpGame } from "./jump-game";
import { challenge as longestCommonPrefix } from "./longest-common-prefix";
import { challenge as longestConsecutiveSequence } from "./longest-consecutive-sequence";
import { challenge as longestSubstringWithoutRepeating } from "./longest-substring-without-repeating";
import { challenge as maxSubArray } from "./max-subarray";
import { challenge as medianOfTwoSortedArrays } from "./median-of-two-sorted-arrays";
import { challenge as mergeIntervals } from "./merge-intervals";
import { challenge as moveZeroes } from "./move-zeroes";
import { challenge as multiplesOf3Or5 } from "./multiples-of-3-or-5";
import { challenge as palindromeNumber } from "./palindrome-number";
import { challenge as persistentBugger } from "./persistent-bugger";
import { challenge as productOfArrayExceptSelf } from "./product-of-array-except-self";
import { challenge as recursion } from "./recursion";
import { challenge as romanToInteger } from "./roman-to-integer";
import { challenge as rotateArray } from "./rotate-array";
import { challenge as singleNumber } from "./single-number";
import { challenge as stringReversal } from "./string-reversal";
import { challenge as trappingRainWater } from "./trapping-rain-water";
import { challenge as twoSum } from "./two-sum";
import { challenge as validAnagram } from "./valid-anagram";
import { challenge as validParentheses } from "./valid-parentheses";
import { challenge as whoLikesIt } from "./who-likes-it";

/**
 * Every challenge, one module each, so a challenge is one file instead of ninety lines in a
 * two-thousand-line seed. Order is irrelevant: the ring hands out positions by id.
 */
export const ALL_CHALLENGES: ChallengeContent[] = [
  arrayManipulation,
  bestTimeToBuyAndSellStock,
  binarySearch,
  binaryTree,
  bitCounting,
  climbingStairs,
  coinChange,
  containerWithMostWater,
  containsDuplicate,
  countVowels,
  digitalRoot,
  duplicateEncoder,
  editDistance,
  findTheOddInt,
  fizzBuzz,
  hashMap,
  houseRobber,
  humanReadableTime,
  jumpGame,
  longestCommonPrefix,
  longestConsecutiveSequence,
  longestSubstringWithoutRepeating,
  maxSubArray,
  medianOfTwoSortedArrays,
  mergeIntervals,
  moveZeroes,
  multiplesOf3Or5,
  palindromeNumber,
  persistentBugger,
  productOfArrayExceptSelf,
  recursion,
  romanToInteger,
  rotateArray,
  singleNumber,
  stringReversal,
  trappingRainWater,
  twoSum,
  validAnagram,
  validParentheses,
  whoLikesIt,
];
