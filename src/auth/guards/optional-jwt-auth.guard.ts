import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /** Allows anonymous requests while authenticating requests that include an authorization header. */
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.headers.authorization) {
      return true;
    }

    return super.canActivate(context);
  }
}
