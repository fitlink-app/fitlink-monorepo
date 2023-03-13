import { ExecutionContext, Inject, SetMetadata, createParamDecorator } from "@nestjs/common";
import { CLIENT_ID } from "./client-id";

export const ClientId = () => {
	return Inject(CLIENT_ID);
}

export const ClientIdParam = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx?.switchToHttp()?.getRequest();
		return request['client'];
	},
);