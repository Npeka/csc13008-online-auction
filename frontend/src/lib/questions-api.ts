import type { Question } from "@/types";
import apiClient from "./api-client";

// Transform backend question data to frontend Question type
const transformQuestion = (data: any): Question => ({
  id: data.id,
  productId: data.productId,
  askerId: data.askerId,
  asker: data.asker,
  content: data.question, // Backend uses 'question', frontend uses 'content'
  createdAt: data.createdAt,
  answer: data.answers?.[0]
    ? {
        content: data.answers[0].answer,
        createdAt: data.answers[0].createdAt,
      }
    : undefined,
});

export const questionsApi = {
  // Ask a question about a product
  askQuestion: async (
    productId: string,
    content: string,
  ): Promise<Question> => {
    const data = await apiClient.post(`/products/${productId}/questions`, {
      content,
    });
    return transformQuestion(data);
  },

  // Get all questions for a product
  getQuestions: async (productId: string): Promise<Question[]> => {
    const data = await apiClient.get<any[]>(`/products/${productId}/questions`);
    return data.map(transformQuestion);
  },

  // Answer a question (seller only)
  answerQuestion: async (
    productId: string,
    questionId: string,
    answer: string,
  ): Promise<Question> => {
    const data = await apiClient.patch(
      `/products/${productId}/questions/${questionId}/answer`,
      { answer },
    );
    return transformQuestion(data);
  },
};
