import { Inject } from "@nestjs/common";
import { CLIENT_ID } from "./client-id";

export const ClientId = () => Inject(CLIENT_ID);