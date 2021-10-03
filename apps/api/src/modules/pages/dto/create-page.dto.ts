import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'

export class CreatePageDto {
  @ApiProperty()
  @IsOptional()
  id: string

  @ApiProperty()
  @IsNotEmpty()
  domain: string

  @ApiProperty()
  @IsNotEmpty()
  logo: File | string

  @ApiProperty()
  @IsNotEmpty()
  logo_id: string

  @ApiProperty()
  @IsOptional()
  banner_image: File | string

  @ApiProperty()
  @IsOptional()
  banner_image_id: string

  @ApiProperty()
  @IsNotEmpty()
  banner_title: string

  @ApiProperty()
  @IsNotEmpty()
  banner_description: string

  @ApiProperty()
  @IsBoolean()
  banner_join_link: boolean

  @ApiProperty()
  @IsArray()
  content: {
    image: File | string
    image_id: string
    title: string
    description: string
  }[]

  @ApiProperty()
  @IsOptional()
  contact_website: string

  @ApiProperty()
  @IsNotEmpty()
  contact_group_name: string

  @ApiProperty()
  @IsNotEmpty()
  contact_group_lead: string

  @ApiProperty()
  @IsNotEmpty()
  contact_email: string

  @ApiProperty()
  @IsOptional()
  contact_number: string

  @ApiProperty()
  @IsOptional()
  contact_facebook: string

  @ApiProperty()
  @IsOptional()
  contact_instagram: string

  @ApiProperty()
  @IsOptional()
  contact_twitter: string

  @ApiProperty()
  @IsOptional()
  contact_linkedin: string

  @ApiProperty()
  @IsOptional()
  contact_subtitle: string

  @ApiProperty()
  @IsOptional()
  contact_text: string

  @ApiProperty()
  @IsOptional()
  signup_image: File | string

  @ApiProperty()
  @IsOptional()
  signup_image_id: string

  @ApiProperty()
  @IsOptional()
  signup_title: string

  @ApiProperty()
  @IsOptional()
  signup_description: string

  @ApiProperty()
  @IsBoolean()
  signup_join_link: boolean

  @ApiProperty()
  @IsBoolean()
  enabled: boolean
}
