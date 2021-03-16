# Fitlink Monorepo

This is the Fitlink monorepo initialized using Nest's monorepo project structure. In future this repo will also contain the React Native app.

## Leaderboard Entries

At this time, only leaderboard entries are available, in order to make querying the leaderboard in real time performant. 

## Get started

### Git hook (prettier)
Make sure to setup the git hooks for the project. The hook is currently used for prettier transformation during commit. Install as follows:

```git config core.hooksPath .githooks```

### Install dependencies

```yarn install```

### TLDR; (quick start)
> Please read past this section to understand the different environments better.

#### Testing
```
  docker-compose up -d
  yarn migration:run -c jest
  yarn migration:seed -c jest
  yarn test
  // Optionally start a nest server against jest db:
  // yarn start:jest 
```
#### Development
```
  docker-compose up -d
  yarn migration:run 
  yarn migration:seed
  yarn start
```

### Run docker
A docker-compose file is available to run postgres and s3rver (s3 emulator) for development and jest testing. 

For testing (ephemeral database):

```docker-compose up -d postgres-jest s3rver`
> Starts only the jest database service and s3rver.

For development (persistent database):
```docker-compose up -d postgres s3rver`
> Starts only the development database service and s3rver.

For running both databases:
```docker-compose up -d```
> Starts all services, bear in mind this will be two separate databases not sharing the same migrations or seeds until they are run on each.

To stop services:
```docker-compose down```

To stop services and delete volumnes (lose all data)
```docker-compose down --volumes```

### Migrate and seed database
To run migrations and seed on jest's database (prior to running tests):
```
  yarn migration:run -c jest
  yarn migration:seed -c jest
```

To run migrations and seed on the development database (prior to running application):
```
  yarn migration:run
  yarn migration:seed
```

### Run jest tests
> Run migration and seeding first before running jest

```
  yarn test
  // OR
  yarn test:watch
```

If other tests are failing, you can run only your own tests
```
  yarn test -t apps/api/test/my.e2e-spec.ts
  yarn test:watch -t apps/api/test/my.e2e-spec.ts
```

### Run nest server

You may want to run a nest server while writing jest tests. In this scenario, you can run nest against the ephemeral jest database:

```
  yarn start:jest
```

The api will be available at http://localhost:3001/api/v1/*

For running the app against the development database, run:

```
  yarn start
```

The api will be available at http://localhost:3000/api/v1/*

### E2E tests

Run the e2e tests:

```yarn test:e2e```


### Bearer authentication

Simple bearer authentication is in place.

## Nest-cli

Scaffold new CRUD routes using nest cli, under the modules folder

```nest g resource modules/fishes```

## Swagger

Swagger documentation is provided at http://localhost:3000/api/v1

## Generate database UML

You can generate a database UML diagram from Typeorm entities using the command

```yarn db:diagram```

<img src="./docs/uml.svg" />
