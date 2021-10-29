import { IsNotEmpty } from 'class-validator'

export class GoalJobDto {
  @IsNotEmpty()
  verify_token: string
}
