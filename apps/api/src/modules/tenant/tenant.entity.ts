import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Tenant {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	host: string;

	@Column()
	port: number;

	@Column()
	username: string;

	@Column()
	password: string;

	@Column()
	database: string;
}