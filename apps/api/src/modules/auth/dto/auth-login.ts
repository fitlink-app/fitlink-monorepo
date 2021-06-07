import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

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
