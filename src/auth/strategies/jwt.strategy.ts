import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { type Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type UserModel } from '../../../generated/prisma/models/User';
import { UserService } from '../../user/user.service';

type JwtPayload = {
  sub: number;
};

/** Returns the configured JWT secret or throws when it is missing. */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

/** Extracts a JWT from the API specification's Token authorization header. */
function extractToken(request: Request): string | null {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Token ')) {
    return null;
  }

  return authorization.slice('Token '.length);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractToken]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  /** Resolves the JWT subject to a user that Passport attaches to the request. */
  async validate(payload: JwtPayload): Promise<UserModel> {
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
