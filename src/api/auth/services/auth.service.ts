import type { Environment } from "#api/environment/environment";
import { Injectable } from "@nestjs/common";
import { sign, verify } from "jsonwebtoken";
import { Error } from "mongoose";
import { AuthContext } from "../interfaces/auth.interface";

@Injectable()
export class AuthService {
  constructor(private environment: Environment) {}

  async generateJwtToken(
    context: AuthContext,
    discordId: string
  ): Promise<string> {
    switch (context) {
      case AuthContext.AUTH: {
        return sign({ id: discordId }, this.environment.jwtAuthSecret, {
          expiresIn: "15m",
        });
      }
      case AuthContext.REFRESH: {
        const token = sign(
          { id: discordId },
          this.environment.jwtRefreshSecret,
          {
            expiresIn: "1w",
          }
        );

        await RefreshToken.create({ value: token });
        return token;
      }
    }
  }

  async refreshTokens(oldRefreshToken: string) {
    try {
      await RefreshToken.deleteOne({ value: oldRefreshToken }).orFail().lean();

      const decoded = verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as {
        id: string;
        iat: number;
        exp: number;
      };

      const authToken = await this.generateJwtToken(
        AuthContext.AUTH,
        decoded.id
      );
      
      const refreshToken = await this.generateJwtToken(
        AuthContext.REFRESH,
        decoded.id
      );

      return { authToken, refreshToken };
    } catch (err) {
      if (err instanceof Error.DocumentNotFoundError) return null;
      return null;
    }
  }
}
