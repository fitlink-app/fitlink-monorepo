export function getTodayTimeframe() {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  return {
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
  } as {startDate: string; endDate: string};
}
