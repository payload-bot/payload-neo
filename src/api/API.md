# Payload-neo API

### GET /api/commands
Returns JSON array of commands

### GET /api/autoresponses
Returns JSON array of auto responses

### GET /api/stats
Returns JSON object with stats of the bot

Example:
```
//GET /api/stats
//returns
{
    "users": 1,
    "servers": 1,
    "uptime": 93053445,
    "version": "3.6.73"
}
```

### GET /all-data
Returns JSON object with commands, autoResponses, and stats all together.

# External API
Some services are offered through payload-neo's API

### GET /rgl/:id
Returns JSON object with their experience, ban information, and more.
Example:
```
//GET /api/rgl/1
//returns
{
    "error": 400,
    "message": "Could not get SteamID"
}

//GET /api/rgl/[your steam id]
//returns 
{
    steamid: "your steam id",
    avatar: "avatar url",
    name: "your name on rgl",
    bans: {
        banned: false,
        probation: false,
        verified: false
    },
    experience: [
        {
           "category": "trad. sixes",
            "format": "na traditional sixes",
            "season": "sixes s667744",
            "div": "main",
            "team": "your team name",
            "endRank": "1 / 0",
            "recordWith": "(12 - 0)",
            "recordWithout": "",
            "amountWon": "",
            "joined": "join date",
            "left": "leave date",
            "isCurrentTeam": true 
        },
        ...
    ]
}
```

### POST /api/rcon
```
//body
{
    "command": "command to send",
    "ip": "ip of server",
    "password": "rcon password
}

//returns 
{
    success: true.
    response: "output of console"
}
```