import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useTest, useSubmitTest } from "@/hooks/use-tests";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, XCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme for code

export default function TestDetail() {
  const [match, params] = useRoute("/tests/:id");
  const testId = Number(params?.id);
  
  const { data: test, isLoading } = useTest(testId);
  const { mutate: submit, isPending, data: result } = useSubmitTest(testId);
  
  const [code, setCode] = useState("");
  
  // Set starter code once loaded
  if (test && code === "" && test.starterCode) {
    setCode(test.starterCode);
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!test) return <Layout><div>Test not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/tests" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Challenges
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
          {/* Left Panel: Description */}
          <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">{test.title}</h1>
              <div className="flex gap-2 mb-4">
                 <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">
                   {test.topic}
                 </span>
                 <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-medium">
                   {test.credits} Credits
                 </span>
              </div>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>{test.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <h3 className="font-bold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Expected Output</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
                {test.expectedOutput}
              </pre>
            </div>

            {/* Result Panel */}
            {result && (
              <div className={`p-5 rounded-xl border-l-4 shadow-sm animate-in slide-in-from-bottom-2 ${
                result.isPassed 
                  ? "bg-green-50 border-green-500 text-green-900" 
                  : "bg-red-50 border-red-500 text-red-900"
              }`}>
                <div className="flex items-center gap-2 mb-2 font-bold text-lg">
                  {result.isPassed ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  {result.isPassed ? "Test Passed!" : "Test Failed"}
                </div>
                <p className="mb-4 opacity-90">{result.message}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <span className="block font-semibold mb-1 opacity-70">Authenticity Score</span>
                    <span className="text-lg font-mono">{result.authenticityScore}%</span>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <span className="block font-semibold mb-1 opacity-70">Your Output</span>
                    <pre className="text-xs font-mono whitespace-pre-wrap">{result.output || "(no output)"}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Editor */}
          <div className="flex flex-col h-full bg-gray-900 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
            <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
              <span className="text-gray-400 text-xs font-mono">main.py</span>
              <span className="text-gray-500 text-xs">Python 3.10</span>
            </div>
            
            <div className="flex-1 relative overflow-auto font-mono text-sm">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => highlight(code, languages.python, "python")}
                padding={24}
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14,
                  minHeight: '100%',
                  color: '#e2e8f0' // slate-200
                }}
                className="min-h-full"
              />
            </div>

            <div className="p-4 bg-gray-800 border-t border-gray-700 flex justify-end">
              <Button 
                onClick={() => submit({ code })} 
                disabled={isPending}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg shadow-green-900/20"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" /> Run Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
