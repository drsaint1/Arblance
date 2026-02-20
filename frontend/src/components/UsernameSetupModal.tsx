import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { userApi } from "@/services/api.service";
import { User, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface UsernameSetupModalProps {
  isOpen: boolean;
  walletAddress: string;
  onComplete: () => void;
  onSkip?: () => void;
}

export const UsernameSetupModal: React.FC<UsernameSetupModalProps> = ({
  isOpen,
  walletAddress,
  onComplete,
  onSkip,
}) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const validateUsername = (value: string) => {
    const regex = /^[a-z0-9_]+$/;
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username must be less than 20 characters";
    if (!regex.test(value)) return "Username can only contain lowercase letters, numbers, and underscores";
    return "";
  };

  const checkUsernameAvailability = async (value: string) => {
    const validationError = validateUsername(value);
    if (validationError) {
      setError(validationError);
      setUsernameAvailable(false);
      return;
    }

    setChecking(true);
    setError("");

    try {
      const result = await userApi.checkUsername(value.toLowerCase());
      setUsernameAvailable(result.available);
      if (!result.available) {
        setError(result.reason || "Username is already taken");
      }
    } catch (err) {
      setError("Failed to check username availability");
      setUsernameAvailable(false);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    const lowercase = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(lowercase);
    setUsernameAvailable(null);
    setError("");

    if (lowercase.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(lowercase);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async () => {
    if (!usernameAvailable || !username) {
      setError("Please choose a valid, available username");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    try {
      setSaving(true);

      await userApi.updateUserProfile(walletAddress, {
        username: username,
        displayName: displayName.trim(),
      });

      // Mark setup as complete
      localStorage.setItem(`username_setup_${walletAddress}`, "true");

      onComplete();
    } catch (err: any) {
      console.error("Failed to save username:", err);
      const message = err.response?.data?.error || err.message || "Failed to save username";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`username_setup_${walletAddress}`, "skipped");
    if (onSkip) onSkip();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-blue-200 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center gap-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-8 w-8" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">Welcome to ArbLance!</CardTitle>
                  <CardDescription className="text-blue-100">
                    Let's set up your profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Why set a username?</p>
                      <p>Your username will be shown throughout the platform instead of your long wallet address!</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="username">
                  Username * <span className="text-xs text-gray-500">(3-20 characters)</span>
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="johndoe_123"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`pr-10 ${
                      usernameAvailable === true
                        ? "border-green-500 focus:border-green-500"
                        : usernameAvailable === false
                        ? "border-red-500 focus:border-red-500"
                        : ""
                    }`}
                  />
                  <div className="absolute right-3 top-3">
                    {checking && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {!checking && usernameAvailable === true && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {!checking && usernameAvailable === false && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Lowercase letters, numbers, and underscores only
                </p>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </motion.p>
                )}
                {usernameAvailable && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-green-600 flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Username is available!
                  </motion.p>
                )}
              </motion.div>

              {/* Display Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="displayName">
                  Display Name * <span className="text-xs text-gray-500">(shown on your profile)</span>
                </Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={30}
                />
                <p className="text-xs text-gray-500">
                  Can contain spaces, capitals, and special characters
                </p>
              </motion.div>

              {/* Preview */}
              {username && displayName && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4"
                >
                  <p className="text-xs font-semibold text-blue-600 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-lg">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      <p className="text-sm text-gray-600">@{username}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="flex-1"
                  disabled={saving}
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!usernameAvailable || !displayName.trim() || saving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-center text-gray-500">
                You can change your username and display name later in settings
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
