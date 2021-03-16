module.exports = [{
  "name": "default",
  "type": "postgres",
  "host": process.env.DB_HOST || "localhost",
  "database": process.env.DB_NAME || "fitlink",
  "password": process.env.DB_PASSWORD || "fitlink",
  "username": process.env.DB_USERNAME || "fitlink",
  "port": process.env.DB_PORT || "5432",
  "synchronize": false,
  "logging": false,
  "entities": [
    "apps/api/src/modules/*/entities/*.ts"
  ],
  "migrations": [
    "apps/api/database/migrations/**/*.ts"
  ],
  "factories": [
    "apps/api/database/factories/**/*.factory.ts"
  ],
  "seeds": [
    "apps/api/database/seeds/**/*.seed.ts"
  ],
  "subscribers": [],
  "cli": {
    "entitiesDir": "apps/api/src/entities",
    "migrationsDir": "apps/api/database/migrations",
    "subscribersDir": "apps/api/src/src/subscriber"
  }
},{
  "name": "jest",
  "type": "postgres",
  "host": "localhost",
  "database": "jest",
  "password": "jest",
  "username": "jest",
  "port": "5433",
  "synchronize": false,
  "logging": false,
  "entities": [
    "apps/api/src/modules/*/entities/*.ts"
  ],
  "migrations": [
    "apps/api/database/migrations/**/*.ts"
  ],
  "factories": [
    "apps/api/database/factories/**/*.factory.ts"
  ],
  "seeds": [
    "apps/api/database/seeds/**/*.seed.ts"
  ],
  "subscribers": [],
  "cli": {
    "entitiesDir": "apps/api/src/entities",
    "migrationsDir": "apps/api/database/migrations",
    "subscribersDir": "apps/api/src/src/subscriber"
  }
}]
