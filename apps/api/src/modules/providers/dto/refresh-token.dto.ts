import { ApiProperty } from '@nestjs/swagger'
import {
	IsString,
} from 'class-validator'

export class WebhookRefreshTokenDto {
	@ApiProperty()
	@IsString()
	refresh_token: string;
}

export class WebhookRefreshTokenResponseDto {
	token: string;
}
