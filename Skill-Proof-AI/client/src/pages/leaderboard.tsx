import { useLeaderboard } from "@/hooks/use-stats";
import { Layout } from "@/components/layout";
import { Loader2, Medal, Trophy } from "lucide-react";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useLeaderboard();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-100 text-yellow-600 mb-4 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Top developers ranked by skill points</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-7">User</div>
              <div className="col-span-3 text-right">Score</div>
            </div>
            
            <div className="divide-y divide-border/50">
              {leaderboard?.map((entry, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${
                    index < 3 ? "bg-gradient-to-r from-yellow-50/30 to-transparent" : ""
                  }`}
                >
                  <div className="col-span-2 flex justify-center">
                    {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                    {index === 2 && <Medal className="w-6 h-6 text-orange-400" />}
                    {index > 2 && <span className="text-muted-foreground font-mono font-bold text-lg">#{index + 1}</span>}
                  </div>
                  <div className="col-span-7 font-medium text-lg truncate">
                    {entry.username}
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-primary">
                    {entry.score} pts
                  </div>
                </div>
              ))}
              
              {leaderboard?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No data yet. Be the first to join!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
