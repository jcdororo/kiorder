import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: Request): string | null =>
        (req.cookies?.access_token as string | undefined) ?? null,

      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: { userId: string; email: string; role: string }): {
    userId: string;
    email: string;
    role: string;
  } {
    return { userId: payload.userId, email: payload.email, role: payload.role };
  }
}
