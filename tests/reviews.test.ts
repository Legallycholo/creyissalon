import assert from "node:assert/strict";
import test from "node:test";
import {
  googleReviews,
  googleReviewSnapshot,
} from "../src/lib/google-reviews.generated";
import {
  GOOGLE_LEAVE_REVIEW_URL,
  GOOGLE_REVIEWS_URL,
} from "../src/lib/reviews";

test("Google review data is unique, sourced, and snapshot-consistent", () => {
  assert.equal(new Set(googleReviews.map((review) => review.id)).size, googleReviews.length);
  assert.ok(googleReviews.every((review) => review.sourceUrl.startsWith("https://www.google.com/")));
  assert.ok(googleReviews.every((review) => review.rating >= 1 && review.rating <= 5));
  assert.ok(googleReviewSnapshot.total >= googleReviews.length);
});

test("Google review calls to action retain the supplied destinations", () => {
  assert.match(GOOGLE_REVIEWS_URL, /customers\/reviews$/);
  assert.equal(GOOGLE_LEAVE_REVIEW_URL, "https://g.page/r/CarHAqhfTbZpEBM/review");
});
