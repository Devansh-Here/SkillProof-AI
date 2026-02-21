import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useDashboard() {
  return useQuery({
    queryKey: [api.stats.dashboard.path],
    queryFn: async () => {
      const res = await fetch(api.stats.dashboard.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.stats.dashboard.responses[200].parse(await res.json());
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: [api.stats.leaderboard.path],
    queryFn: async () => {
      const res = await fetch(api.stats.leaderboard.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return api.stats.leaderboard.responses[200].parse(await res.json());
    },
  });
}
