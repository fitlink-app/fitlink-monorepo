import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class bfitallocation1679400650037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 2. Add a new column to the `league` table
        await queryRunner.addColumn("league", new TableColumn({
            name: "bfitAllocation",
            type: "bigint",
            default: 0
        }));

        // 3. Calculate the initial value and multiply it by 1000
        await queryRunner.query(`
            WITH earn_leagues AS (
                SELECT id, users_count
                FROM league
                WHERE access = 'competetoearn'
            ), total_users AS (
                SELECT SUM(users_count) AS total_users_count
                FROM earn_leagues
            )
            UPDATE league
            SET initial_value = ((earn_leagues.users_count::decimal / total_users.total_users_count::decimal * 6850) * 1000000)::bigint
            FROM earn_leagues, total_users
            WHERE league.id = earn_leagues.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the changes made in the `up` method
        await queryRunner.dropColumn("league", "initial_value");
    }

}
