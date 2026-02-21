import { useTests } from "@/hooks/use-tests";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, Terminal, ChevronRight, Award } from "lucide-react";

export default function TestList() {
  const { data: tests, isLoading } = useTests();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">Practice Problems</h1>
          <p className="text-muted-foreground">Select a challenge to improve your Python skills</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tests?.map((test) => (
              <div 
                key={test.id}
                className="group bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <Terminal size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{test.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {test.topic}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 flex items-center gap-1">
                        <Award size={12} /> {test.credits} credits
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/tests/${test.id}`}>
                  <Button className="w-full sm:w-auto rounded-full group-hover:shadow-lg group-hover:shadow-primary/20">
                    Solve Challenge <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
            
            {tests?.length === 0 && (
              <div className="text-center p-12 text-muted-foreground bg-gray-50 rounded-2xl border border-dashed">
                No tests available right now.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
