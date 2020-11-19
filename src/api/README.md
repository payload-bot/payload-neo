# Payload-neo Official API Documentation

- Base route: https://payload.tf/api/
- Combine the base route with the sub routes below to get a full route
- Example for the external Rcon route: POST /api/external/rcon
- Example for the internal stats route: POST /api/internal/client/stats

# External (All public) /external/

### Rcon

```
    //POST /rcon

    BODY:
    {
        command: "your command",
        "ip": "ip of server",
        "password": "rcon password
    }

    RESPONSE:
    {
        success: true | false,
        message: "message declaring any errors, or the output of console if success is true
    }
```

### RGL

```
    //GET /rgl/(your id)

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

## Client /client

### Commands

```
    //GET /commands

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

### Stats 

```
    //GET /client/stats

    RESPONSE:
    {
        "users": 1,
        "servers": 1,
        "uptime": 168906,
        "version": "3.6.73"
    }
```
