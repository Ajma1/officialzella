/** Pure predicate for rate limit checking — kept separate from submitFeedback
 *  (a server action) so this utility can be imported and tested without the
 *  "use server" constraint, and so the 60s window boundary is unit-testable
 *  without mocking global timers (which risks interfering with Prisma's own
 *  real async I/O) or a real 60-second test. */
export function isRateLimited(
  now: number,
  lastSubmission: number | undefined,
  windowMs: number,
): boolean {
  return lastSubmission !== undefined && now - lastSubmission < windowMs;
}
