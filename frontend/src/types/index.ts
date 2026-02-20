export enum SkillCategory {
  UIUXDesign = 0,
  WebDevelopment = 1,
  MobileDevelopment = 2,
  BlockchainDevelopment = 3,
  DataScience = 4,
  DevOps = 5,
  RustDevelopment = 6,
  SolidityDevelopment = 7,
  GraphicDesign = 8,
  ContentWriting = 9,
  VideoEditing = 10,
  DigitalMarketing = 11,
  ProjectManagement = 12,
  Other = 13,
}

export const SkillCategoryNames: Record<SkillCategory, string> = {
  [SkillCategory.UIUXDesign]: "UI/UX Design",
  [SkillCategory.WebDevelopment]: "Web Development",
  [SkillCategory.MobileDevelopment]: "Mobile Development",
  [SkillCategory.BlockchainDevelopment]: "Blockchain Development",
  [SkillCategory.DataScience]: "Data Science",
  [SkillCategory.DevOps]: "DevOps",
  [SkillCategory.RustDevelopment]: "Rust Development",
  [SkillCategory.SolidityDevelopment]: "Solidity Development",
  [SkillCategory.GraphicDesign]: "Graphic Design",
  [SkillCategory.ContentWriting]: "Content Writing",
  [SkillCategory.VideoEditing]: "Video Editing",
  [SkillCategory.DigitalMarketing]: "Digital Marketing",
  [SkillCategory.ProjectManagement]: "Project Management",
  [SkillCategory.Other]: "Other",
};

export enum BadgeTier {
  BRONZE = 0,
  SILVER = 1,
  GOLD = 2,
  PLATINUM = 3,
  DIAMOND = 4,
  LEGEND = 5,
}

export const BadgeTierNames: Record<BadgeTier, string> = {
  [BadgeTier.BRONZE]: "Bronze",
  [BadgeTier.SILVER]: "Silver",
  [BadgeTier.GOLD]: "Gold",
  [BadgeTier.PLATINUM]: "Platinum",
  [BadgeTier.DIAMOND]: "Diamond",
  [BadgeTier.LEGEND]: "Legend",
};

export enum JobStatus {
  Open = 0,
  InProgress = 1,
  UnderReview = 2,
  Completed = 3,
  Disputed = 4,
  Cancelled = 5,
}

export const JobStatusNames: Record<JobStatus, string> = {
  [JobStatus.Open]: "Open",
  [JobStatus.InProgress]: "In Progress",
  [JobStatus.UnderReview]: "Under Review",
  [JobStatus.Completed]: "Completed",
  [JobStatus.Disputed]: "Disputed",
  [JobStatus.Cancelled]: "Cancelled",
};

export interface Job {
  id: bigint;
  client: string;
  freelancer: string;
  title: string;
  description: string;
  budget: bigint;
  escrowAmount: bigint;
  paymentToken: string; // address(0) for ETH, otherwise ERC20 address
  requiredSkill: SkillCategory;
  minimumTier: BadgeTier;
  status: JobStatus;
  createdAt: bigint;
  deadline: bigint;
  deliverableSubmittedAt: bigint;
  deliverableHash: string;
  referredBy: string;
}

export interface Application {
  freelancer: string;
  proposal: string;
  timestamp: bigint;
  accepted: boolean;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  timestamp: bigint;
  score: bigint;
  tier: BadgeTier;
  jobsInSkill: bigint;
  totalEarningsInSkill: bigint;
  avgRating: bigint; // Rating * 100 for precision (e.g., 450 = 4.5 stars)
}

export interface JobBadge {
  jobId: bigint;
  recipient: string;
  role: 0 | 1; // 0 = Freelancer, 1 = Client
  amount: bigint;
  timestamp: bigint;
  rating: number;
  review: string;
}

export interface Message {
  id: string;
  jobId: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Notification {
  id: string;
  recipient: string;
  type: "job_posted" | "application_received" | "application_accepted" | "job_completed" | "message" | "dispute";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  link?: string;
}
