import { IsString } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  content: string;
}

export class AnswerQuestionDto {
  @IsString()
  answer: string;
}
