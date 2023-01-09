export function calculateDaysLeft(expiryDate: Date, isExpired: boolean) {
  if (isExpired) {
    return 0;
  }
  const now = Date.now();
  return Math.ceil((expiryDate.getTime() - now) / (1000 * 3600 * 24));
}
