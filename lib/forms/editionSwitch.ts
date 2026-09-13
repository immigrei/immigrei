/**
 * USCIS sometimes publishes a form edition with "no grace period": the old
 * edition is rejected on/after a fixed effective date, and the new edition
 * is rejected if filed before it (see the 09/15/26 I-539/I-765 and 09/18/26
 * I-485 edition changes announced Aug 2026). This flips a FormSpec's
 * edition/pdfAssetPath on that date without needing a same-day deploy.
 */
export function isOnOrAfter(effectiveDateIso: string): boolean {
  return new Date() >= new Date(`${effectiveDateIso}T00:00:00-04:00`);
}
