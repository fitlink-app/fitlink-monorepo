import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

const booleanTransform = ({value}: {value: any}) => {
  if (value === 'true' || value === true) {
    return true
  }
  if (value === 'false' || value === false) {
    return false
  }
  return undefined
}

export class LeaguesFiltersDto {
    @ApiProperty({
      required: false,
      nullable: true
    })
    @IsOptional()
    @Transform(booleanTransform)
    isPublic?: boolean

    @ApiProperty({
      required: false,
      nullable: true
    })
    @IsOptional()
    @Transform(booleanTransform)
    isCte?: boolean

    @ApiProperty({
      required: false,
      nullable: true
    })
    @IsOptional()
    @Transform(booleanTransform)
    isPrivate?: boolean

    @ApiProperty({
      required: false,
      nullable: true
    })
    @IsOptional()
    @Transform(booleanTransform)
    isTeam?: boolean

    @ApiProperty({
      required: false,
      nullable: true
    })
    @IsOptional()
    @Transform(booleanTransform)
    isOrganization?: boolean
  }
