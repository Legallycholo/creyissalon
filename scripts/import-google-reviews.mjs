import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const snapshotPath = process.argv[2];
if (!snapshotPath) {
  throw new Error("Usage: npm run import:google-reviews -- <snapshot.json>");
}

const input = JSON.parse(await readFile(path.resolve(snapshotPath), "utf8"));
const rows = Array.isArray(input) ? input : input.reviews;
if (!Array.isArray(rows)) throw new Error("Snapshot must contain a reviews array.");

const clean = (value, max = 5000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const slug = (value) =>
  clean(value, 100)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "google-review";

const reviews = rows.map((row, index) => {
  const author = clean(row.author ?? row.name, 120);
  const rating = Number(row.rating);
  if (!author || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error(`Review ${index + 1} has an invalid author or rating.`);
  }
  const sourceUrl = clean(row.sourceUrl ?? row.authorProfileUrl, 1000);
  if (!/^https:\/\/(www\.)?google\.com\//.test(sourceUrl)) {
    throw new Error(`Review ${index + 1} needs a Google source URL.`);
  }
  const seed = clean(row.id ?? row.googleContributorId ?? `${author}-${index + 1}`, 160);
  return {
    id: slug(seed),
    author,
    rating,
    text: clean(row.text),
    displayedDate: clean(row.displayedDate ?? row.timeAgo ?? row.date, 100),
    sourceUrl,
  };
});

const ids = new Set(reviews.map((review) => review.id));
if (ids.size !== reviews.length) throw new Error("Snapshot contains duplicate review IDs.");

const capturedAt = clean(input.capturedAt ?? new Date().toISOString().slice(0, 10), 40);
const rating = input.rating == null ? null : Number(input.rating);
const total = Number(input.total ?? reviews.length);
if (rating !== null && (!Number.isFinite(rating) || rating < 1 || rating > 5)) {
  throw new Error("Snapshot rating must be between 1 and 5.");
}
if (!Number.isInteger(total) || total < reviews.length) {
  throw new Error("Snapshot total cannot be smaller than the imported review count.");
}

const output = `// Generated from a Google Business Profile snapshot captured ${capturedAt}.\n` +
  `// Run: npm run import:google-reviews -- <snapshot.json>\n` +
  `import type { GoogleReview, GoogleReviewSnapshot } from "./reviews";\n\n` +
  `export const googleReviews: GoogleReview[] = ${JSON.stringify(reviews, null, 2)};\n` +
  `export const googleReviewSnapshot: GoogleReviewSnapshot = ${JSON.stringify({ capturedAt, rating, total }, null, 2)};\n`;

const outputPath = path.join(process.cwd(), "src/lib/google-reviews.generated.ts");
await writeFile(outputPath, output, "utf8");
console.log(JSON.stringify({ reviews: reviews.length, total, capturedAt, output: outputPath }, null, 2));
