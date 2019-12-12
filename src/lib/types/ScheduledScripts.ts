import { Client } from "./Client";

export interface ScheduledScript {
    every: number;
    run: (client: Client) => Promise<void>;
}