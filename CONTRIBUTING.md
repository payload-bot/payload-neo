# Contributing guide

Contributions and feedback on your experience of using this software are welcome.

This includes bug reports, feature requests, ideas, pull requests, and examples of how you have used this software.

Please raise any significant new functionality or breaking changes using GitHub issues or Discussions before making your Pull Request.

## For contributors

Anyone can be a contributor. Either you found a typo, or you have an awesome feature request you could implement, we encourage you to submit a Pull Request.

## Pull Requests

- The latest changes are always in `main`, so please target `main` when you want to make a change.
- Pull Requests need approval of a member of the Payload organization.
- We use prettier for linting, and there is a `.prettierrc` file to help standardize formats.
- We encourage you to test your changes, and if you have the opportunity, please make those tests part of the Pull Request.

## Setting up local environment

Quick start:

1. Clone the repo

2. Install packages using `yarn`:

```sh
yarn
```

3. Populate `.env`:

   Copy `.env.example` to `.env`, and add your env variables for each provider you want to test.

> NOTE: You must have a working Postgres database to connect to.

1. Start the dev application/server:

```sh
yarn dev
```

The bot application will be available on `http://localhost:8080`

That's it! 🎉

### Testing

Starting out, tests will be scarce. We intend to add tests for most major API endpoints and for integration testing.

## For maintainers

For versioning, please study the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0) site to understand how to write a good commit message. We also use semver for versioning, but this will not be mirrored in the
package.json (as it would break the cache!)

When accepting Pull Requests, make sure the following:

- Make sure you merge contributor PRs into `dev`.
- Rewrite the commit message to conform to the `Conventional Commits` style. Check the "Recommended Scopes" section for further advice.
- Optionally link issues the PR will resolve (You can add "close" in front of the issue numbers to close the issues automatically, when the PR is merged).

## Recommended Scopes

A typical conventional commit looks like this:

```
type(scope): title

body
```

Scope is the part that will help grouping the different commit types in the release notes.

Some recommended scopes are:

- **docs** - Documentation or github-related commits (eg.: "feat(docs): Add CONTRIBUTING", "chore(docs): Fix README"
- **deps** - Adding/removing/updating a dependency (eg.: "chore(deps): add X")

This is not an exhaustive list, so if you feel a commit is suited for a specific scope, feel free to add that scope.

> NOTE: If you are not sure which scope to use, you can simply ignore it. (eg.: "feat: add something"). We strongly suggest against leaving out the scope however.
