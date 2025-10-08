<p align="center">
  <a href="https://payload.tf">
    <img src="https://payload.tf/logo.svg" alt="payload.tf logo" width="175" height="175">
  </a>
</p>

<h1 align="center">payload-neo</h1>

<p align="center">Payload Discord Bot</p>

<p align="center">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT license" />
</p>

# Description

Payload is the Discord bot for TF2 players. Features a leaderboard, logs.tf and team preview screenshots, and other useful commands.

## Running

You can run the service locally using [Deno](https://docs.deno.com/runtime/):

```cmd
deno task dev
```

This will install all dependencies.

### Production

This service is ran using Docker. To run locally, first build the service:

```cmd
docker build -f Dockerfile.local . -t "payload-neo"
```

Then run the container:

```cmd
docker run --name "payload" --init -it --rm -v ./data.db:/data/data.db --env-file=.env.docker payload-neo
```

If you're using windows, use an explicit path for the volume:

```cmd
docker run --name "payload" --init -it --rm -v ${PWD}/data.db:/data/data.db --env-file=.env.docker payload-neo
```

# Issues, Questions

Any issues or questions should be posted on GitHub issues, where they can be more easily tracked. Feature requests are welcome!

# Support this Project

You may back me on my [Patreon](https://www.patreon.com/c43721). Direct sponsorship of this project can be discussed on Discord (24#7644) or by another medium.

# Contributing

Before contributing, please make sure no one else has stated against your proposal. Otherwise, make a Pull Request detailing your proposal and any relevant code changes.

# Useful Links

- [Main Page](https://payload.tf/)
- [Invite](https://payload.tf/invite)
- [Discord](https://payload.tf/discord)
- [Translation](https://crowdin.com/project/payload)

# License

This project is [MIT licensed](LICENSE).
