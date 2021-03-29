import { ApiProperty } from '@nestjs/swagger'
import { Organisation } from '../../organisations/entities/organisation.entity'

export class CreateSubscriptionDto {
  @ApiProperty()
  organisation: Organisation

  @ApiProperty()
  billing_entity: string
}
