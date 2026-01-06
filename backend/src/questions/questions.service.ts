import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { QuestionsRepository } from './questions.repository';
import { AskQuestionDto, AnswerQuestionDto } from './dto/question.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class QuestionsService {
  constructor(
    private questionsRepository: QuestionsRepository,
    private emailService: EmailService,
  ) {}

  async askQuestion(productId: string, askerId: string, dto: AskQuestionDto) {
    const question = await this.questionsRepository.create({
      productId,
      askerId,
      question: dto.content, // Map DTO content to schema question field
    });

    // Get full question with product and seller details for email
    const fullQuestion = await this.questionsRepository.findById(question.id);

    if (fullQuestion?.product) {
      // Send email notification to seller (non-blocking)
      try {
        await this.emailService.sendNewQuestionEmail({
          toEmail: fullQuestion.product.seller.email,
          toName: fullQuestion.product.seller.name,
          askerName: fullQuestion.asker.name,
          productTitle: fullQuestion.product.title,
          productSlug: fullQuestion.product.slug,
          questionContent: dto.content,
        });
      } catch (error) {
        // Log error but don't fail the request
        console.error('Failed to send email notification:', error.message);
      }
    }

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
