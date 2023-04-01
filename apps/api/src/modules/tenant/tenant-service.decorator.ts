import { applyDecorators, Injectable, Scope } from '@nestjs/common';

export const Tenant = () =>
	applyDecorators(
		Injectable({ scope: Scope.REQUEST })
	);
