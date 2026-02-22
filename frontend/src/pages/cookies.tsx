import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, BarChart3, Settings, Info } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Cookie Policy
        </h1>
        <p className="text-gray-600">
          Last updated: February 1, 2026
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            What Are Cookies?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            Cookies are small text files that are stored on your device when you
            visit a website. They are widely used to make websites work
            efficiently, provide a better user experience, and give site owners
            useful information about how their site is being used.
          </p>
          <p>
            ArbLance uses cookies and similar technologies (such as local
            storage) to operate the Platform, remember your preferences, and
            improve our services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Essential Cookies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            These cookies are required for the Platform to function and cannot
            be disabled.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Wallet connection state:</strong> Remembers whether you
              have connected your Web3 wallet and maintains your session.
            </li>
            <li>
              <strong>Authentication tokens:</strong> Keeps you signed in as you
              navigate between pages.
            </li>
            <li>
              <strong>Security cookies:</strong> Help detect and prevent
              fraudulent activity and protect your account.
            </li>
            <li>
              <strong>Network preferences:</strong> Stores your selected
              blockchain network (e.g., Arbitrum One, Arbitrum Sepolia).
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-yellow-600" />
            Functional Cookies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            These cookies enhance your experience by remembering choices you
            make.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Theme preferences:</strong> Remembers your display
              settings such as light or dark mode.
            </li>
            <li>
              <strong>Language settings:</strong> Stores your preferred language
              if applicable.
            </li>
            <li>
              <strong>Form data:</strong> Temporarily saves form inputs so you
              do not lose progress if you navigate away accidentally.
            </li>
            <li>
              <strong>Notification preferences:</strong> Remembers which
              notifications you have enabled or dismissed.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Analytics Cookies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            These cookies help us understand how visitors use the Platform so
            we can improve it.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Page views:</strong> Tracks which pages are visited most
              frequently.
            </li>
            <li>
              <strong>Feature usage:</strong> Helps us understand which features
              are popular and which need improvement.
            </li>
            <li>
              <strong>Performance metrics:</strong> Measures page load times and
              error rates to ensure a smooth experience.
            </li>
            <li>
              <strong>Traffic sources:</strong> Shows how users found ArbLance
              (e.g., search engines, social media, direct visits).
            </li>
          </ul>
          <p>
            All analytics data is collected anonymously and cannot be used to
            identify individual users.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-600" />
            Managing Your Cookies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p>
            You can control and manage cookies in several ways:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Browser settings:</strong> Most browsers allow you to
              block or delete cookies through their settings menu. Note that
              blocking essential cookies may prevent the Platform from
              functioning correctly.
            </li>
            <li>
              <strong>Clearing cookies:</strong> You can clear all cookies at
              any time through your browser. This will sign you out and reset
              your preferences.
            </li>
            <li>
              <strong>Private browsing:</strong> Using incognito or private
              browsing mode will prevent cookies from being stored after your
              session ends.
            </li>
            <li>
              <strong>Third-party opt-outs:</strong> For analytics cookies, you
              can opt out through the respective analytics provider's opt-out
              mechanism.
            </li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            If you have questions about our use of cookies, contact us at{" "}
            <a
              href="mailto:privacy@arblance.io"
              className="text-blue-600 hover:underline"
            >
              privacy@arblance.io
            </a>. For more details on how we handle your data, see our{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
