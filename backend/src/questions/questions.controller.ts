import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AskQuestionDto, AnswerQuestionDto } from './dto/question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('products/:productId/questions')
export class QuestionsController {
  constructor(private questionsService: QuestionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  askQuestion(
    @Param('productId') productId: string,
    @GetUser('id') userId: string,
    @Body() dto: AskQuestionDto,
  ) {
    return this.questionsService.askQuestion(productId, userId, dto);
  }

  @Public()
  @Get()
  getProductQuestions(@Param('productId') productId: string) {
    return this.questionsService.getProductQuestions(productId);
  }

  @Patch(':id/answer')
  @UseGuards(JwtAuthGuard)
  answerQuestion(
    @Param('id') questionId: string,
    @GetUser('id') userId: string,
    @Body() dto: AnswerQuestionDto,
  ) {
    return this.questionsService.answerQuestion(questionId, userId, dto);
  }
}
