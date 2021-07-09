import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator'
import { AuthProviderType } from '../../auth/entities/auth-provider.entity'

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
  @IsEnum(AuthProviderType)
  provider: AuthProviderType
}
