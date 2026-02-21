import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Code2, Cpu, Trophy, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-4xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Hackathon Ready
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]">
            Prove your coding skills with <span className="text-gradient">AI validation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Solve real-world Programmimg challenges, get instant AI feedback on code quality, and detect your learning gaps.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                Start Coding Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg border-2">
                Existing User
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-12"
        >
          <FeatureCard 
            icon={<Code2 className="w-8 h-8 text-primary" />}
            title="Real Challenges"
            description="Practice with production-level Python problems designed to test logic."
          />
          <FeatureCard 
            icon={<Cpu className="w-8 h-8 text-purple-600" />}
            title="AI Analysis"
            description="Get instant feedback on code correctness and authenticity scores."
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-orange-500" />}
            title="Compete"
            description="Climb the global leaderboard and showcase your true skill level."
          />
        </motion.div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:border-border transition-all duration-300 text-left">
      <div className="mb-4 w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
