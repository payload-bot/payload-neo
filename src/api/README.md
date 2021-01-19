# Payload-neo Official API Documentation

- Base route: https://payload.tf/api/
- Combine the base route with the sub routes below to get a full route
- Example: POST /api/external/rcon
- Example: GET /api/internal/public/stats

# External (Public) /external/

- Route handler for all the routes that don't directly interact with the Payload bot

### GET /rgl/:steamid

- Route for getting JSON data from a RGL profile

```
    RESPONSE:
    {
        "steamid": "76561198154342943",
        "avatar": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/9b/9b11a5ff373d7d92cf820dfd9bd5ff2a870e4b20_full.jpg",
        "name": "24",
        "bans": {
            "banned": false,
            "probation": false,
            "verified": false
        },
        "totalEarnings": "$0",
        "trophies": {
            "gold": "0",
            "silver": "0",
            "bronze": "0"
        },
        //Experience is an array which will give you each category from the RGL website
        "experience": [
            {
                "category": "trad. sixes",
                "format": "yomps' family fundraiser",
                "season": "july 25th",
                "div": "unassigned",
                "team": "Free Agent - Open",
                "endRank": "/ 0",
                "recordWith": "",
                "recordWithout": "",
                "amountWon": "",
                "joined": "7/22/2020",
                "left": "",
                "isCurrentTeam": true
            }
        ]
    }
```

# Internal (Public) /internal/public/

- All the routes relating to Payload directly

### GET /commands

- Get all the commands and auto reponses from the bot (with the version)

```
    RESPONSE:
    {
        "commands": {
            "count": 30,
            "data": [
               {
                "name": "avatar",
                "description": "Returns avatar of user.",
                "args": [
                    {
                        "name": "user mention",
                        "description": "The user who's avatar you want to view.",
                        "required": false,
                        "type": "string"
                    }
                ],
                "permissions": [
                    "SEND_MESSAGES"
                ],
                "canBeExecutedBy": [
                    "SEND_MESSAGES"
                ],
                "zones": [
                    "text",
                    "dm"
                ],
                "requiresRoot": false,
                "subCommands": {},
                "commandLadder": []
            },
            //... rest of commands
            ]
        },
        "autoReponses: {
            "count": 10,
            "data": [
                {
                    "name": "etf2l",
                    "description": "Runs ETF2L team previews",
                    "pattern": {},
                    "permissions": [
                        "SEND_MESSAGES",
                        "EMBED_LINKS"
                    ],
                    "zones": [
                        "text",
                        "dm"
                    ]
                },
                //... rest of auto responses
            ]
        }
    }
}
```

### GET /stats

- Get all the stats, including amount of users and uptime of the bot

```
    RESPONSE:
    {
        "users": 1,
        "servers": 1,
        "uptime": 168906,
        "version": "3.6.73"
    }
```
