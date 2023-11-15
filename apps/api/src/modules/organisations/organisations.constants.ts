export enum OrganisationType {
  Company = 'company',
  Startup = 'startup',
  Government = 'government',
  Club = 'club',
  School = 'school',
  University = 'university',
  Other = 'other'
}

export enum OrganisationMode {
  /** In simple mode, the interface acts as though only 1 team and 1 subscription can exist */
  Simple = 'simple',

  /** In complex mode, the interface supports multiple teams and subscriptions */
  Complex = 'complex'
}
