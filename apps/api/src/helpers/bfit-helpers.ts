export function getDailyBfitTotal() {
	const mintedBfit = 6850
	return mintedBfit - (mintedBfit * 0.05);
}

export function leagueBfitPots(leagueUsers: number, globalUsers: number): [number, number] {
	const dailyBfit = getDailyBfitTotal()
	const bfitTotalAmountForLeague = ((leagueUsers / globalUsers) * dailyBfit);
	const bfitWinnerPot = bfitTotalAmountForLeague * 0.05;
	const bfitAllocation = bfitTotalAmountForLeague - bfitWinnerPot;
	return [bfitAllocation, bfitWinnerPot]
}

export function getBfitEarning(rank: string, bfitWinnerPot: number, bfit_estimate: number): number {
	if (rank === '1') {
		return ((bfitWinnerPot * 0.5) + bfit_estimate) * 1000_000;
	} else if (rank === '2') {
		return ((bfitWinnerPot * 0.3) + bfit_estimate) * 1000_000;
	} else if (rank === '3') {
		return ((bfitWinnerPot * 0.2) + bfit_estimate) * 1000_000;
	}
	return bfit_estimate * 1000_000;
}