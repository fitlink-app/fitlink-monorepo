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
docker compose up -d

// When importing the test dataset, this step should be skipped
// yarn migration:run

yarn db:import
yarn start
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
