import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class DeviceCryptoService {
	private readonly algorithm = 'aes-256-cbc';
	private readonly key: Buffer;
	private readonly iv: Buffer;

	constructor(private readonly configService: ConfigService) {
		const key = this.configService.get('DEVICE_CRYPTO_KEY');
		const iv = this.configService.get('DEVICE_CRYPTO_IV');
		this.key = Buffer.from(key, 'hex');
		this.iv = Buffer.from(iv, 'hex');
	}

	encrypt(text: string): string {
		const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		return encrypted;
	}

	decrypt(text: string): string {
		const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
		let decrypted = decipher.update(text, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}
}