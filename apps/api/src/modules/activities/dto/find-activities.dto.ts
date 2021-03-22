export type FindActivitiesDto = {
  geo_radial?: string // long, lat, radius
  with_imin?: boolean
  page: string
  limit: string
}
