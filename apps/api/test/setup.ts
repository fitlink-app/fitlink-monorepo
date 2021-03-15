// import { promisify } from 'util'
// import { exec as Exec } from 'child_process'
import { createConnection } from 'typeorm'
import migrations from '../src/migrations'
import { entities } from './helpers/app'
// const exec = promisify(Exec)
// const timeout = promisify(setTimeout)

/**
 * Creates a temporary docker container
 * to run jest tests against.
 * 1. Creates the container
 * 2. Migrates and seeds the database
 * 3. Tests are run
 * 4. Container destroyed in teardown
 *
 * For debugging (the container must be left running) use:
 *
 * `docker exec -i jest psql "postgres://jest:jest@127.0.0.1:5432`
 */
export default async () => {
  // await exec(`cd ${__dirname} && docker compose up -d`)
  // Need to give enough time for the container to start up
  // await timeout(10000)
  // await migrateAndSeedTestDatabase()
}

async function migrateAndSeedTestDatabase() {
  const connection = await createConnection({
    type: 'postgres',
    password: 'jest',
    username: 'jest',
    database: 'jest',
    host: 'localhost',
    port: 5432,
    synchronize: false,
    logging: true,
    dropSchema: false,
    entities,
    migrations
  })

  await connection.runMigrations({
    transaction: 'none'
  })

  await connection.close()
}
