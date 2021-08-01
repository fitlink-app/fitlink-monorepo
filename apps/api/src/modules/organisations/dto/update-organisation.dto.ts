import { PartialType } from '@nestjs/mapped-types'
import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import { CreateOrganisationDto } from './create-organisation.dto'

export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {}
