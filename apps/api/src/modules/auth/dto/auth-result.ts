import { ApiProperty } from '@nestjs/swagger'
import { ForbiddenErrorDto } from '../../../classes/dto/error'
import { User } from '../../users/entities/user.entity'

export class AuthResultDto {
  @ApiProperty()
  id_token: string

  @ApiProperty()
  access_token: string

  @ApiProperty()
  refresh_token: string
}

export class AuthResultErrorDto extends ForbiddenErrorDto {}

export class AuthLogoutDto {
  @ApiProperty()
  success: boolean
}

export class AuthSignupDto {
  @ApiProperty({
    type: AuthResultDto
  })
  auth: AuthResultDto

  @ApiProperty()
  me: User
}
