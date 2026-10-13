// No public review rows were exposed by Google at implementation time.
// Run `npm run import:google-reviews -- <snapshot.json>` with an authenticated snapshot.
import type { GoogleReview, GoogleReviewSnapshot } from "./reviews";

export const googleReviews: GoogleReview[] = [];
export const googleReviewSnapshot: GoogleReviewSnapshot = {
  capturedAt: null,
  rating: null,
  total: 0,
};
