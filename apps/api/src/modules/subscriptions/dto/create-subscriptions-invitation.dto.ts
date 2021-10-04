import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsOptional } from 'class-validator'
import { Subscription } from '../entities/subscription.entity'

export class CreateSubscriptionsInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  invitee: string

  @ApiProperty()
  subscription: Subscription
}
