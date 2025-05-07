[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Polymesh Integration Tests

Here is a collection of integration tests to help ensure the various Polymesh services work together correctly.

The tests primarily make use of the [REST API](https://github.com/PolymeshAssociation/polymesh-rest-api), which in turn imports the [SDK](https://github.com/PolymeshAssociation/polymesh-sdk).

## Configuring the suite

By default `yarn test` will use `docker compose up` to setup a docker environment with the latest docker image for each service. Look in `envs/` for supported image sets. Set `VERSION` in ~/scripts/setup.sh` to select the desired file.

The URLs of the services under test can be set with environment variables. Look at the [environment.ts file](./src/environment.ts) for a complete list

## Usage

- `yarn test` Sets up services, runs the tests and cleans up
- `yarn test:run` runs the tests, like `yarn test` with no setup or cleanup, useful when adding new cases
- `yarn test --chain-url=ws://some.chain.url --chain-id=0x123` Like yarn test, but use an already running chain

Providing a running chain URL + ID lets new chains be tested with existing versions, which can flag breaking changes.

NOTE: This chain must be in dev mode. Sudo mnemonic is needed to setup tests. Assumed to be `//Alice`, but can be set with an env for the REST API `DEVELOPER_SUDO_MNEMONIC` with docker compose.

