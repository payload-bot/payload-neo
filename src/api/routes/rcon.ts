import { Request, Response } from "express"
import Rcon from 'srcds-rcon';

interface IBodyResponse {
    command: string,
    ip: string,
    password: string
}

/**
 * POST /api/rcon
 */
export default async (req: Request, res: Response) => {
    const { command, ip, password } = req.body as IBodyResponse

    return new Promise(resolve => {
        if (!command) resolve({ success: false, message: "No command found." })
        if (!ip) resolve({ success: false, message: "No IP found." })
        if (!password) resolve({ success: false, message: "No password found." })

        const connection = Rcon({
            address: ip,
            password
        });
        
        connection.connect().then(() => {
            connection.command(command).then(async res => {
                await connection.disconnect();

                resolve({ success: true, response: res })
            }).catch(async (err) => {
                console.log(`Command error: ${err.message}`);
                if (err.details && err.details.partialResponse) {
                    resolve({ success: "partial", message: err.details.partialResponse })
                } else {
                    resolve({ success: false, message: "Failed to send command." })
                }
            });
        }).catch(async () => {
            resolve({ success: false, message: "Failed to connect." });
        });
    });
}