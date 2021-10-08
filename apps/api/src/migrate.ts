import { createConnection } from 'typeorm'
import migrations from './migrations'

export async function migrate() {
  const connection = await createConnection({
    type: 'postgres',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    username: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    port: (process.env.DB_PORT as unknown) as number,
    synchronize: false,
    logging: true,
    dropSchema: false,
    migrations: migrations
  })

  let result
  try {
    result = await connection.runMigrations({
      transaction: 'none'
    })
  } catch (e) {
    await connection.close()
    throw e
  }
  await connection.close()
  return result
}

migrate()
