import { IsBoolean, IsEnum, IsOptional } from 'class-validator'
import { PrivacySetting } from '../users-settings.constants'

export class CreateUsersSettingDto {
  @IsBoolean()
  @IsOptional()
  newsletter_subscriptions_user?: boolean

  @IsBoolean()
  @IsOptional()
  newsletter_subscriptions_admin?: boolean

  @IsEnum(PrivacySetting)
  privacy_activities: PrivacySetting

  @IsEnum(PrivacySetting)
  privacy_daily_statistics: PrivacySetting
}
