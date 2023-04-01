import { applyDecorators, createParamDecorator, ExecutionContext, Inject, Injectable, Provider, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Connection, EntityTarget, getMetadataArgsStorage } from 'typeorm';
import { TENANT_CONNECTION } from './tenant.module';
import { ModuleRef } from '@nestjs/core';
export const Tenant = () =>
	applyDecorators(
		Injectable({ scope: Scope.REQUEST })
	);



export function createTenantRepositoryProviders(): Provider[] {
	const entities = getMetadataArgsStorage().tables.map((table) => table.target);
	const providers = entities.map((entity) => {
		const entityName = typeof entity === 'string' ? entity : (entity as any).name;
		return {
			provide: `TENANT_REPOSITORY.${entityName}`,
			scope: Scope.REQUEST,
			useFactory: (connection: Connection) => {
				return connection.getRepository(entity);
			},
			inject: [TENANT_CONNECTION],
		};
	});

	return providers;
}

export const InjectTenantRepository = <Entity>(entity: EntityTarget<Entity>) => {
	const entityName = typeof entity === 'string' ? entity : (entity as any).name;
	return Inject(`TENANT_REPOSITORY:${entityName}`);
};