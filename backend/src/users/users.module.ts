import { Module, Global } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { SocialAccountsRepository } from './social-accounts.repository';
import { PrismaService } from '../prisma/prisma.service';

@Global()
@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    SocialAccountsRepository,
    PrismaService,
  ],
  exports: [UsersRepository, SocialAccountsRepository],
})
export class UsersModule {}
