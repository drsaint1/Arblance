import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UserCheck, Wallet, Scale, ShieldAlert, AlertTriangle, BookOpen } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-gray-600">
          Last updated: February 1, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Acceptance of Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            By accessing or using ArbLance ("the Platform"), you agree to be
            bound by these Terms of Service. If you do not agree to these terms,
            you may not use the Platform. These terms apply to all users,
            including freelancers, clients, and visitors.
          </p>
          <p>
            ArbLance reserves the right to update these terms at any time.
            Continued use of the Platform after changes constitutes acceptance
            of the revised terms.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Account Creation and Eligibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You must be at least 18 years old to use the Platform.
            </li>
            <li>
              Account creation requires connecting a compatible Web3 wallet
              (e.g., MetaMask). You are solely responsible for the security of
              your wallet and private keys.
            </li>
            <li>
              You agree to provide accurate and complete information in your
              profile. Misrepresentation of skills, experience, or identity is
              prohibited.
            </li>
            <li>
              Each individual may maintain only one account. Duplicate accounts
              may be suspended or terminated.
            </li>
            <li>
              ArbLance may suspend or terminate accounts that violate these
              terms or our Community Guidelines.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-600" />
            Payments and Escrow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              All payments on the Platform are facilitated through smart
              contract escrow on the Arbitrum network.
            </li>
            <li>
              When a client hires a freelancer, the agreed payment amount is
              deposited into the escrow smart contract. Funds remain locked
              until the client approves the delivered work.
            </li>
            <li>
              Upon approval, funds are released directly to the freelancer's
              wallet. ArbLance may deduct a platform service fee from each
              transaction.
            </li>
            <li>
              You are responsible for any gas fees incurred during transactions
              on the Arbitrum network.
            </li>
            <li>
              ArbLance does not hold custody of user funds. All escrow
              operations are governed by audited smart contracts.
            </li>
            <li>
              Payments are made in supported tokens (e.g., USDC, ETH). Exchange
              rate fluctuations are the responsibility of the user.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-600" />
            Disputes and Resolution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              If a client or freelancer is dissatisfied with the outcome of a
              job, either party may initiate a dispute through the Platform.
            </li>
            <li>
              Disputes are reviewed by platform administrators who will examine
              submitted evidence, communication records, and deliverables.
            </li>
            <li>
              The administrator's resolution decision is final. Escrowed funds
              will be distributed according to the resolution outcome.
            </li>
            <li>
              Both parties agree to participate in the dispute process in good
              faith and to provide truthful information.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Intellectual Property
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Unless otherwise agreed in writing, intellectual property rights
              to work delivered by a freelancer transfer to the client upon full
              payment.
            </li>
            <li>
              Freelancers retain the right to display completed work in their
              portfolio unless the client requests confidentiality.
            </li>
            <li>
              Users must not upload, post, or submit content that infringes on
              the intellectual property rights of any third party.
            </li>
            <li>
              ArbLance does not claim ownership over any content created by
              users on the Platform.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Limitation of Liability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              ArbLance is provided "as is" without warranties of any kind,
              express or implied. We do not guarantee uninterrupted access,
              error-free operation, or specific outcomes.
            </li>
            <li>
              ArbLance is not responsible for losses resulting from smart
              contract vulnerabilities, network outages, wallet compromises, or
              third-party service failures.
            </li>
            <li>
              Users acknowledge the inherent risks of blockchain transactions,
              including but not limited to gas fee fluctuations, token
              volatility, and network congestion.
            </li>
            <li>
              ArbLance's total liability shall not exceed the amount of platform
              fees collected from the user in the twelve months preceding the
              claim.
            </li>
            <li>
              ArbLance acts as a marketplace facilitator and is not a party to
              agreements between clients and freelancers.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Prohibited Conduct
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>Users agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Platform for any unlawful purpose</li>
            <li>Attempt to circumvent the escrow payment system</li>
            <li>Create fake accounts or manipulate ratings and reviews</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Introduce malware, viruses, or other harmful code</li>
            <li>Scrape, crawl, or use automated tools to access the Platform without permission</li>
            <li>Impersonate another person or entity</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            For the full list of community standards, see our{" "}
            <a href="/guidelines" className="text-blue-600 hover:underline">
              Community Guidelines
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
