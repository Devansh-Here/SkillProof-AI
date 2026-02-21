import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type SubmitCodeRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTests() {
  return useQuery({
    queryKey: [api.tests.list.path],
    queryFn: async () => {
      const res = await fetch(api.tests.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tests");
      return api.tests.list.responses[200].parse(await res.json());
    },
  });
}

export function useTest(id: number) {
  return useQuery({
    queryKey: [api.tests.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tests.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch test");
      return api.tests.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSubmitTest(id: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SubmitCodeRequest) => {
      const url = buildUrl(api.tests.submit.path, { id });
      const res = await fetch(url, {
        method: api.tests.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Submission failed");
      return api.tests.submit.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to update stats
      queryClient.invalidateQueries({ queryKey: [api.stats.dashboard.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.leaderboard.path] });
      
      if (data.isPassed) {
        toast({
          title: "🎉 Passed!",
          description: data.message,
          variant: "default",
          className: "bg-green-500 text-white border-none",
        });
      } else {
        toast({
          title: "❌ Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while submitting.",
        variant: "destructive",
      });
    },
  });
}
