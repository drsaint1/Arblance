import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Briefcase, CheckCircle, Award, UserPlus, Zap } from "lucide-react";
import axios from "axios";
import { formatAddress, formatEther } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface ActivityItem {
  _id: string;
  type: string;
  displayName?: string;
  username?: string;
  userAddress?: string;
  jobTitle?: string;
  amount?: string;
  skillName?: string;
  timestamp: string;
}

const activityIcons: Record<string, any> = {
  "Job Posted": Briefcase,
  "Job Completed": CheckCircle,
  "Skill Earned": Award,
  "User Joined": UserPlus,
  "Dispute Resolved": Zap,
};

const activityColors: Record<string, string> = {
  "Job Posted": "text-blue-600 bg-blue-50",
  "Job Completed": "text-green-600 bg-green-50",
  "Skill Earned": "text-yellow-600 bg-yellow-50",
  "User Joined": "text-purple-600 bg-purple-50",
  "Dispute Resolved": "text-red-600 bg-red-50",
};

export const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activities.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
      }, 5000); // Change activity every 5 seconds
      return () => clearInterval(interval);
    }
  }, [activities.length]);

  const loadActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/activities/recent?limit=20`);
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const formatActivity = (activity: ActivityItem) => {
    const userName = activity.displayName || activity.username || formatAddress(activity.userAddress || "");

    switch (activity.type) {
      case "Job Posted":
        return {
          text: `${userName} posted a new job`,
          detail: activity.jobTitle || "New opportunity available",
        };
      case "Job Completed":
        return {
          text: `${userName} completed a job`,
          detail: activity.amount ? `${formatEther(BigInt(activity.amount))} ETH earned` : "Job successfully finished",
        };
      case "Skill Earned":
        return {
          text: `${userName} earned a skill badge`,
          detail: activity.skillName || "New skill unlocked",
        };
      case "User Joined":
        return {
          text: `${userName} joined ArbLance`,
          detail: "Welcome to the platform!",
        };
      case "Dispute Resolved":
        return {
          text: `Dispute resolved`,
          detail: "Fair resolution reached",
        };
      default:
        return {
          text: "Platform activity",
          detail: "",
        };
    }
  };

  if (activities.length === 0) return null;

  const currentActivity = activities[currentIndex];
  const Icon = activityIcons[currentActivity.type] || Activity;
  const colorClass = activityColors[currentActivity.type] || "text-gray-600 bg-gray-50";
  const { text, detail } = formatActivity(currentActivity);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-4">
        {/* Activity Icon */}
        <motion.div
          key={`icon-${currentIndex}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`p-3 rounded-full ${colorClass}`}
        >
          <Icon className="h-6 w-6" />
        </motion.div>

        {/* Activity Text */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-semibold text-gray-900 truncate">{text}</p>
              <p className="text-sm text-gray-600 truncate">{detail}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-red-500"
          />
          <span className="text-xs font-semibold text-red-600">LIVE</span>
        </div>
      </div>

      {/* Progress Bar */}
      <motion.div
        key={`progress-${currentIndex}`}
        className="absolute bottom-0 left-0 h-1 bg-blue-600"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </div>
  );
};

// Compact version for smaller spaces
export const CompactActivityTicker: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/activities/recent?limit=10`);
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  return (
    <div className="bg-gray-900 text-white py-2 overflow-hidden">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap"
      >
        {activities.concat(activities).map((activity, index) => {
          const Icon = activityIcons[activity.type] || Activity;
          return (
            <div key={`${activity._id}-${index}`} className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="text-sm">
                {activity.displayName || activity.username || formatAddress(activity.userAddress || "")}
                {" • "}
                {activity.type}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default LiveActivityFeed;
