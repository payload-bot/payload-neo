import type { Environment } from "#api/environment/environment";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { sign, verify } from "jsonwebtoken";
import { Model } from "mongoose";
import { AuthContext } from "../interfaces/auth.interface";
import {
  RefreshToken,
  RefreshTokenDocument,
} from "../models/refreshToken.model";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshToken: Model<RefreshTokenDocument>,
    private environment: Environment
  ) {}

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

        await this.refreshToken.create({ value: token });
        return token;
      }
    }
  }

  async refreshTokens(oldRefreshToken: string) {
    try {
      await this.refreshToken
        .deleteOne({ value: oldRefreshToken })
        .orFail()
        .lean();

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
      return null;
    }
  }
}
