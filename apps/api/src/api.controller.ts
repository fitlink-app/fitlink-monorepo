import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Iam } from './decorators/iam.decorator'
import { Roles } from './modules/user-roles/user-roles.constants'
import { ClientIdParam } from './modules/client-id/client-id.decorator'
import { ClientIdType } from './modules/client-id/client-id.constant'

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Iam(Roles.SuperAdmin)
  @Get('/app/config')
  async getConfig(@ClientIdParam() clientId: ClientIdType) {
    const envPrefix = clientId === 'BFIT' ? 'BFIT_' : 'FITLINK_';
    return {
      S3_BUCKET_PUBLIC_ENDPOINT: this.configService.get(
        'S3_BUCKET_PUBLIC_ENDPOINT'
      ),
      S3_ENDPOINT: this.configService.get('S3_ENDPOINT'),
      S3_REGION: this.configService.get('S3_REGION'),
      S3_BUCKET: this.configService.get('S3_BUCKET'),
      EMAIL_DEFAULT_FROM_ADDRESS: this.configService.get(
        'EMAIL_DEFAULT_FROM_ADDRESS'
      ),
      INVITE_URL: this.configService.get('INVITE_URL'),
      EMAIL_VERIFICATION_URL: this.configService.get('EMAIL_VERIFICATION_URL'),
      STRAVA_CLIENT_ID: this.configService.get(`${envPrefix}STRAVA_CLIENT_ID`),
      STRAVA_CLIENT_SECRET: mask(
        this.configService.get(`${envPrefix}STRAVA_CLIENT_SECRET`)
      ),
      STRAVA_WEBHOOK_CALLBACK_URL: this.configService.get(
        'STRAVA_WEBHOOK_CALLBACK_URL'
      ),
      STRAVA_REDIRECT_URI: this.configService.get('STRAVA_REDIRECT_URI'),
      STRAVA_SCOPES: this.configService.get('STRAVA_SCOPES'),
      STRAVA_VERIFY_STRING: this.configService.get('STRAVA_VERIFY_STRING'),
      FITBIT_CLIENT_ID: this.configService.get(`${envPrefix}FITBIT_CLIENT_ID`),
      FITBIT_CLIENT_SECRET: mask(
        this.configService.get(`${envPrefix}FITBIT_CLIENT_SECRET`)
      ),
      FITBIT_API_VERSION: this.configService.get(`${envPrefix}FITBIT_API_VERSION`),
      FITBIT_SCOPES: this.configService.get(`${envPrefix}FITBIT_SCOPES`),
      FITBIT_CALLBACK_URL: this.configService.get(`${envPrefix}FITBIT_CALLBACK_URL`),
      IMIN_API_BASE_URL: this.configService.get('IMIN_API_BASE_URL'),
      IMIN_API_KEY: mask(this.configService.get('IMIN_API_KEY')),
      RESET_PASSWORD_URL: this.configService.get('RESET_PASSWORD_URL'),
      GOOGLE_ANALYTICS_EMAIL_TID: this.configService.get(
        'GOOGLE_ANALYTICS_EMAIL_TID'
      ),
      GOOGLE_ANALYTICS_EMAIL_URL: this.configService.get(
        'GOOGLE_ANALYTICS_EMAIL_URL'
      ),
      GOOGLE_ANALYTICS_EMAIL_VERSION: this.configService.get(
        'GOOGLE_ANALYTICS_EMAIL_VERSION'
      ),
      GOOGLE_CLIENT_ID: mask(this.configService.get('GOOGLE_CLIENT_ID')),
      APPLE_CLIENT_ID: mask(this.configService.get('APPLE_CLIENT_ID')),
      APPLE_PRIVATE_KEY_B64: mask(
        this.configService.get('APPLE_PRIVATE_KEY_B64'),
        100
      ),
      AUTH_JWT_SECRET: mask(this.configService.get('AUTH_JWT_SECRET')),
      EMAIL_JWT_TOKEN_SECRET: mask(
        this.configService.get('EMAIL_JWT_TOKEN_SECRET')
      ),
      EMAIL_DEBUG: this.configService.get('EMAIL_DEBUG'),
      ENABLE_SWAGGER: this.configService.get('ENABLE_SWAGGER')
    }
  }
}

function mask(str: string, max?: number) {
  if (!str) {
    return 'NOT SET!'
  }

  if (max) {
    str = str.substring(str.length - max)
  }
  return (
    Array.from({ length: str.length - 4 }).join('*') +
    str.substring(str.length - 4, max)
  )
}
