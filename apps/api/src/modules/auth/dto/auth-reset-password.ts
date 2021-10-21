import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

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
  @IsString()
  token: string
}

export class AuthResetPasswordResultDto {
  @ApiProperty()
  affected: number

  @ApiProperty()
  @IsString()
  link?: string
}
