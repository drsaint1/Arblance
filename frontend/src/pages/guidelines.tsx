import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, AlertTriangle, CheckCircle, Ban, MessageSquare } from "lucide-react";

export default function GuidelinesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Community Guidelines
        </h1>
        <p className="text-gray-600">
          Our standards for a safe, fair, and professional freelancing community
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            General Conduct
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>All users of ArbLance are expected to maintain professional and respectful behavior. Our platform is built on trust and transparency.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Treat all users with respect and professionalism</li>
            <li>Communicate clearly and respond to messages promptly</li>
            <li>Provide accurate information in your profile and job listings</li>
            <li>Honor your commitments and deadlines</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            For Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>Write clear and detailed job descriptions with realistic budgets</li>
            <li>Provide timely feedback and approvals</li>
            <li>Release escrow payments promptly upon satisfactory completion</li>
            <li>Rate freelancers fairly and constructively</li>
            <li>Do not request work outside the agreed scope without adjusting compensation</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            For Freelancers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>Only apply for jobs that match your skills and availability</li>
            <li>Deliver quality work that meets the agreed requirements</li>
            <li>Communicate proactively about progress and any blockers</li>
            <li>Meet deadlines or notify clients well in advance of delays</li>
            <li>Do not misrepresent your skills or experience</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Dispute Resolution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>If a disagreement arises between a client and freelancer:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Attempt to resolve the issue through direct communication first</li>
            <li>If unresolved, either party may open a formal dispute</li>
            <li>Provide clear evidence to support your position</li>
            <li>Respect the platform admin's resolution decision</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            Prohibited Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>Fraud, scams, or misrepresentation of any kind</li>
            <li>Harassment, discrimination, or abusive language</li>
            <li>Sharing another user's private information</li>
            <li>Attempting to circumvent the escrow payment system</li>
            <li>Creating fake accounts or manipulating ratings</li>
            <li>Posting illegal, harmful, or inappropriate content</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Reporting Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            If you encounter behavior that violates these guidelines, please report it through the dispute system or contact our admin team. We take all reports seriously and will investigate promptly.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            These guidelines may be updated from time to time. Continued use of the platform constitutes acceptance of the current guidelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
