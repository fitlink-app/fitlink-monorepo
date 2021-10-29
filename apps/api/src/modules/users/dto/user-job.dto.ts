import { IsNotEmpty } from 'class-validator'

export class UserJobDto {
  @IsNotEmpty()
  verify_token: string
}
