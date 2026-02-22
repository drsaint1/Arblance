import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Job, SkillCategoryNames, JobStatusNames, BadgeTierNames } from "@/types";
import { formatEther, formatDate, formatTokenAmount, getTokenSymbol } from "@/lib/utils";
import { Briefcase, DollarSign, Calendar, Search, ArrowRight, Eye, Award } from "lucide-react";

export default function JobsPage() {
  const { marketplaceContract, account } = useWeb3();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadJobs();
  }, [marketplaceContract]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const loadJobs = async () => {
    if (!marketplaceContract) return;

    try {
      setLoading(true);
      // Check if contract is deployed before calling
      const provider = marketplaceContract.runner?.provider;
      if (provider) {
        const code = await provider.getCode(await marketplaceContract.getAddress());
        if (code === "0x" || code === "0x0") {
          console.warn("Marketplace contract not deployed on current network");
          setLoading(false);
          return;
        }
      }
      const openJobs = await marketplaceContract.getOpenJobs();
      setJobs(openJobs);
      setFilteredJobs(openJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };


  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to browse jobs</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">Browse Jobs</h1>
        <p className="text-gray-600">Find your next opportunity</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Jobs List */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Briefcase className="h-12 w-12 text-blue-600" />
          </motion.div>
          <p className="text-gray-600 mt-4">Loading jobs...</p>
        </motion.div>
      ) : filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No jobs found</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid gap-6"
        >
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/jobs/${job.id}`}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="cursor-pointer"
                >
                  <Card className="hover:shadow-xl transition-shadow border-l-4 border-l-blue-600">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-2xl hover:text-blue-600 transition-colors">{job.title}</CardTitle>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary">
                              {SkillCategoryNames[job.requiredSkill]}
                            </Badge>
                            <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-900 border-amber-300">
                              <Award className="h-3 w-3 mr-1" />
                              {BadgeTierNames[job.minimumTier]}+ Required
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-700">
                              {JobStatusNames[job.status]}
                            </Badge>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="text-right"
                        >
                          <div className="flex items-center text-2xl font-bold text-blue-600">
                            <DollarSign className="h-6 w-6" />
                            {formatTokenAmount(job.budget, job.paymentToken)} {getTokenSymbol(job.paymentToken)}
                          </div>
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {formatDate(Number(job.deadline))}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Job ID: {job.id.toString()}</span>
                      <motion.div whileHover={{ x: 5 }}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
