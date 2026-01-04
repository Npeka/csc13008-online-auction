import type { Question } from "@/types";
import apiClient from "./api-client";

export const questionsApi = {
  // Ask a question about a product
  askQuestion: async (
    productId: string,
    content: string,
  ): Promise<Question> => {
    return await apiClient.post(`/products/${productId}/questions`, {
      content,
    });
  },

  // Get all questions for a product
  getQuestions: async (productId: string): Promise<Question[]> => {
    return await apiClient.get(`/products/${productId}/questions`);
  },

  // Answer a question (seller only)
  answerQuestion: async (
    productId: string,
    questionId: string,
    answer: string,
  ): Promise<Question> => {
    return await apiClient.patch(
      `/products/${productId}/questions/${questionId}/answer`,
      { answer },
    );
  },
};
