import { memo, useState } from "react";
import { format } from "date-fns";
import { MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { questionsApi } from "@/lib";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface SellerQAFormProps {
  productId: string;
  questions: Question[];
  onQuestionAnswered: () => void;
  className?: string;
}

export const SellerQAForm = memo(function SellerQAForm({
  productId,
  questions,
  onQuestionAnswered,
  className,
}: SellerQAFormProps) {
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(
    null
  );
  const [answerContent, setAnswerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerContent.trim()) {
      toast.error("Please enter your answer");
      return;
    }

    try {
      setIsSubmitting(true);
      await questionsApi.answerQuestion(productId, questionId, answerContent.trim());
      toast.success("Answer posted successfully!");
      setAnswerContent("");
      setAnsweringQuestionId(null);
      onQuestionAnswered();
    } catch (error) {
      toast.error("Failed to post answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAnswer = () => {
    setAnsweringQuestionId(null);
    setAnswerContent("");
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <MessageCircle className="h-5 w-5 text-primary" />
        <div>
          <p className="font-medium text-text">
            Seller View
          </p>
          <p className="text-sm text-text-muted">
            Answer questions inline to engage with buyers
          </p>
        </div>
      </div>

      {/* Q&A List */}
      <div className="space-y-4">
        <h3 className="font-medium text-text">
          Questions & Answers ({questions.length})
        </h3>

        {questions.length === 0 ? (
          <p className="py-8 text-center text-text-muted">
            No questions yet. Buyers will see this when they have questions.
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="rounded-lg border border-border bg-bg-card p-4"
              >
                {/* Question */}
                <div className="flex gap-3">
                  <Avatar
                    src={q.asker?.avatar}
                    fallback={q.asker?.name || "?"}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-text">
                        {q.asker?.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-text-muted">
                        {format(new Date(q.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="mt-1 text-text">{q.content}</p>
                  </div>
                </div>

                {/* Existing Answer */}
                {q.answer && (
                  <div className="mt-3 ml-10 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <p className="mb-1 text-xs font-medium text-primary">
                      ✓ Your Answer
                    </p>
                    <p className="text-sm text-text">{q.answer.content}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {format(new Date(q.answer.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                )}

                {/* Answer Form (Facebook-style inline) */}
                {!q.answer && (
                  <div className="mt-3 ml-10">
                    {answeringQuestionId === q.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={answerContent}
                          onChange={(e) => setAnswerContent(e.target.value)}
                          placeholder="Write your answer..."
                          rows={3}
                          autoFocus
                          className={cn(
                            "w-full rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text",
                            "placeholder:text-text-muted",
                            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          )}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAnswerSubmit(q.id)}
                            isLoading={isSubmitting}
                            disabled={!answerContent.trim()}
                          >
                            <Send className="mr-1 h-3 w-3" />
                            Post Answer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelAnswer}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAnsweringQuestionId(q.id)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Answer this question
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

