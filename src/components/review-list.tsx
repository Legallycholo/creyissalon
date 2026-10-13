"use client";

import { useState } from "react";
import { ExternalLink, Star } from "lucide-react";
import type { Locale } from "@/lib/site";
import type { GoogleReview } from "@/lib/reviews";
import { copy } from "@/lib/copy";

export default function ReviewList({
  reviews,
  locale,
  initialCount = 12,
}: {
  reviews: GoogleReview[];
  locale: Locale;
  initialCount?: number;
}) {
  const [visible, setVisible] = useState(initialCount);
  const t = copy(locale);
  return (
    <>
      <div className="reviews-page-grid">
        {reviews.slice(0, visible).map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-stars" aria-label={`${review.rating} / 5`}>
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={15}
                  aria-hidden="true"
                  className={index < review.rating ? "is-filled" : ""}
                />
              ))}
            </div>
            <blockquote>{review.text || t.ratingOnly}</blockquote>
            <footer>
              <div>
                <strong>{review.author}</strong>
                {review.displayedDate && <small>{review.displayedDate}</small>}
              </div>
              <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer">
                {t.reviewSource}<ExternalLink size={14} aria-hidden="true" />
              </a>
            </footer>
          </article>
        ))}
      </div>
      {visible < reviews.length && (
        <button
          className="button button-outline review-load-more"
          type="button"
          onClick={() => setVisible((count) => count + 12)}
        >
          {t.loadMoreReviews}
        </button>
      )}
    </>
  );
}
