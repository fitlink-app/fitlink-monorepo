import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class Tenant1680289861735 implements MigrationInterface {
    name = 'Tenant1680289861735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "tenant",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "host",
                    type: "varchar"
                },
                {
                    name: "port",
                    type: "int"
                },
                {
                    name: "username",
                    type: "varchar"
                },
                {
                    name: "password",
                    type: "varchar"
                },
                {
                    name: "database",
                    type: "varchar"
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("tenant");
    }

}
