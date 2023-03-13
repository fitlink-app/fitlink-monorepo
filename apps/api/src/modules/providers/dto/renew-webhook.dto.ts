import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RenewWebhookDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	providerId: string

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	deviceId: string
}

export class RenewWebhookResponseDto {
	refresh_token: string
	token: string
}