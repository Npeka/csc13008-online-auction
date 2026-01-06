import { memo, useState } from "react";
import { format } from "date-fns";
import { MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { questionsApi } from "@/lib";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Question } from "@/types";

interface AskSellerFormProps {
  productId: string;
  questions: Question[];
  onQuestionAsked: () => void;
  className?: string;
}

export const AskSellerForm = memo(function AskSellerForm({
  productId,
  questions,
  onQuestionAsked,
  className,
}: AskSellerFormProps) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to ask a question");
      navigate("/login");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter your question");
      return;
    }

    try {
      setIsSubmitting(true);
      await questionsApi.askQuestion(productId, content.trim());
      toast.success("Question sent! The seller has been notified via email.");
      setContent("");
      onQuestionAsked();
    } catch (error) {
      toast.error("Failed to send question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Question Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="question"
            className="mb-2 block text-sm font-medium text-text"
          >
            <MessageCircle className="mr-2 inline h-4 w-4" />
            Ask the Seller
          </label>
          <textarea
            id="question"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              isAuthenticated
                ? "Have a question about this product? Ask the seller..."
                : "Please login to ask a question"
            }
            disabled={!isAuthenticated}
            rows={3}
            className={cn(
              "w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-text",
              "placeholder:text-text-muted",
              "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>
        <div className="flex justify-end">
          {isAuthenticated ? (
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!content.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Question
            </Button>
          ) : (
            <Button type="button" onClick={() => navigate("/login")}>
              Login to Ask
            </Button>
          )}
        </div>
      </form>

      {/* Q&A List */}
      <div className="space-y-4">
        <h3 className="font-medium text-text">
          Questions & Answers ({questions.length})
        </h3>

        {questions.length === 0 ? (
          <p className="py-8 text-center text-text-muted">
            No questions yet. Be the first to ask!
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

                {/* Answer */}
                {q.answer && (
                  <div className="mt-3 ml-10 rounded-lg bg-bg-secondary p-3">
                    <p className="mb-1 text-xs font-medium text-primary">
                      Seller's Answer
                    </p>
                    <p className="text-sm text-text">{q.answer.content}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {format(new Date(q.answer.createdAt), "MMM d, yyyy")}
                    </p>
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
