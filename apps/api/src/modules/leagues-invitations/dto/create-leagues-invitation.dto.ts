import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CreateLeaguesInvitationDto {
  @ApiProperty()
  @IsUUID(4)
  userId: string
}
