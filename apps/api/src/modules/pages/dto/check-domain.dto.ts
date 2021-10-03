import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CheckDomainDto {
  @ApiProperty()
  @IsNotEmpty()
  domain: string
}
