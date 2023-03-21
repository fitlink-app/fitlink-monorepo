import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";
import { LeagueAccess } from "../../src/modules/leagues/leagues.constants";

export class bfitallocation1679400650037 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "league",
            new TableColumn({
                name: "bfitAllocation",
                type: "bigint",
                default: 0,
            })
        );

        // Calculate the total number of users in all leagues with access set to 'competetoearn'
        const totalUsersCount = await queryRunner.query(`
        SELECT SUM(totalUsers) as totalUsersCount
        FROM (
            SELECT league.id AS leagueId, COUNT(user.id) AS totalUsers
            FROM league
            LEFT JOIN users user ON league.id = user.leagueId
            WHERE league.access = '${LeagueAccess.competetoearn}'
            GROUP BY league.id
        ) AS total_users
        `);

        const globalTotalUsersCount = totalUsersCount[0].totalUsersCount;

        // Calculate the total number of users in each league with access set to 'competetoearn'
        const leagueUsers = await queryRunner.query(`
            SELECT league.id AS leagueId, COUNT(user.id) AS totalUsers
            FROM league
            LEFT JOIN users user ON league.id = user.leagueId
            WHERE league.access = '${LeagueAccess.competetoearn}'
            GROUP BY league.id
        `);

        // Calculate the allocation for each league and update the "league" table
        for (const leagueUser of leagueUsers) {
            const bfitAllocation =
                ((leagueUser.totalUsers / globalTotalUsersCount) * 6850 * 100000);
            await queryRunner.query(`
                UPDATE league
                SET bfitAllocation = $1
                WHERE id = $2
            `,
                [bfitAllocation, leagueUser.leagueId]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("league", "bfitAllocation");
    }
}
