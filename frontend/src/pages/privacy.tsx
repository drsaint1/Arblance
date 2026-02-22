import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Database, Cookie, Share2, Clock, UserCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-gray-600">
          Last updated: February 1, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            ArbLance ("we", "us", "our") is committed to protecting your
            privacy. This Privacy Policy explains what information we collect,
            how we use it, and your rights regarding your data when you use the
            ArbLance platform.
          </p>
          <p>
            As a decentralized platform, ArbLance is designed to minimize the
            personal data we collect. Many interactions occur directly on the
            blockchain and are governed by smart contracts rather than our
            servers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Data We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Wallet addresses:</strong> Your public wallet address is
              recorded when you connect to the Platform. This is used to
              identify your account and process transactions.
            </li>
            <li>
              <strong>Profile information:</strong> Any information you
              voluntarily provide, such as display name, bio, skills, and
              portfolio links.
            </li>
            <li>
              <strong>Transaction data:</strong> Records of jobs posted,
              applications submitted, payments made, and dispute outcomes. Much
              of this data is stored on-chain.
            </li>
            <li>
              <strong>Communication data:</strong> Messages exchanged through
              the Platform between clients and freelancers.
            </li>
            <li>
              <strong>Usage data:</strong> Anonymous analytics including pages
              visited, features used, browser type, and device information.
            </li>
            <li>
              <strong>Skill assessment data:</strong> Results from skill tests
              taken on the Platform.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-yellow-600" />
            Cookies and Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>ArbLance uses cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain your session and wallet connection state</li>
            <li>Remember your preferences and settings</li>
            <li>Collect anonymous usage analytics to improve the Platform</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
          <p>
            For more details, see our{" "}
            <a href="/cookies" className="text-blue-600 hover:underline">
              Cookie Policy
            </a>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Third-Party Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>We may share data with or use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Blockchain networks:</strong> Transaction data and smart
              contract interactions are recorded on the Arbitrum and Ethereum
              networks. On-chain data is public and immutable.
            </li>
            <li>
              <strong>IPFS:</strong> Profile data and job listings may be stored
              on the InterPlanetary File System for decentralized storage.
            </li>
            <li>
              <strong>Analytics providers:</strong> We use anonymous analytics
              tools to understand how users interact with the Platform.
            </li>
            <li>
              <strong>AI services:</strong> Skill assessments and job matching
              may utilize third-party AI models. Only non-identifying data is
              sent to these services.
            </li>
          </ul>
          <p>
            We do not sell your personal data to third parties.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Data Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Off-chain data (messages, preferences, analytics) is retained for
              as long as your account is active, plus 12 months after account
              deletion.
            </li>
            <li>
              On-chain data (transactions, skill badges, job records) is
              permanently stored on the blockchain and cannot be deleted by
              ArbLance or any party.
            </li>
            <li>
              You may request deletion of your off-chain data at any time by
              contacting us at{" "}
              <a
                href="mailto:privacy@arblance.io"
                className="text-blue-600 hover:underline"
              >
                privacy@arblance.io
              </a>.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your off-chain personal data</li>
            <li>Object to or restrict certain data processing</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent for optional data collection at any time</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a
              href="mailto:privacy@arblance.io"
              className="text-blue-600 hover:underline"
            >
              privacy@arblance.io
            </a>.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            This policy may be updated periodically. We will notify users of
            significant changes through the Platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
