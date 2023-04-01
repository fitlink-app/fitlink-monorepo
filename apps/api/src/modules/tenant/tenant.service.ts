import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantService {
	constructor(
		@InjectRepository(Tenant)
		private readonly tenantRepository: Repository<Tenant>,
	) { }

	async create(tenant: Tenant): Promise<Tenant> {
		return await this.tenantRepository.save(tenant);
	}

	async findAll(): Promise<Tenant[]> {
		return await this.tenantRepository.find();
	}

	async findOne(id: number): Promise<Tenant> {
		return await this.tenantRepository.findOne(id);
	}

	async findByClient(name: string): Promise<Tenant> {
		return await this.tenantRepository.findOne({ where: { name } });
	}
}