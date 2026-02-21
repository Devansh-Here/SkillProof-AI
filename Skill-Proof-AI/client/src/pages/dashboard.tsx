import { useDashboard } from "@/hooks/use-stats";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, ArrowRight, Zap, Target, TrendingUp, AlertTriangle } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and learning gaps</p>
          </div>
          <Link href="/tests">
            <Button className="rounded-full shadow-lg shadow-primary/25">
              Start New Test <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Score" 
            value={stats.score} 
            icon={<Zap className="w-5 h-5 text-yellow-500" />}
            color="bg-yellow-500/10 text-yellow-600"
          />
          <StatCard 
            title="Tests Completed" 
            value={stats.recentSubmissions.filter(s => s.isPassed).length} 
            icon={<Target className="w-5 h-5 text-green-500" />}
            color="bg-green-500/10 text-green-600"
          />
          <StatCard 
            title="Accuracy" 
            value={`${Math.round((stats.recentSubmissions.filter(s => s.isPassed).length / (stats.recentSubmissions.length || 1)) * 100)}%`} 
            icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
            color="bg-blue-500/10 text-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Gaps Chart */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Gap Analysis
            </h2>
            <div className="h-[300px] w-full">
              {stats.gaps.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.gaps} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="topic" 
                      type="category" 
                      tick={{ fontSize: 12 }} 
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="weaknessPercentage" radius={[0, 4, 4, 0]} name="Weakness %" barSize={32}>
                      {stats.gaps.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.weaknessPercentage > 50 ? '#ef4444' : '#f97316'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                  <p>Not enough data to analyze gaps.</p>
                  <p>Complete more tests!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col">
            <h2 className="text-xl font-display font-bold mb-6">Recent Activity</h2>
            <div className="flex-1 overflow-auto space-y-4">
              {stats.recentSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No submissions yet.</p>
              ) : (
                stats.recentSubmissions.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${sub.isPassed ? "bg-green-500" : "bg-red-500"}`} />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">Test ID #{sub.testId}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      sub.isPassed 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {sub.isPassed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold font-display">{value}</p>
      </div>
    </div>
  );
}
