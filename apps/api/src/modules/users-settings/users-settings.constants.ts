export enum PrivacySetting {
  /** Only the self-user can see this */
  Private = 'private',

  /** Only the people the user follows can see this */
  Following = 'following',

  /** Anyone can see this */
  Public = 'public'
}
