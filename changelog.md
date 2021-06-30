## Changelog
### 3.2.0
* Added new commands: 
    * !info
    * !invite
    * !changelog
* Changelog notes will be posted on TFTV thread and in the new Discord.
* Fixed issues with TFBot typing in channel when command failed.

### 3.2.2
* Added hl.tf thread previews 

### 3.3.0
* Huge framework upgrade
    * Cleared up tons of code, hopefully runs faster and better
* !commands
    * Replies a RichEmbed of all commands and automatic responses
* Added steam connect from links
    * Like with Payload, will reply with a RichEmbed of the server name, connect info, and players in server.
* Actually fixed issues with tfbot typing. No joke.

### 3.4.0
* Permissions adjustment for some commands
* RichEmbeds now have color-coordinated meanings:
    * Yellow: TFBot-related
    * Red: Administration/other (N/A yet)
    * Orange: Command related
    * Blue: User Related
* TFBot API can be accessed through the command !api. Returns JSON of commands, autoresponses and stats.
* New command: !profile
    * Replies with a RichEmbed of user bot status, discord id, and steamid (if previously entered)
* Removed duplicate entries in steamid database
* Automatic response of changelog in discord. Type !info to get into our discord!
* Automatic reponse to guild owners of changelog. This can be turned off. !help config notifications.

### 3.4.1
* Automatic changelog response to guild owners is working. Opt out: !help config notifications
* Updated code types. 
* API is working, was set to wrong port.
* Celebrating over 35 server! Thanks to you all!!!

### 3.4.2
* Added commands from Payload:
    * 8ball
    * rtd
* Removed timestamp on !profile
* Working hard on the restrict command, please use permissions for limiting bot functionality for now. This update is expected to release around Christmas. 

### 3.4.3
* Guild specific prefixes for global testing
    * !config prefix set prefix OR "your prefix with space"
    * !config prefix delete to delete
        * needs admin permissions for both adding and deleting
* Happy prefixing! 

### 3.5.0
* Commands:
    * Restrict, unrestrict, snipe, findping, prefix, config logs-api-key, combine, choose, gibus, purge, pushcart, sans, translate, focus
* Pushcart
    * Same old from Payload
* Prefix
    * Changes:
        * Seperated from !config, now is own command
* Config
    * Removed Commands: prefix
    * Added Commands: logs-api-key
        * For use in !combine
* Snipe
    * For users with "MANAGE_MESSAGES" permissions to avoid filter workarounds
    * findping uses snipe cache for finding pings lost to message delete
* Restrict
    * Works as it used to with Payload

### 3.5.1
* Fixed issue with DMs and prefixes
* Added more to profile
* Added options to !prefix

### 3.5.2
* Added UGC team previews, finally.
* Backend prefix brushup for non-text channels
* Cleaned code

### 3.5.3
* Tweaked UGC team previews
* Backend support for bad server names
* Edited message command support
* Moved version control outside config

### 3.6.0
* Migrated to MongoDB
* Added better support for guild prefixes
* Added base for guild languages
* Started localization processes
* Logging support for errors in discord channels
* Better logging for guilds / dms
* Fixed issue with RegEx on fetching changelog
* Fixed prefixes interfering with DM's
* For issues with prefixes, changelog configuration, or other: Please reset them as it may have been lost in data migration. We're sorry for the inconvenience. 

### 3.6.1
* Updated code
* Commands now reflects restricted commands, and only shows commands that are not restricted.
* !restrict, !unrestrict now works with as many commands as you want, and with as many channels at once as you'd like
* !restrict, !unrestrict no longer restrict non-commands.
* Updated pushcart, pushcart servers, pushcart gift (Points *should* reset correctly)
* Pushcart push weights adjusted slightly
* rgl team previews fixed
* !prefix show removed, in favor of !prefix showing prefix when no arguments specified
* Spelling changes

### 3.6.2
* !combine uses new parser (Logify 4). Works now!
* RGL previews fixed on all machines. Have fun!
* Removed many unneeded dependencies.
* Renamed logs-api-key to just api-key. Type !help config for more.
* Fixed duplicate API requests for !combine
* Complier changes using ES2020

### 3.6.3
* !profile will link to RGL profile, if there is one
* !rgl [mention, steamid] will fetch RGL profile with information such as bans, probations, name, and more. In works for getting experience
* !config api-key will link you to the logs.tf page to aquire one

### 3.6.4
* Update package.json: discord.js -> 12.1.1
* Deleted commands: !pchajwozek, !pushkart (localization process)
* Guild language support (!language)
* New command: !language (sets guild language)
* New autoresponse constructors (framework)
* Moved all responses to localization files
* Moved RGL and ETF2L api routes to functions
* Moved SteamID api to local function, api route still works
* Updated !prefix set
* Updated !unrestrict spelling
* Updated API
* Fixed all SourceQuery timeouts (so far)
* Fixed !translate

### 3.6.5
* Updated localization files
* New command: !settings. Controls settings for !snipe, and dashboard permissions access.
* Pushed some website updates. Final dashboard still in work, however.

### 3.6.6
* Updated localization files
* Updated command: prefix, language, info
* !info properly thanks our translators
* Language command changes: added new languages (finnish, polish, spanish)
* !language, !prefix now don't need admin to see current prefix/language (However to set/delete you do)
* Updating a message with a command now deletes the old response and replaces it with the new output
* TFTV preview embeds now show the desired comment on the thread
* You may now restrict auto responses from channels
* Fixed !rgl
* Fixed !8ball not sending invalid response notification

### 3.6.7
* Updated API
* Server rcon in discord
* Updated localization files thanks to our translators!

### 3.6.71
* Moved completely to Docker
* Updated types

### 3.6.72
* Fix docker stuff
* Threw the website on docker with nginx, nginx controls bot api as well
* More type updates
* Added owner-only command to help pinpoint memory errors during production

### 3.6.73
* Docs page, main page styling changes
* /api/stats has version
* nginx updates
### 3.6.74
* API endpoints changed
* Cache will reduce to minimum every 5 minutes
* Updated package dependencies
* Updated localization files

### 3.6.75
* Default notifications to none
* Redo api docs
* Updated package dependencies
* Updated localization files

### 3.6.76
* Fix rgl error response message
* (Breaking) Remove all external routes from api
* Remove old / broken commands 
* Updated package dependencies

### 3.7.0
* Remove static files from repo
* Redirect all traffic to nginx
* Beta dashboard release
* (Breaking) Use node 14

### 3.7.1
* Better logging
* Added ability to change snipe permissions from dashboard

### 3.8.0
* Improved steam connect auto responses
* Improved discord login
* Optimized leaderboard query, added embed colors to pushcart commands
* Updated package dependencies

### 3.8.1
* Add redis for caching
* Added more user api routes
* Fixed + refactored profile command
* Updated package dependencies

