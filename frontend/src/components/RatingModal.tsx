import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Sparkles } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | number;
  rater: string;
  ratee: string;
  raterType: "Buyer" | "Seller";
  rateeName?: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  jobId,
  rater,
  ratee,
  raterType,
  rateeName,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await axios.post(`${API_URL}/ratings`, {
        jobId: Number(jobId),
        rater,
        ratee,
        raterType,
        rating,
        review: review.trim(),
      });

      if (response.data.success) {
        toast.success("Rating submitted successfully!");
        onClose();
        // Reset form
        setRating(0);
        setReview("");
      }
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const generateReviewSuggestions = async () => {
    if (rating === 0) {
      setError("Please select a rating first");
      return;
    }

    try {
      setLoadingSuggestions(true);
      setError("");

      const response = await axios.post(`${API_URL}/ai/generate/review-suggestions`, {
        rating,
        jobType: raterType === "Buyer" ? "hiring" : "freelance",
      });

      if (response.data.success) {
        setAiSuggestions(response.data.suggestions);
      }
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      setError(error.response?.data?.error || "Failed to generate suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setHoveredRating(0);
      setReview("");
      setError("");
      setAiSuggestions([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Rate Your {raterType === "Buyer" ? "Seller" : "Buyer"}
          </DialogTitle>
          <DialogDescription>
            How was your experience working with{" "}
            {rateeName || ratee.substring(0, 10) + "..."}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Rating</Label>
            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                >
                  <Star
                    className={`h-10 w-10 transition-all ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-base font-semibold">
              Review <span className="text-gray-500 font-normal">(Optional)</span>
            </Label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience working together..."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 text-right">
              {review.length}/500 characters
            </p>

            <Button
              type="button"
              onClick={generateReviewSuggestions}
              disabled={loadingSuggestions || rating === 0}
              variant="outline"
              size="sm"
              className="w-full border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              {loadingSuggestions ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Suggest Review
                </>
              )}
            </Button>

            {/* AI Suggestions */}
            <AnimatePresence>
              {aiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setReview(suggestion);
                        setAiSuggestions([]);
                      }}
                      className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-all text-sm"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-50 border border-red-200 rounded-md"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Send className="h-4 w-4" />
                </motion.div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Rating
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
