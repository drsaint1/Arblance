import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Layout, Users, Megaphone, PenTool, Heart } from "lucide-react";

const positions = [
  {
    title: "Senior Solidity Developer",
    type: "Full-time · Remote",
    icon: Code,
    iconColor: "text-blue-600",
    description:
      "Design and build the smart contracts that power ArbLance — escrow, dispute resolution, skill badges, and governance. You will work closely with auditors to ensure security and gas efficiency.",
    requirements: [
      "3+ years of Solidity development experience",
      "Experience with Hardhat or Foundry testing frameworks",
      "Understanding of gas optimization and upgrade patterns",
      "Familiarity with Arbitrum or other L2 rollups",
    ],
  },
  {
    title: "Frontend Developer (React / Next.js)",
    type: "Full-time · Remote",
    icon: Layout,
    iconColor: "text-green-600",
    description:
      "Build the user-facing experience of ArbLance. You will create responsive, accessible interfaces that make Web3 feel seamless for both crypto-native users and newcomers.",
    requirements: [
      "Strong experience with React, Next.js, and TypeScript",
      "Experience integrating with Web3 libraries (wagmi, viem, ethers.js)",
      "Eye for design and attention to detail",
      "Understanding of responsive and accessible design patterns",
    ],
  },
  {
    title: "Community Manager",
    type: "Full-time · Remote",
    icon: Users,
    iconColor: "text-purple-600",
    description:
      "Grow and nurture the ArbLance community across Discord, Twitter, and other channels. Be the voice of the platform and the bridge between the team and our users.",
    requirements: [
      "Experience managing communities in Web3 or tech",
      "Excellent written communication skills",
      "Ability to create engaging content and moderate discussions",
      "Passion for freelancing and the gig economy",
    ],
  },
  {
    title: "Marketing Lead",
    type: "Full-time · Remote",
    icon: Megaphone,
    iconColor: "text-orange-600",
    description:
      "Lead ArbLance's go-to-market strategy. Drive user acquisition, partnerships, and brand awareness in the Web3 freelancing space.",
    requirements: [
      "3+ years in digital marketing, preferably in Web3 or SaaS",
      "Experience with content marketing, SEO, and social media",
      "Data-driven mindset with experience in analytics tools",
      "Track record of growing user bases from early stage",
    ],
  },
  {
    title: "UI/UX Designer",
    type: "Contract · Remote",
    icon: PenTool,
    iconColor: "text-pink-600",
    description:
      "Shape the visual identity and user experience of ArbLance. Design intuitive workflows that simplify complex blockchain interactions for everyday users.",
    requirements: [
      "Strong portfolio of web application design work",
      "Proficiency in Figma or similar design tools",
      "Experience designing for Web3 or fintech products",
      "Ability to create and maintain a design system",
    ],
  },
];

export default function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Careers at ArbLance
        </h1>
        <p className="text-gray-600">
          Join us in building the future of decentralized work
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Why Work With Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            ArbLance is a remote-first team building at the intersection of
            blockchain and the future of work. We offer:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fully remote work from anywhere in the world</li>
            <li>Competitive compensation paid in stablecoins or fiat</li>
            <li>Token allocation for early team members</li>
            <li>Flexible hours and async-first culture</li>
            <li>Opportunity to shape a product from the ground up</li>
          </ul>
        </CardContent>
      </Card>

      {positions.map((position, index) => {
        const Icon = position.icon;
        return (
          <Card key={index}>
            <CardHeader>
              <div className="text-sm text-gray-500 mb-1">{position.type}</div>
              <CardTitle className="flex items-center gap-2">
                <Icon className={`h-5 w-5 ${position.iconColor}`} />
                {position.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-700">
              <p>{position.description}</p>
              <p className="font-medium">Requirements:</p>
              <ul className="list-disc pl-6 space-y-2">
                {position.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
              <div className="pt-2">
                <a
                  href={`mailto:careers@arblance.io?subject=Application: ${position.title}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Apply Now
                </a>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="pt-6 text-gray-700">
          <p>
            Don't see a role that fits?{" "}
            <a
              href="mailto:careers@arblance.io?subject=General Application"
              className="text-blue-600 hover:underline"
            >
              Send us your resume
            </a>{" "}
            — we are always looking for talented people who are passionate about
            Web3 and the future of work.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
