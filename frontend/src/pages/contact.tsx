import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, HelpCircle, Twitter, Github } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:enrichaintl@gmail.com?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-gray-600">
          Have a question or need help? We'd love to hear from you.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Send Us a Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <Input
                name="subject"
                placeholder="What is this about?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <Textarea
                name="message"
                placeholder="Tell us how we can help..."
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <p>For general inquiries and support:</p>
            <a
              href="mailto:enrichaintl@gmail.com"
              className="text-blue-600 hover:underline font-medium"
            >
              enrichaintl@gmail.com
            </a>
            <p className="text-sm text-gray-500">
              We typically respond within 24 hours.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-400" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            <ul className="space-y-2">
              <li>
                <a
                  href="https://twitter.com/deaneries_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4" /> @deaneries_ on Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/drsaint1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> drsaint1 on GitHub
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-purple-600" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <div>
            <p className="font-medium">How do I create an account?</p>
            <p className="text-sm text-gray-600">
              Simply connect your Web3 wallet (e.g., MetaMask) and you are ready
              to go. No email registration required.
            </p>
          </div>
          <div>
            <p className="font-medium">How does payment work?</p>
            <p className="text-sm text-gray-600">
              Clients deposit funds into a smart contract escrow when hiring.
              Funds are released to the freelancer once the client approves the
              delivered work.
            </p>
          </div>
          <div>
            <p className="font-medium">What if there is a payment dispute?</p>
            <p className="text-sm text-gray-600">
              Either party can open a dispute through the platform. An admin
              will review the evidence and make a resolution. See our{" "}
              <a href="/guidelines" className="text-blue-600 hover:underline">
                Community Guidelines
              </a>{" "}
              for more details.
            </p>
          </div>
          <div>
            <p className="font-medium">What are skill badges?</p>
            <p className="text-sm text-gray-600">
              Skill badges are on-chain NFTs that verify your expertise. You
              earn them by passing AI-powered skill assessments on the platform.
            </p>
          </div>
          <div>
            <p className="font-medium">Is ArbLance free to use?</p>
            <p className="text-sm text-gray-600">
              Creating an account and browsing jobs is free. A small platform
              fee is applied to completed transactions to support development
              and maintenance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
