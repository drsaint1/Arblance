import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, Lightbulb, Rocket, Newspaper } from "lucide-react";

const articles = [
  {
    title: "ArbLance Launch: A New Era for Decentralized Freelancing",
    date: "February 10, 2026",
    category: "Platform Update",
    icon: Rocket,
    iconColor: "text-blue-600",
    summary:
      "We are thrilled to announce the official launch of ArbLance — the decentralized freelancing marketplace built on Arbitrum. After months of development and testing, the platform is now live and ready for freelancers and clients worldwide.",
    points: [
      "Smart contract escrow for secure payments",
      "On-chain skill verification badges",
      "AI-powered job matching",
      "Zero platform fees during the launch period",
    ],
  },
  {
    title: "Why Web3 Freelancing Is the Future of Remote Work",
    date: "February 5, 2026",
    category: "Industry Insights",
    icon: TrendingUp,
    iconColor: "text-green-600",
    summary:
      "The gig economy is booming, but traditional platforms still take 20-30% in fees and hold payments for weeks. Web3 freelancing platforms are changing that by removing intermediaries and putting money directly in workers' pockets.",
    points: [
      "Traditional platforms charge up to 20% in service fees",
      "Cross-border payments take days through legacy systems",
      "Blockchain escrow eliminates payment disputes",
      "Decentralized reputation is portable across platforms",
    ],
  },
  {
    title: "How to Land Your First Job on ArbLance",
    date: "January 28, 2026",
    category: "Tips & Guides",
    icon: Lightbulb,
    iconColor: "text-yellow-600",
    summary:
      "New to decentralized freelancing? Here is a step-by-step guide to setting up your profile, earning skill badges, and landing your first gig on ArbLance.",
    points: [
      "Connect your wallet and complete your profile with a bio and skills",
      "Take skill assessments to earn on-chain badges that prove your expertise",
      "Browse available jobs and craft personalized proposals",
      "Start with smaller jobs to build your on-chain reputation",
    ],
  },
  {
    title: "Understanding Escrow: How ArbLance Protects Your Payments",
    date: "January 20, 2026",
    category: "Education",
    icon: BookOpen,
    iconColor: "text-purple-600",
    summary:
      "One of the biggest fears in freelancing is not getting paid. ArbLance solves this with smart contract escrow — funds are locked before work begins and released automatically upon approval.",
    points: [
      "Client deposits funds into a smart contract when hiring",
      "Funds are locked and cannot be withdrawn by either party",
      "Freelancer submits completed work for review",
      "Client approves and funds are instantly released — or a dispute is opened",
    ],
  },
  {
    title: "Arbitrum vs Other L2s: Why We Built on Arbitrum",
    date: "January 12, 2026",
    category: "Technical",
    icon: Newspaper,
    iconColor: "text-orange-600",
    summary:
      "We evaluated multiple Layer 2 solutions before choosing Arbitrum for ArbLance. Here is why Arbitrum was the clear winner for a freelancing marketplace.",
    points: [
      "Lowest average gas fees among major L2 rollups",
      "Largest DeFi ecosystem for stablecoin payment support",
      "Full EVM equivalence for seamless smart contract development",
      "Strong developer community and tooling support",
    ],
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Blog
        </h1>
        <p className="text-gray-600">
          News, updates, and insights from the ArbLance team
        </p>
      </div>

      {articles.map((article, index) => {
        const Icon = article.icon;
        return (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span>{article.date}</span>
                <span>•</span>
                <span className="text-blue-600 font-medium">
                  {article.category}
                </span>
              </div>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${article.iconColor}`} />
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>{article.summary}</p>
              <ul className="list-disc pl-6 space-y-2">
                {article.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
