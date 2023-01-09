import { ApiProperty } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID
} from 'class-validator'
import { LeagueAccess, LeagueInvitePermission } from '../leagues.constants'

export class LeagueQueryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  description: string

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  duration: number

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  repeat: boolean

  @ApiProperty()
  @IsNotEmpty({
    message: 'Must be a valid sport'
  })
  @IsOptional()
  sportId: string

  @ApiProperty()
  @IsUUID(4, {
    message: 'Must be a valid image id'
  })
  @IsOptional()
  imageId: string

  @ApiProperty()
  @IsOptional()
  @IsEnum(LeagueAccess, {
    message: 'Must be a valid access type'
  })
  access: LeagueAccess

  @ApiProperty()
  @IsOptional()
  @IsEnum(LeagueInvitePermission, {
    message: 'Must be a valid permission type'
  })
  invite_permission: LeagueInvitePermission
}
