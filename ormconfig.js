module.exports = {
  "name": "default",
  "type": "postgres",
  "host": process.env.DB_HOST || "localhost",
  "database": process.env.DB_NAME || "fitlink",
  "password": process.env.DB_PASSWORD || "fitlink",
  "username": process.env.DB_USERNAME || "fitlink",
  "synchronize": false,
  "logging": false,
  "entities": [
    "apps/api/src/modules/*/entities/*.ts"
  ],
  "migrations": [
    "apps/api/database/migrations/**/*.ts"
  ],
  "subscribers": [],
  "cli": {
    "entitiesDir": "apps/api/src/entities",
    "migrationsDir": "apps/api/database/migrations",
    "subscribersDir": "apps/api/src/src/subscriber"
  }
}
