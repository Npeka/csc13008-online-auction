import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

/**
 * Guard to check if seller has active privileges (for product creation)
 * - Permanent sellers (ADMIN, manually set SELLER) have no expiry
 * - Temporary sellers (upgraded via request) must be within 7-day window
 * - Expired sellers can still access their existing products
 */
@Injectable()
export class ActiveSellerGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Admin always has seller privileges
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Must be a seller
    if (user.role !== UserRole.SELLER) {
      throw new ForbiddenException(
        'You must be a seller to create products. Request an upgrade from your profile.',
      );
    }

    // Check if seller privileges have expired
    if (user.sellerExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(user.sellerExpiresAt);

      if (now > expiresAt) {
        throw new ForbiddenException(
          'Your seller privileges have expired. Please request a new upgrade to create products.',
        );
      }
    }

    // Either permanent seller (no expiry) or temporary seller within valid period
    return true;
  }
}

