[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Polymesh Integration Tests

Here is a collection of integration tests to help ensure the various Polymesh services work together correctly.

The tests primarily make use of the [REST API](https://github.com/PolymeshAssociation/polymesh-rest-api), which in turn imports the [SDK](https://github.com/PolymeshAssociation/polymesh-sdk).

## Environment Variables

By default `yarn test` will use `docker compose up` to setup a docker environment with the latest docker image for each service. Look in `envs/` for supported image sets. Look in `scripts/setup.sh` to see the set of images under test.

The URLs of the services under test can be set with environment variables. Look at the [environment.ts file](./src/environment.ts) for a complete list

## Local Images

To test a local image update the corresponding  env to be set to the local tag name. `docker compose` by default attempts to pull, so you will need to add `pull_policy: never` to the respective service.

## Scripts

- `yarn build:ts` compiles typescript files into javascript and type declarations. Outputs to `dist/` directory
- `yarn build:docs` builds a documentation page from tsdoc comments in the code. Outputs to `docs/` directory
- `yarn test` runs tests and outputs the coverage report
- `yarn commit` runs the commit formatting tool (should replace normal commits)
- `yarn semantic-release` runs semantic release to calculate version numbers based on the nature of changes since the last version (used in CI pipelines)
- `yarn lint` runs the linter on all .ts(x) and .js(x) files and outputs all errors
- `yarn format` runs prettier on all .ts(x) and .js(x) files and formats them according to the project standards

## Notes

- All tools are configured via their respective config files instead of adding the config in `package.json`. There is also some vscode project config in `.vscode/settings.json`
  - eslint: `.eslintrc`
  - lint-staged: `.lintstagedrc`
  - prettier: `.prettierrc`
  - commitlint: `commitlint.config.js`
  - husky: `.husky`
  - jest: `jest.config.js`
  - semantic-release: `release.config.js`
  - typedoc: `typedoc.json`
  - github actions: `.github/main.yml`
- The CI config assumes a `master` branch for stable releases and a `beta` branch for beta releases. Every time something gets pushed to either of those branches (or any time a pull request is opened to any branch), github actions will run. Semantic-release config makes it so that actual releases are only made on pushes to `master` or `beta`
- The CI config also adds an extra couple of steps to flatten the file structure that actually gets published. This means that your published package will have the buit files at the root level instead of inside a `dist` folder. Those steps are:
  - copy `package.json` into the `dist` folder after building
  - `cd` into the `dist` folder
  - install deps into the `dist` folder
  - run `semantic-release` from there
- In order for automated NPM releases to actually work, you need to add an NPM auth token as a secret in your repo. To do that, go to your repo's `settings -> secrets -> add a new secret` input `NPM_TOKEN` as the secret name and the token you generated on your NPM account in the text area
- If you don't need automated NPM releases, you might want to uninstall `semantic-release` and tweak the github actions yaml file to skip the release step
