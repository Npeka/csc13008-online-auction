import { Module } from '@nestjs/common';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionsRepository } from './questions.repository';
import { PrismaService } from '../prisma/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [QuestionsController],
  providers: [QuestionsService, QuestionsRepository, PrismaService],
  exports: [QuestionsService],
})
export class QuestionsModule {}
