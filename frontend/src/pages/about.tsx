import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Globe, Zap, Shield, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          About ArbLance
        </h1>
        <p className="text-gray-600">
          Decentralized freelancing, powered by Arbitrum
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            ArbLance is on a mission to create a fair, transparent, and
            trustless freelancing marketplace. We believe that freelancers and
            clients deserve a platform where payments are guaranteed through
            smart contract escrow, skills are verifiably proven on-chain, and
            work history is permanently recorded and tamper-proof.
          </p>
          <p>
            Traditional freelancing platforms charge excessive fees, hold funds
            for weeks, and act as opaque intermediaries. ArbLance eliminates
            these pain points by leveraging blockchain technology to put power
            back in the hands of workers and hirers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Our Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            We envision a future where anyone in the world can find quality work
            and get paid instantly, without borders, banks, or gatekeepers. A
            future where your professional reputation is truly yours — portable,
            verifiable, and stored on-chain forever.
          </p>
          <p>
            ArbLance aims to become the go-to decentralized talent marketplace,
            connecting millions of skilled professionals with opportunities
            across the globe.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Why Decentralized Freelancing?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>No middleman fees:</strong> Smart contracts handle escrow
              directly, drastically reducing platform fees compared to
              traditional marketplaces.
            </li>
            <li>
              <strong>Instant payments:</strong> Funds are released from escrow
              the moment work is approved — no waiting days or weeks.
            </li>
            <li>
              <strong>Global access:</strong> Anyone with a wallet can
              participate, regardless of location or banking access.
            </li>
            <li>
              <strong>Transparent reputation:</strong> Ratings, completed jobs,
              and skill badges are recorded on-chain and cannot be manipulated.
            </li>
            <li>
              <strong>Censorship resistant:</strong> No single entity can
              de-platform you or freeze your earnings.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Why Arbitrum?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            ArbLance is built on Arbitrum, a leading Ethereum Layer 2 rollup,
            for several key reasons:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Low gas fees:</strong> Transactions cost a fraction of a
              cent, making micro-payments and frequent interactions feasible.
            </li>
            <li>
              <strong>Fast confirmations:</strong> Near-instant transaction
              finality means a smooth user experience.
            </li>
            <li>
              <strong>Ethereum security:</strong> Arbitrum inherits the full
              security guarantees of Ethereum mainnet.
            </li>
            <li>
              <strong>EVM compatibility:</strong> Full compatibility with
              Ethereum tooling and existing DeFi infrastructure.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Connect your wallet</strong> — Sign in with MetaMask or
              any Web3 wallet to create your profile.
            </li>
            <li>
              <strong>Post or find jobs</strong> — Clients post jobs with
              budgets; freelancers browse and apply.
            </li>
            <li>
              <strong>Escrow funding</strong> — When a freelancer is hired, the
              client deposits funds into a smart contract escrow.
            </li>
            <li>
              <strong>Complete work</strong> — Freelancers deliver work and
              submit for review.
            </li>
            <li>
              <strong>Release payment</strong> — The client approves the work
              and funds are instantly released to the freelancer.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            The Team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            ArbLance is built by a passionate team of blockchain engineers,
            product designers, and freelancing advocates who have experienced
            the shortcomings of traditional platforms firsthand. We are
            committed to building a fairer future of work.
          </p>
          <p>
            We are a globally distributed, remote-first team — and yes, some of
            us found each other on freelancing platforms. We are building the
            platform we wish had existed when we started.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Interested in joining us? Check out our{" "}
            <a href="/careers" className="text-blue-600 hover:underline">
              Careers
            </a>{" "}
            page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
