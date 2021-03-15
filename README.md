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

### Run jest docker
A docker-compose file is available to run postgres for jest. 

```docker-compose -f docker-compose.jest.yml up -d```

> To stop run `docker-compose -f docker-compose.jest.yml down --volumes`
> --volumes deletes data and can be omitted

### Migrate and seed database
```
  yarn run migration:run -c jest
  yarn run migration:seed -c jest
```

### Run jest tests
> Run migration and seeding first

```
  yarn run test
  // OR
  yarn run test:watch
```

If other tests are failing, just run your own tests
```
  yarn run test -t "auth"
  yarn run test:watch -t "auth"
```

### Run develoment docker

```
  docker-compose up -d
  yarn run migration:run
  yarn run migration:seed
  yarn run start
```

The api will be available at http://localhost:3000/api/v1/*


### Bearer authentication

Simple bearer authentication is in place.

## Nest-cli

Scaffold new CRUD routes using nest cli, under the modules folder

```nest g resource modules/fishes```

## Swagger

Swagger documentation is provided at http://localhost:3000/api/v1

## Generate database UML

You can generate a database UML diagram from Typeorm entities using the command

```yarn run db:diagram```

<img src="./docs/uml.svg" />
