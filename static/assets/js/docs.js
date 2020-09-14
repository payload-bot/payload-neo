const HTML_SPACE = "&nbsp;";
const HTML_INDENT = HTML_SPACE.repeat(4);

(async () => {
    const resp = await fetch("/api/all-data");
    const data = await resp.json();

    const mainHeader = document.querySelector("#docs > .header");
    mainHeader.innerHTML = mainHeader.innerHTML.replace("%VERSION%", data.stats.version);

    //const commandsHeader = document.querySelector("#commands > .header");
    //commandsHeader.innerHTML = commandsHeader.innerHTML.replace("%COMMAND_COUNT%", data.commands.count);
    //const autoResponsesHeader = document.querySelector("#autoresponses > .header");
    //autoResponsesHeader.innerHTML = autoResponsesHeader.innerHTML.replace("%AUTORESPONSE_COUNT%", data.autoResponses.count);

    const commands = data.commands;
    let commandsHTML = "";
    for (let i = 0; i < commands.count; i++) {
        const command = commands.data[i];
        commandsHTML += codeBlock(command);
    }

    const commandsElement = document.createElement("div");
    commandsElement.innerHTML = commandsHTML;
    document.querySelector("#commands").appendChild(commandsElement);

    document.getElementsByClassName("invisible")[0].classList.remove("invisible");
    document.getElementById("loading").remove();

    shiftFocus();

    let highlightable = document.getElementsByClassName("syntax-highlight");
    for (let i = 0; i < highlightable.length; i++) {
        let text = highlightable[i].innerHTML;

        text = text
            .replace(/&lt;.+?&gt;/g, "<span style='color: #7289DA;'>$&</span>")
            .replace(/\[.+?\]/g, "<span style='color: #99AAB5;'>$&</span>");

        highlightable[i].innerHTML = text;
    }

    window.addEventListener("popstate", shiftFocus);
})();

function shiftFocus() {
    [...document.getElementsByClassName("focused")].forEach(elem => {
        elem.classList.remove("focused");
    });

    if (window.location.href.match(/#\w+/)) {
        const commandName = window.location.href.match(/#\w+/)[0].slice(1);
        const targetBlock = document.getElementById(commandName);

        targetBlock.classList.add("focused");
        document.body.scrollTop = targetBlock.offsetTop;
    }
}

function indent(amount = 1) {
    return "|" + HTML_INDENT.repeat(amount).slice(6);
}

function codeBlock(command) {
    const commandName = getFullCommandName(command);

    let commandsHTML = "";
    commandsHTML += `<a href="#${commandName.replace(/ /g, "-")}"><code id="${commandName.replace(/ /g, "-")}" class="command-block"><strong>${commandName}</strong>: <span class="syntax-highlight">${command.description}</span><br>`;

    commandsHTML += `|<br>${indent()}Usage:<br>${indent(2)}<span class="syntax-highlight">${getUsage(command)}</span><br>`;

    commandsHTML += `|<br>${indent()}Arguments:<br>`;
    command.args.forEach(arg => {
        commandsHTML += `${indent(2)}<span class="syntax-highlight">${argToString(arg)}</span>: <span class="syntax-highlight">${arg.description}</span><br>`;
    });
    if (command.args.length == 0) {
        commandsHTML += `${indent(2)}*NONE*<br>`;
    }

    commandsHTML += `|<br>${indent()}Permissions:<br>`;
    commandsHTML += `${indent(2)}For Payload:<br>`;
    command.permissions.forEach(permission => {
        commandsHTML += `${indent(3)}${permission}<br>`;
    });
    commandsHTML += `${indent(2)}For User:<br>`;
    command.canBeExecutedBy.forEach(permission => {
        commandsHTML += `${indent(3)}${permission}<br>`;
    });

    commandsHTML += `|<br>${indent()}Zones:<br>`;
    command.zones.forEach(zone => {
        commandsHTML += `${indent(2)}${zone}<br>`;
    });

    if (Object.keys(command.subCommands).length > 0) {
        commandsHTML += `|<br>${indent()}Subcommands:<br>`;
        for (let subcommand in command.subCommands) {
            commandsHTML += `${indent(2)}${command.subCommands[subcommand].name}<br>`;
        }
    }

    commandsHTML += "</code></a>";

    if (Object.keys(command.subCommands).length > 0) {
        for (let subcommand in command.subCommands) {
            commandsHTML += codeBlock(command.subCommands[subcommand]);
        }
    }

    return commandsHTML;
}

function getFullCommandName(cmd) {
    if (cmd.commandLadder.length > 0) {
        return `${cmd.commandLadder.join(" ")} ${cmd.name}`;
    }

    return cmd.name;
}

function argToString(arg) {
    let innerText = arg.name;

    if (arg.options) {
        innerText = arg.options.join("|");
    }

    if (arg.required) {
        return `&lt;${innerText}&gt;`;
    } else {
        return `[${innerText}]`;
    }
}

function convertArgsToUsageString(cmd) {
    return cmd.args.map(argToString).join(" ");
}

function getFullCommandName(cmd) {
    if (cmd.commandLadder.length > 0) {
        return `${cmd.commandLadder.join(" ")} ${cmd.name}`;
    }

    return cmd.name;
}

function getUsage(cmd) {
    return `!${getFullCommandName(cmd)} ${convertArgsToUsageString(cmd)}`;
}
//! is default right now :/
