import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class LeaguesIsPrivateOnlyDto {
    @ApiProperty({
      required: false,
      nullable: true
    })
    @IsOptional()
    @Transform(({value}) =>
      value === 'true'
    )
    isPrivateOnly?: boolean
  }
  