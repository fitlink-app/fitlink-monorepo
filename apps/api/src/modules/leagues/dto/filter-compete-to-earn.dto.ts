import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

const booleanTransform = ({ value }: { value: any }) => {
  if (value === 'true' || value === true) {
    return true
  }
  if (value === 'false' || value === false) {
    return false
  }
  return undefined
}

export class FilterCompeteToEarnDto {
  @ApiProperty()
  @IsBoolean()
  @Transform(booleanTransform)
  @IsOptional()
  isParticipating: boolean
}
