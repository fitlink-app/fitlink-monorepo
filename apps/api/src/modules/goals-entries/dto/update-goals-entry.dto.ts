import { PartialType } from '@nestjs/mapped-types'
import { CreateGoalsEntryDto } from './create-goals-entry.dto'

export class UpdateGoalsEntryDto extends PartialType(CreateGoalsEntryDto) {}
