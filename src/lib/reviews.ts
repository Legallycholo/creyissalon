export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?sca_esv=d0fa25ced5188e1a&sxsrf=APpeQnuJkQwbQX2L9sZHsZ7ga3RhWoYX_Q%3A1791648812778&q=Creiyi%E2%80%99s%20Salon&stick=H4sIAAAAAAAAAONgU1I1qLBINjA2s7RMTDFPMklJMzO2Mqgws0wyM0kxTUu0MDBKNk9MXMQq4FyUmlmZ-ahhZrFCcGJOfh4AaPb_rTwAAAA&mat=CUa-0Oee9oz7&ved=2ahUKEwiYwbD466-XAxUmFzQIHSxxDfkQrMcEegQIIRAC#mpd=~18126133762613886534/customers/reviews";
export const GOOGLE_LEAVE_REVIEW_URL = "https://g.page/r/CarHAqhfTbZpEBM/review";

export type GoogleReview = {
  id: string;
  author: string;
  rating: number;
  text: string;
  displayedDate: string;
  sourceUrl: string;
};

export type GoogleReviewSnapshot = {
  capturedAt: string | null;
  rating: number | null;
  total: number;
};
