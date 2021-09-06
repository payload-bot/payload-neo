import { RefreshToken } from "#/lib/models/RefreshToken";
import { sign, verify } from "jsonwebtoken";
import { Error } from "mongoose";

export enum AuthContext {
    AUTH,
    REFRESH,
}

export default class AuthService {
    constructor() {}

    async generateJwtToken(context: AuthContext, discordId: string): Promise<string> {
        switch (context) {
            case AuthContext.AUTH: {
                return sign({ id: discordId }, process.env.JWT_SECRET as string, { expiresIn: "15m" });
            }
            case AuthContext.REFRESH: {
                const token = sign({ id: discordId }, process.env.JWT_REFRESH_SECRET as string, {
                    expiresIn: "1w",
                });
                await RefreshToken.create({ value: token });
                return token;
            }
        }
    }

    async refreshTokens(oldRefreshToken: string) {
        try {
            await RefreshToken.deleteOne({ value: oldRefreshToken }).orFail().lean().exec();

            const decoded = verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET as string) as {
                id: string;
                iat: number;
                exp: number;
            };

            const authToken = await this.generateJwtToken(AuthContext.AUTH, decoded.id);
            const refreshToken = await this.generateJwtToken(AuthContext.REFRESH, decoded.id);

            return { authToken, refreshToken };
        } catch (err) {
            if (err instanceof Error.DocumentNotFoundError) return null;
            return null;
        }
    }
}
