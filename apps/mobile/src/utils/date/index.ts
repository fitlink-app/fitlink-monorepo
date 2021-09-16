type CountdownTime = {
  d: number;
  h: number;
  m: number;
  s: number;
};

/** Return the time remaining to date. Returns 0 if date is reached */
export function getTimeRemaining(toDate: Date): CountdownTime | 0 {
  const now = new Date(Date.now());
  const then = new Date(toDate);
  let diff = then.getTime() - now.getTime();

  if (diff <= 0) return 0;

  // calculate (and subtract) whole days
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= d * 1000 * 60 * 60 * 24;

  // calculate (and subtract) whole hours
  const h = Math.floor(diff / (1000 * 60 * 60));
  diff -= h * 1000 * 60 * 60;

  const m = Math.floor(diff / (1000 * 60));
  diff -= m * 1000 * 60;

  const s = Math.floor(diff / 1000);
  diff -= s * 1000;

  const timeLeft = {
    d,
    h,
    m,
    s,
  };

  return timeLeft;
}
