import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsInt,
  IsEmail
} from 'class-validator'
import { UserRank } from '../../users/users.constants'
import { LeagueAccess, LeagueInvitePermission } from '../leagues.constants'

export class CreateLeagueDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsNumber()
  duration: number

  @ApiProperty()
  @IsBoolean()
  repeat: boolean

  @ApiProperty()
  @IsNotEmpty({
    message: 'Must be a valid sport'
  })
  sportId: string

  @ApiProperty()
  @IsUUID(4, {
    message: 'Must be a valid image id'
  })
  imageId: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(LeagueAccess, {
    message: 'Must be a valid access type'
  })
  access?: LeagueAccess = LeagueAccess.Private

  @ApiProperty()
  @IsOptional()
  @IsEnum(UserRank, {
    message: 'Must be a valid user rank'
  })
  user_rank?: UserRank = UserRank.Tier1

  @ApiProperty()
  @IsOptional()
  @IsEnum(LeagueInvitePermission, {
    message: 'Must be a valid permission type'
  })
  invite_permission?: LeagueInvitePermission =
    LeagueInvitePermission.Participant
}

export class RewardBfitDto {
  @IsEmail()
  email: string
  @IsInt()
  amount: number
}
