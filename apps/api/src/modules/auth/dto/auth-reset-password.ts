import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, MinLength } from 'class-validator'

export class AuthRequestResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string
}

export class AuthResetPasswordDto {
  @ApiProperty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters in length'
  })
  password: string

  @ApiProperty()
  token: string
}
