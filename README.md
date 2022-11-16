# Fitlink Monorepo

This is the Fitlink monorepo initialized using Nest's monorepo project structure and combined with yarn workspaces. This repo also contains the React Native app, admin dashboard app, Storybook, and API SDK. 

## Get started

### Git hook (prettier)
Make sure to setup the git hooks for the project. The hook is currently used for prettier transformation during commit. Install as follows:

```git config core.hooksPath .githooks```

### Install dependencies

```yarn install```

### Quick start

> Note you must have the datasets obtained from [https://github.com/fitlink-app/fitlink-test-data](https://github.com/fitlink-app/fitlink-test-data) copied to this project, & the database should be empty for import process. Run `docker compose down --volumes` to empty the database. If this doesn't work, update to the latest Docker desktop or try `docker-compose down --volumes`, which is the older CLI for docker-compose.

```
// Start docker
docker compose up -d

// When importing the test dataset, this step should be skipped
// yarn migration:run

yarn db:import
yarn package:api
yarn package:admin
```

After running the commands navigate to [http://localhost:4000/login](http://localhost:4000/login), and you should be able to login with the credentials available in the test dataset.

## Application-specific documentation
1. [Admin Development Documentation](./apps/admin/README.md)
2. [API Development Documentation](./apps/api/README.md)
3. [API SDK Documentation](./apps/api-sdk/README.md)
4. [Common](./apps/common/README.md)
5. [Mobile](./apps/mobile/README.md)
6. [Storybook](./apps/storybook/README.md)

## Importing dataset
1. Empty the public schema: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
2. `yarn migration:run && yarn migration:seed:sports`
3. `yarn firebase:migration`
4. `yarn migration:seed:test-users`
5. `yarn db:export`
6. Change image paths to S3, upload images to S3 (`node scripts/rename-images.js`)
7. `scp -i [keypath] fitlink.sql ec2-user@[ip]:~/fitlink.sql`
8. `eb ssh`
9. `psql -h [url] -p 5432 -U [user] --password [db_name] < ~/fitlink.sql`

deploy
