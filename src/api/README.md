# Payload-neo Official API Documentation

- Base route: https://payload.tf/api/
- Combine the base route with the sub routes below to get a full route
- Example: GET /api/internal/public/stats

# Internal (Public) /internal/public/

- All the routes relating to Payload directly

### GET /commands

- Get all the commands and auto reponses from the bot (with the version)

```js
    {
        "commands": {
            "count": Number,
            "data": [
               {
                    "name": String,
                    "description": String,
                    "args": Object[],
                    "permissions": String[]
                    "canBeExecutedBy": String[],
                    "zones": String[],
                    "requiresRoot": Boolean,
                    "subCommands": Object,
                    "commandLadder": Array
                },
            ]
        },
        "autoReponses": {
            "count": 10,
            "data": [
                {
                    "name": String,
                    "description": String,
                    "pattern": String,
                    "permissions": String[]
                    "zones": String[],
                },
            ]
        }
    }
}
```

### GET /stats

- Get all the stats, including amount of users and uptime of the bot

```js
    {
        "users": Number,
        "servers": Number,
        "uptime": Number,
        "version": String
    }
```
