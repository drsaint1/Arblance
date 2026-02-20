import React, { useState, useEffect } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillCategory, SkillCategoryNames } from "@/types";
import { Award, CheckCircle, Circle, ChevronLeft, ChevronRight, Trophy, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

type SkillTest = { questions: Array<{ q: string; options: string[]; correct: number }> };

const skillTests: Record<number, SkillTest> = {
  [SkillCategory.UIUXDesign]: {
    questions: [
      { q: "What does UX stand for?", options: ["User Experience", "User Execution", "Universal Export", "Unified Extension"], correct: 0 },
      { q: "Which tool is commonly used for UI design?", options: ["Figma", "Excel", "Notepad", "PowerPoint"], correct: 0 },
      { q: "What is a wireframe?", options: ["Low-fidelity design sketch", "High-quality render", "Database schema", "Code structure"], correct: 0 },
      { q: "What is the purpose of user personas?", options: ["Understand target users", "Create logos", "Write code", "Test servers"], correct: 0 },
      { q: "What does accessibility in design mean?", options: ["Design for all users including those with disabilities", "Fast loading", "Modern look", "Bright colors"], correct: 0 },
    ],
  },
  [SkillCategory.WebDevelopment]: {
    questions: [
      { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Module Language"], correct: 0 },
      { q: "Which CSS property controls text size?", options: ["text-size", "font-size", "text-style", "font-style"], correct: 1 },
      { q: "What is the correct way to declare a JavaScript variable?", options: ["var x", "variable x", "v x", "declare x"], correct: 0 },
      { q: "Which HTTP method is used to update data?", options: ["GET", "POST", "PUT", "DELETE"], correct: 2 },
      { q: "What is React primarily used for?", options: ["Building UIs", "Database Management", "Server Hosting", "Email Services"], correct: 0 },
    ],
  },
  [SkillCategory.MobileDevelopment]: {
    questions: [
      { q: "Which framework allows building cross-platform mobile apps with JavaScript?", options: ["React Native", "Django", "Laravel", "Spring Boot"], correct: 0 },
      { q: "What language is primarily used for iOS development?", options: ["Swift", "Java", "Python", "Ruby"], correct: 0 },
      { q: "What is the Android development IDE?", options: ["Android Studio", "Xcode", "Visual Studio", "Eclipse"], correct: 0 },
      { q: "What is Flutter written in?", options: ["Dart", "JavaScript", "Kotlin", "Swift"], correct: 0 },
      { q: "What does APK stand for?", options: ["Android Package Kit", "App Program Key", "Android Process Kernel", "Application Pack"], correct: 0 },
    ],
  },
  [SkillCategory.BlockchainDevelopment]: {
    questions: [
      { q: "What is a smart contract?", options: ["Self-executing contract on blockchain", "Legal document", "Database", "Cloud service"], correct: 0 },
      { q: "Which language is used for Ethereum smart contracts?", options: ["Solidity", "Python", "Java", "Ruby"], correct: 0 },
      { q: "What is gas in Ethereum?", options: ["Transaction fee unit", "Cryptocurrency", "Mining tool", "Wallet type"], correct: 0 },
      { q: "What is a blockchain?", options: ["Distributed ledger", "Centralized database", "Cloud storage", "File system"], correct: 0 },
      { q: "What is Web3?", options: ["Decentralized internet", "Website version 3", "Browser", "Email protocol"], correct: 0 },
    ],
  },
  [SkillCategory.DataScience]: {
    questions: [
      { q: "Which Python library is most used for data manipulation?", options: ["Pandas", "Flask", "Django", "Pygame"], correct: 0 },
      { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Logic", "Standard Question Language", "System Query Lookup"], correct: 0 },
      { q: "What is a common tool for data visualization?", options: ["Matplotlib", "Git", "Docker", "Nginx"], correct: 0 },
      { q: "What is machine learning?", options: ["Systems that learn from data", "Manual programming", "Hardware optimization", "Network security"], correct: 0 },
      { q: "What is regression analysis used for?", options: ["Predicting continuous values", "Sorting data", "Encrypting files", "Building websites"], correct: 0 },
    ],
  },
  [SkillCategory.DevOps]: {
    questions: [
      { q: "What is Docker used for?", options: ["Containerization", "Text editing", "Image editing", "Email management"], correct: 0 },
      { q: "What does CI/CD stand for?", options: ["Continuous Integration / Continuous Deployment", "Code Integration / Code Delivery", "Computer Interface / Computer Design", "Central Index / Central Data"], correct: 0 },
      { q: "Which tool is commonly used for infrastructure as code?", options: ["Terraform", "Photoshop", "Excel", "Word"], correct: 0 },
      { q: "What is Kubernetes used for?", options: ["Container orchestration", "Frontend development", "Database design", "Email hosting"], correct: 0 },
      { q: "What is the purpose of monitoring in DevOps?", options: ["Track system health and performance", "Write code", "Design UIs", "Create databases"], correct: 0 },
    ],
  },
  [SkillCategory.RustDevelopment]: {
    questions: [
      { q: "What is Rust primarily known for?", options: ["Memory safety", "Web development", "Game engines", "Mobile apps"], correct: 0 },
      { q: "What is ownership in Rust?", options: ["Memory management system", "Variable type", "Function call", "Loop structure"], correct: 0 },
      { q: "What is Cargo in Rust?", options: ["Package manager and build tool", "Compiler flag", "IDE plugin", "Web framework"], correct: 0 },
      { q: "What does the 'mut' keyword do in Rust?", options: ["Makes variable mutable", "Deletes variable", "Creates function", "Imports module"], correct: 0 },
      { q: "What is a crate in Rust?", options: ["Package or library", "Variable type", "Function signature", "Class definition"], correct: 0 },
    ],
  },
  [SkillCategory.SolidityDevelopment]: {
    questions: [
      { q: "What is Solidity primarily used for?", options: ["Writing Ethereum smart contracts", "Mobile app development", "Data analysis", "Game design"], correct: 0 },
      { q: "What is the EVM?", options: ["Ethereum Virtual Machine", "External Variable Module", "Encrypted Validation Method", "Event View Manager"], correct: 0 },
      { q: "What is a modifier in Solidity?", options: ["Function behavior modifier", "Variable type", "Import statement", "Loop keyword"], correct: 0 },
      { q: "What does 'payable' mean in Solidity?", options: ["Function can receive ETH", "Function costs gas", "Function is free", "Function is private"], correct: 0 },
      { q: "What is an ERC-20 token?", options: ["Fungible token standard", "NFT standard", "Wallet type", "Network protocol"], correct: 0 },
    ],
  },
  [SkillCategory.GraphicDesign]: {
    questions: [
      { q: "What does CMYK stand for?", options: ["Cyan Magenta Yellow Key", "Color Mode Yellow Key", "Creative Media Yellow Kit", "Cyan Mix Yellow Kilo"], correct: 0 },
      { q: "Which format supports transparency?", options: ["PNG", "JPEG", "BMP", "TIFF"], correct: 0 },
      { q: "What is the purpose of vector graphics?", options: ["Scalable images without quality loss", "Video editing", "Audio mixing", "3D modeling"], correct: 0 },
      { q: "Which Adobe tool is used for vector illustration?", options: ["Illustrator", "Premiere", "Audition", "After Effects"], correct: 0 },
      { q: "What is kerning in typography?", options: ["Space between letter pairs", "Font size", "Line height", "Text color"], correct: 0 },
    ],
  },
  [SkillCategory.ContentWriting]: {
    questions: [
      { q: "What is SEO in content writing?", options: ["Search Engine Optimization", "Social Email Outreach", "Simple Editing Online", "Standard Export Option"], correct: 0 },
      { q: "What is a CTA in copywriting?", options: ["Call to Action", "Content Text Area", "Creative Title Addition", "Central Theme Analysis"], correct: 0 },
      { q: "What is the ideal reading level for web content?", options: ["6th-8th grade level", "College level", "PhD level", "1st grade level"], correct: 0 },
      { q: "What is a content calendar?", options: ["Schedule for publishing content", "Design tool", "Analytics dashboard", "Email template"], correct: 0 },
      { q: "What is plagiarism?", options: ["Using others' work without credit", "Writing original content", "Editing grammar", "Publishing articles"], correct: 0 },
    ],
  },
  [SkillCategory.VideoEditing]: {
    questions: [
      { q: "Which software is industry standard for video editing?", options: ["Adobe Premiere Pro", "Microsoft Word", "Photoshop", "Excel"], correct: 0 },
      { q: "What is a keyframe in animation?", options: ["Defines start/end point of a transition", "Video resolution", "Audio format", "File type"], correct: 0 },
      { q: "What does FPS stand for?", options: ["Frames Per Second", "Files Per Session", "Format Per Segment", "Feature Processing Speed"], correct: 0 },
      { q: "What is color grading?", options: ["Adjusting color and tone of footage", "Adding text", "Recording audio", "Compressing files"], correct: 0 },
      { q: "What is a B-roll?", options: ["Supplementary footage", "Main interview footage", "Title screen", "End credits"], correct: 0 },
    ],
  },
  [SkillCategory.DigitalMarketing]: {
    questions: [
      { q: "What does PPC stand for?", options: ["Pay Per Click", "Post Per Channel", "Page Per Content", "Price Per Campaign"], correct: 0 },
      { q: "What is A/B testing?", options: ["Comparing two versions to see which performs better", "Alpha/Beta software testing", "Automated batch testing", "Annual budget testing"], correct: 0 },
      { q: "What is CTR in marketing?", options: ["Click-Through Rate", "Content Transfer Rate", "Campaign Tracking Report", "Customer Trust Rating"], correct: 0 },
      { q: "What is a conversion funnel?", options: ["Path users take toward a desired action", "Email template", "Social media post", "Ad creative"], correct: 0 },
      { q: "What is remarketing?", options: ["Targeting users who previously visited your site", "Starting a new campaign", "Creating a website", "Writing blog posts"], correct: 0 },
    ],
  },
  [SkillCategory.ProjectManagement]: {
    questions: [
      { q: "What is Agile methodology?", options: ["Iterative development with frequent feedback", "Waterfall process", "One-time delivery", "Manual testing only"], correct: 0 },
      { q: "What is a sprint in Scrum?", options: ["Time-boxed iteration of work", "Bug fix", "Code review", "Deployment step"], correct: 0 },
      { q: "What does a Gantt chart show?", options: ["Project schedule with task timelines", "Budget allocation", "Team hierarchy", "Code quality metrics"], correct: 0 },
      { q: "What is scope creep?", options: ["Uncontrolled expansion of project scope", "Reducing project size", "Team downsizing", "Budget cuts"], correct: 0 },
      { q: "What is a stakeholder?", options: ["Anyone with interest in the project outcome", "Only the project manager", "Only developers", "Only investors"], correct: 0 },
    ],
  },
  [SkillCategory.Other]: {
    questions: [
      { q: "What is version control used for?", options: ["Tracking changes in code", "Designing UIs", "Managing databases", "Sending emails"], correct: 0 },
      { q: "What is an API?", options: ["Application Programming Interface", "Automated Process Integration", "App Production Index", "Active Platform Instance"], correct: 0 },
      { q: "What is open source software?", options: ["Software with publicly available source code", "Paid software", "Encrypted software", "Hardware only"], correct: 0 },
      { q: "What is debugging?", options: ["Finding and fixing errors in code", "Writing documentation", "Deploying applications", "Designing interfaces"], correct: 0 },
      { q: "What is a repository?", options: ["Storage for code and version history", "Email inbox", "Chat room", "File converter"], correct: 0 },
    ],
  },
};

export default function SkillsPage() {
  const { skillBadgesContract, account } = useWeb3();
  const [selectedSkill, setSelectedSkill] = useState<SkillCategory | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [testComplete, setTestComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [minting, setMinting] = useState(false);
  const [userSkills, setUserSkills] = useState<Set<SkillCategory>>(new Set());
  const [direction, setDirection] = useState(0); // For animation direction

  useEffect(() => {
    loadUserSkills();
  }, [skillBadgesContract, account]);

  const loadUserSkills = async () => {
    if (!skillBadgesContract || !account) return;

    try {
      const provider = skillBadgesContract.runner?.provider;
      if (provider) {
        const code = await provider.getCode(await skillBadgesContract.getAddress());
        if (code === "0x" || code === "0x0") {
          console.warn("SkillBadges contract not deployed on current network");
          return;
        }
      }

      const skills = new Set<SkillCategory>();
      for (let i = 0; i <= 13; i++) {
        const hasSkill = await skillBadgesContract.userHasSkill(account, i);
        if (hasSkill) skills.add(i as SkillCategory);
      }
      setUserSkills(skills);
    } catch (error) {
      console.error("Error loading user skills:", error);
    }
  };

  const startTest = (skill: SkillCategory) => {
    setSelectedSkill(skill);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setTestComplete(false);
    setScore(0);
    setDirection(0);
  };

  const handleSelectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < 4) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] ?? null);
    } else {
      // Calculate score and complete test
      const test = skillTests[selectedSkill!];
      const correctCount = answers.filter(
        (ans, idx) => ans === test.questions[idx].correct
      ).length;
      const finalScore = (correctCount / 5) * 100;
      setScore(finalScore);
      setTestComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
    }
  };

  const mintBadge = async () => {
    if (!skillBadgesContract || !selectedSkill) return;

    try {
      setMinting(true);
      // In production, this should be called from a backend or the contract owner
      // For demo purposes, we're assuming the user can mint (this would fail without owner access)
      toast("Badge minting requires contract owner approval. In production, this would be handled by the platform.");

      // Simulated badge minting
      setUserSkills(new Set([...userSkills, selectedSkill]));
      setSelectedSkill(null);
    } catch (error: any) {
      console.error("Error minting badge:", error);
      toast.error(error.message || "Failed to mint badge");
    } finally {
      setMinting(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to take skill tests</p>
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
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Skill Tests
        </h1>
        <p className="text-gray-600">Earn NFT badges to verify your skills and unlock premium jobs</p>
      </motion.div>

      {selectedSkill === null ? (
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, staggerChildren: 0.1 }}
        >
          {Object.entries(SkillCategoryNames).map(([key, value], index) => {
            const skillKey = parseInt(key) as SkillCategory;
            const hasSkill = userSkills.has(skillKey);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`h-full transition-all duration-300 ${
                  hasSkill
                    ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50"
                    : "hover:border-blue-400 hover:shadow-lg"
                }`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Award className={`h-8 w-8 ${hasSkill ? "text-green-600" : "text-blue-500"}`} />
                      </motion.div>
                      {hasSkill && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle className="mt-4">{value}</CardTitle>
                    <CardDescription>
                      {hasSkill ? (
                        <span className="flex items-center text-green-600 font-medium">
                          <Trophy className="h-4 w-4 mr-1" />
                          Badge Earned
                        </span>
                      ) : (
                        "Take test to earn badge"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => startTest(skillKey)}
                      disabled={hasSkill}
                      className={`w-full ${
                        hasSkill
                          ? ""
                          : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                      }`}
                      variant={hasSkill ? "outline" : "default"}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      {hasSkill ? "Completed" : "Start Test"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="overflow-hidden border-2 border-blue-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{SkillCategoryNames[selectedSkill]} Test</CardTitle>
                  <CardDescription className="text-blue-100">
                    {testComplete
                      ? `Test Completed! Score: ${score}%`
                      : `Question ${currentQuestion + 1} of 5`}
                  </CardDescription>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Trophy className="h-10 w-10 text-yellow-300" />
                </motion.div>
              </div>

              {/* Progress Bar */}
              {!testComplete && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-blue-100 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(((currentQuestion + 1) / 5) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-blue-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-8">
              {!testComplete ? (
                <div className="space-y-6">
                  {/* Question Navigation Dots */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <motion.div
                        key={idx}
                        className={`h-2 rounded-full transition-all ${
                          idx === currentQuestion
                            ? "w-8 bg-blue-600"
                            : answers[idx] !== undefined
                            ? "w-2 bg-green-500"
                            : "w-2 bg-gray-300"
                        }`}
                        whileHover={{ scale: 1.2 }}
                      />
                    ))}
                  </div>

                  {/* Question */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {skillTests[selectedSkill].questions[currentQuestion].q}
                        </h3>
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-3">
                        {skillTests[selectedSkill].questions[currentQuestion].options.map(
                          (option, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                onClick={() => handleSelectAnswer(idx)}
                                variant={selectedAnswer === idx ? "default" : "outline"}
                                className={`w-full justify-start text-left h-auto py-4 px-6 transition-all ${
                                  selectedAnswer === idx
                                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-600 shadow-lg"
                                    : "hover:border-blue-400 hover:bg-blue-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedAnswer === idx
                                      ? "border-white bg-white"
                                      : "border-gray-400"
                                  }`}>
                                    {selectedAnswer === idx && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="h-3 w-3 rounded-full bg-blue-600"
                                      />
                                    )}
                                  </div>
                                  <span className="flex-1 text-base">{option}</span>
                                </div>
                              </Button>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="text-sm text-gray-600">
                      {answers.filter(a => a !== undefined).length} / 5 answered
                    </div>

                    <Button
                      onClick={handleNext}
                      disabled={selectedAnswer === null}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      {currentQuestion === 4 ? "Finish Test" : "Next"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-6 py-8"
                >
                  {/* Score Display */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="relative inline-block"
                  >
                    <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                      {score}%
                    </div>
                    <motion.div
                      className="absolute -top-4 -right-4"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {score >= 70 && <Trophy className="h-12 w-12 text-yellow-500" />}
                    </motion.div>
                  </motion.div>

                  {/* Result Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {score >= 70 ? (
                      <>
                        <p className="text-2xl font-semibold text-green-600 mb-2">
                          Congratulations! You passed! 🎉
                        </p>
                        <p className="text-gray-600">
                          You can now claim your NFT skill badge
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-semibold text-red-600 mb-2">
                          Almost there! Keep practicing 💪
                        </p>
                        <p className="text-gray-600">
                          You need 70% to pass. Don't give up!
                        </p>
                      </>
                    )}
                  </motion.div>

                  {/* Score Breakdown */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-50 p-4 rounded-lg inline-block"
                  >
                    <p className="text-sm text-gray-600">
                      Correct answers: <span className="font-bold text-green-600">{Math.round(score / 20)}</span> / 5
                    </p>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col gap-3 max-w-sm mx-auto pt-4"
                  >
                    {score >= 70 ? (
                      <Button
                        onClick={mintBadge}
                        disabled={minting}
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                      >
                        <Award className="h-5 w-5 mr-2" />
                        {minting ? "Minting Badge..." : "Claim Your Badge"}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => startTest(selectedSkill)}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                      >
                        <Target className="h-5 w-5 mr-2" />
                        Retake Test
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSkill(null)}
                      size="lg"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Back to Skills
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
