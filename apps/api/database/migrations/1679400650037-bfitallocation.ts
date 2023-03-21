import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class bfitallocation1679400650037 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("league", new TableColumn({
            name: "bfitAllocation",
            type: "bigint",
            default: 0
        }));

        await queryRunner.query(`
            WITH earn_leagues AS (
                SELECT *,
                FROM league
                WHERE access = 'competetoearn'
            ), total_users AS (
                SELECT league.id AS leagueId, COUNT(user.id) AS totalUsers
                FROM earn_leagues league
                LEFT JOIN users user ON league.id = user.leagueId
                GROUP BY league.id
            ), global_total_users AS (
                SELECT SUM(totalUsers) AS totalUsersCount
                FROM total_users
            )
            UPDATE league
            SET bfitAllocation = ((total_users.totalUsers::decimal / global_total_users.totalUsersCount::decimal * 6850) * 100000)::bigint
            FROM earn_leagues, total_users, global_total_users
            WHERE league.id = earn_leagues.id
            AND league.id = total_users.leagueId
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {+
        await queryRunner.dropColumn("league", "initial_value");
    }

}
