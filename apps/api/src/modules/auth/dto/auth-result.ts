export type AuthResultDto = {
  id_token: string
  access_token: string
  refresh_token: string
}

export type AuthLogoutDto = {
  success: boolean
}
