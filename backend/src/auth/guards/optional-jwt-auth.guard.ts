import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Auth Guard
 * Allows requests to proceed even if there is no valid JWT token.
 * If a valid token exists, it attaches the user to the request.
 * If no token or invalid token, the request proceeds without a user.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // Return user if authenticated, otherwise return null (don't throw error)
    return user || null;
  }

  canActivate(context: ExecutionContext) {
    // Always return true to allow the request to proceed
    // The handleRequest will attach user if authenticated
    return super.canActivate(context) as Promise<boolean> | boolean;
  }
}

