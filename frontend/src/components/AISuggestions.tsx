import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Sparkles, RefreshCw, Check, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface AISuggestionsProps {
  type: "title" | "description";
  onSelect: (suggestion: string) => void;
  context?: {
    keywords?: string;
    title?: string;
    additionalContext?: string;
  };
  currentValue?: string;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({
  type,
  onSelect,
  context,
  currentValue,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      let response;

      if (type === "title") {
        const keywords = context?.keywords || currentValue || "";
        if (!keywords.trim()) {
          toast.error("Please enter some keywords first");
          return;
        }

        response = await axios.post(`${API_URL}/ai/generate/titles`, {
          keywords: keywords.trim(),
        });
      } else {
        const title = context?.title || "";
        if (!title.trim()) {
          toast.error("Please enter a job title first");
          return;
        }

        response = await axios.post(`${API_URL}/ai/generate/descriptions`, {
          title: title.trim(),
          context: context?.additionalContext,
        });
      }

      if (response.data.success) {
        setSuggestions(response.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast.error(error.response?.data?.error || "Failed to generate suggestions");
    } finally {
      setLoading(false);
    }
  };

  const improveCurrent = async () => {
    if (!currentValue || !currentValue.trim()) {
      toast.error("Please enter some text first");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/ai/improve`, {
        text: currentValue.trim(),
        type,
      });

      if (response.data.success) {
        onSelect(response.data.improved);
        setShowSuggestions(false);
      }
    } catch (error: any) {
      console.error("Error improving text:", error);
      toast.error(error.response?.data?.error || "Failed to improve text");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={generateSuggestions}
          disabled={loading}
          variant="outline"
          className="flex-1 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
          size="sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggest {type === "title" ? "Titles" : "Descriptions"}
            </>
          )}
        </Button>

        {currentValue && currentValue.trim() && (
          <Button
            type="button"
            onClick={improveCurrent}
            disabled={loading}
            variant="outline"
            className="flex-1 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Improve with AI
              </>
            )}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    AI Suggestions
                  </span>
                  <span className="text-xs text-blue-600">
                    Click to use
                  </span>
                </div>

                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelect(suggestion)}
                        className="w-full text-left p-3 bg-white border-2 border-blue-100 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm text-gray-800 flex-1">
                            {suggestion}
                          </span>
                          <Check className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={() => setShowSuggestions(false)}
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs"
                >
                  Close Suggestions
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
