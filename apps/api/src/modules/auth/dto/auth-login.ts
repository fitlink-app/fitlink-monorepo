import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional
} from 'class-validator'
import { AuthProviderType } from '../../auth/auth.constants'

export class AuthLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @MinLength(10)
  password: string
}

export class AuthRefreshDto {
  @ApiProperty()
  @IsNotEmpty()
  refresh_token: string
}

export class AuthConnectDto {
  @ApiProperty()
  @IsNotEmpty()
  token: string

  @ApiProperty({
    enum: AuthProviderType
  })
  @IsNotEmpty()
  @IsEnum(AuthProviderType, {
    message: 'Must be one of google.com, apple.com'
  })
  provider: AuthProviderType

  @ApiProperty()
  @IsOptional()
  signup?: boolean

  @ApiProperty()
  @IsOptional()
  desktop?: boolean
}
