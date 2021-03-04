import { PartialType } from '@nestjs/mapped-types'
import { CreateLeaderboardEntryDto } from './create-leaderboard-entry.dto'

export class UpdateLeaderboardEntryDto extends PartialType(
  CreateLeaderboardEntryDto
) {}
