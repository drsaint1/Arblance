import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Shield, Zap, Users, ArrowRight, Briefcase } from "lucide-react";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const features = [
  {
    icon: Shield,
    title: "Secure Escrow",
    description: "Smart contract-based escrow ensures safe payments for both clients and freelancers",
    color: "text-blue-600",
    borderColor: "border-t-blue-600",
  },
  {
    icon: Award,
    title: "NFT Badges",
    description: "Earn verifiable skill badges and reputation through blockchain-based credentials",
    color: "text-blue-500",
    borderColor: "border-t-blue-500",
  },
  {
    icon: Zap,
    title: "0% Platform Fees 🎉",
    description: "Launch promotion: Zero platform fees! Keep 100% of your earnings with direct peer-to-peer transactions",
    color: "text-blue-400",
    borderColor: "border-t-blue-400",
  },
  {
    icon: Users,
    title: "Verified Skills",
    description: "Take skill tests to earn badges that prove your expertise to potential clients",
    color: "text-blue-700",
    borderColor: "border-t-blue-700",
  },
];

export default function Home() {
  const { account, connectWallet } = useWeb3();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl font-bold text-blue-600"
          >
            Decentralized Freelancing Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl text-gray-600"
          >
            Connect, collaborate, and get paid securely with blockchain technology
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            {!account ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={connectWallet}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
                >
                  Connect Wallet to Get Started
                </Button>
              </motion.div>
            ) : (
              <>
                <Link href="/jobs">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="text-lg px-8">
                      Browse Jobs <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/post-job">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Post a Job
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Live Activity Feed */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <LiveActivityFeed />
      </motion.section>

      {/* Features */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div key={index} variants={itemVariants}>
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card className={`border-t-4 ${feature.borderColor} h-full hover:shadow-lg transition-shadow`}>
                  <CardHeader>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                    >
                      <Icon className={`h-12 w-12 ${feature.color} mb-2`} />
                    </motion.div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-12"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center mb-12"
        >
          How It Works
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            {
              step: 1,
              title: "Connect Wallet",
              description: "Connect your EVM wallet (MetaMask, etc.) to create your account instantly",
            },
            {
              step: 2,
              title: "Earn Skill Badges",
              description: "Take skill tests to earn NFT badges that verify your expertise",
            },
            {
              step: 3,
              title: "Get Hired",
              description: "Apply for jobs, complete work, and receive secure payments via escrow",
            },
          ].map((item) => (
            <motion.div
              key={item.step}
              variants={itemVariants}
              className="text-center space-y-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto cursor-pointer"
              >
                <span className="text-2xl font-bold text-blue-600">{item.step}</span>
              </motion.div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      {!account && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-blue-600 rounded-2xl p-12 text-center text-white"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4"
          >
            Ready to Get Started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl mb-8 opacity-90"
          >
            Join the future of freelancing with blockchain technology
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={connectWallet}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8"
            >
              Connect Your Wallet
            </Button>
          </motion.div>
        </motion.section>
      )}
    </div>
  );
}
