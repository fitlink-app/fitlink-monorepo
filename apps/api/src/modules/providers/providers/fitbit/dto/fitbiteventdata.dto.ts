import { FitbitNotificationCollectionType } from '../../../types/fitbit'
import { IsIn, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class FitbitEventDataDto {
  @ApiProperty()
  @IsString()
  @IsIn(['activities', 'body', 'foods', 'sleep', 'userRevokedAccess'])
  collectionType: FitbitNotificationCollectionType
  @ApiProperty()
  @IsString()
  date: string
  @ApiProperty()
  @IsString()
  ownerId: string
  @ApiProperty()
  @IsString()
  ownerType: 'user' | string
  /** ID of the User's subscription (we set this to Fitlink user ID in our case) */
  @ApiProperty()
  @IsString()
  subscriptionId: string
}
