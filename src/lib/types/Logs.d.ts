export interface LogData {
    logs: any;
    id: string,
    version: number,
    teams: {
        Red: {
            score: number,
            kills: number,
            deaths: number,
            dmg: number,
            charges: number,
            drops: number,
            firstcaps: number,
            caps: number
        },
        Blue: {
            score: number,
            kills: number,
            deaths: number,
            dmg: number,
            charges: number,
            drops: number,
            firstcaps: number,
            caps: number
        }
    },
    length: number,
    players: {
        [id: string]: {
            team: Team,
            class_stats: Array<{
                type: TF2Class,
                kills: number,
                assists: number,
                deaths: number,
                dmg: number,
                weapon: {
                    [name: string]: {
                        kills: number,
                        dmg: number,
                        avg_dmg: number,
                        shots: number,
                        hits: number
                    }
                }
                total_time: number
            }>,
            kills: number,
            deaths: number,
            assists: number,
            suicides: number,
            kapd: number,
            kpd: number,
            dmg: number,
            dmg_real: number,
            dt: number,
            dt_real: number,
            hr: number,
            lks: number,
            as: number,
            dapd: number,
            dapm: number,
            ubers: number,
            ubertypes: {
                [name: string]: number
            },
            drops: number,
            medkits: number,
            medkits_hp: number,
            backstabs: number,
            headshots: number,
            headshots_hit: number,
            sentries: number,
            heal: number,
            cpc: number,
            ic: number,
            medicstats?: {
                advantages_lost: number,
                biggest_advantage_lost: number,
                deaths_with_95_99_uber: number,
                deaths_within_20s_after_uber: number,
                avg_time_before_healing: number,
                avg_time_to_build: number,
                avg_time_before_using: number,
                avg_uber_length: number
            }
        }
    },
    names: {
        [id: string]: string
    },
    rounds: Array<{
        start_time: number,
        winner: Team,
        team: {
            Blue: {
                score: number,
                kills: number,
                dmg: number,
                ubers: number
            },
            Red: {
                score: number,
                kills: number,
                dmg: number,
                ubers: number
            }
        },
        events: Array<UberchargeEvent | PointcapEvent | MedicDeathEvent | RoundWinEvent | DropEvent>,
        players: {
            [id: string]: {
                team: Team,
                kills: number,
                dmg: number
            }
        },
        firstcap: Team,
        length: number
    }>,
    healspread: {
        [id: string]: {
            [id: string]: number
        }
    },
    classkills: {
        [id: string]: TF2ClassNumberSpread
    },
    classdeaths: {
        [id: string]: TF2ClassNumberSpread
    },
    classkillassists: {
        [id: string]: TF2ClassNumberSpread
    },
    chat: Array<ChatObject>
}

export interface ChatObject {
    steamid: string,
    name: string,
    msg: string
}

export interface TF2ClassNumberSpread {
    scout?: number;
    soldier?: number;
    pyro?: number;
    heavyweapons?: number;
    demoman?: number;
    engineer?: number;
    medic?: number;
    sniper?: number;
    spy?: number;
}

export type Team = "Blue" | "Red";

export type TF2Class = "scout" | "soldier" | "pyro" | "heavyweapons" | "demoman" | "engineer" | "medic" | "sniper" | "spy";

export interface BaseEvent {
    type: string;
    time: number;
    team: Team;
}

export interface UberchargeEvent extends BaseEvent {
    type: "charge";
    medigun: string;
    steamid: string;
}

export interface PointcapEvent extends BaseEvent {
    type: "pointcap";
    point: number;
}

export interface MedicDeathEvent extends BaseEvent {
    type: "medic_death";
    killer: string;
    steamid: string;
}

export interface DropEvent extends BaseEvent {
    type: "drop";
    steamid: string;
}

export interface RoundWinEvent extends BaseEvent {
    type: "round_win";
}