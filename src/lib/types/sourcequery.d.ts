declare interface ServerInfo {
    protocol: number;
    name: string;
    map: string;
    folder: string;
    game: string;
    appid: number;
    players: number;
    maxplayers: number;
    bots: number;
    servertype: string;
    environment: string;
    password: number;
    vac: number;
    version: string;
    port: number;
    steamID: number;
    keywords: string;
    gameID: number;
}

declare class SourceQuery {
    constructor(timeoutMS: number);

    open(ip: string, port: number): void;

    getInfo(callback: (err: Error | undefined, info: ServerInfo) => void): void;
    getPlayers(callback: (err: Error | undefined, players: object) => void): void;
    getRules(callback: (err: Error | undefined, rules: object) => void): void;
}

export default SourceQuery;