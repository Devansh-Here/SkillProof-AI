import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-display font-bold text-gray-900">404 Page Not Found</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full shadow-lg">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
