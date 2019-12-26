## Changelog
### 3.2.0
* Added new commands: 
    * !info
    * !invite
    * !changelog
* Changelog notes will be posted on TFTV thread and in the new Discord.
* Fixed issues with TFBot typing in channel when command failed.

### 3.2.1
* Fixed issues with TFBot typing with !invite command.

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

