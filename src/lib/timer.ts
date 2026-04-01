export function getRemainingSeconds(
  startedAt: Date,
  timeLimitMin: number
): number {
  const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  const totalSeconds = timeLimitMin * 60;
  return Math.max(0, totalSeconds - elapsed);
}

export function isTimeExpired(
  startedAt: Date,
  timeLimitMin: number
): boolean {
  return getRemainingSeconds(startedAt, timeLimitMin) <= 0;
}
