export function daysLeft(endDate: Date) {
	const currentDate = new Date();
	const timeDiff = endDate.getTime() - currentDate.getTime();
	const dayDiff = timeDiff / (1000 * 3600 * 24);

	return Math.ceil(dayDiff);
}