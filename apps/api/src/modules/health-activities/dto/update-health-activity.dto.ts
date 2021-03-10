import { PartialType } from '@nestjs/mapped-types'
import { CreateHealthActivityDto } from './create-health-activity.dto'

export class UpdateHealthActivityDto extends PartialType(
  CreateHealthActivityDto
) {}
