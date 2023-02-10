export interface UserPref {
  showLeaguesTipBanner: boolean;
}

export interface UserPrefState {
  users: Record<string, UserPref>;
}
