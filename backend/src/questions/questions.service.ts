import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { AskQuestionDto, AnswerQuestionDto } from './dto/question.dto';

@Injectable()
export class QuestionsService {
  constructor(private questionsRepository: QuestionsRepository) {}

  async askQuestion(productId: string, askerId: string, dto: AskQuestionDto) {
    const question = await this.questionsRepository.create({
      productId,
      askerId,
      question: dto.content, // Map DTO content to schema question field
    });

    // TODO: Send email notification to seller

    return question;
  }

  async getProductQuestions(productId: string) {
    return this.questionsRepository.findByProduct(productId);
  }

  async answerQuestion(
    questionId: string,
    sellerId: string,
    dto: AnswerQuestionDto,
  ) {
    const question = await this.questionsRepository.findById(questionId);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Only seller can answer
    if (question.product.sellerId !== sellerId) {
      throw new ForbiddenException(
        'Only the product seller can answer questions',
      );
    }

    const answer = await this.questionsRepository.createAnswer(
      questionId,
      sellerId,
      dto.answer,
    );

    // TODO: Send email notification to asker

    return answer;
  }
}
