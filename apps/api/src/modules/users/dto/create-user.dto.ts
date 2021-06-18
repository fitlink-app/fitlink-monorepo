import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  name?: string

  @ApiProperty()
  @IsNotEmpty()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'Password must be at least 8 characters in length'
  })
  password: string
}
