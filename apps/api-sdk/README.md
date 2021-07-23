# API SDK

The API SDK is a typed service (Work in progress), and should reflect all endpoints available in the Nest API in due course. 

## Adding more endpoints
If an endpoint is missing and required for integration, add the requirements to the `types.ts` file. 

## Tests
In order to test that the SDK is functioning properly, there are some tests that use Moxios to mock responses. To run tests, run the following command from the monorepo root:

`yarn test:sdk`

> Note this is also run during Github CI builds.
