import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Code2, Trophy, LogOut, Terminal } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Practice", href: "/tests", icon: Code2 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
              <Terminal size={18} strokeWidth={3} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              SkillProof<span className="text-primary">.ai</span>
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href} className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-gray-100"}
                    `}>
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="h-6 w-px bg-border hidden md:block" />

              <div className="flex items-center gap-3">
                <div className="text-sm text-right hidden sm:block">
                  <p className="font-medium text-foreground">{user.username}</p>
                  <p className="text-xs text-muted-foreground">Score: {user.score}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => logout()}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </div>
          )}
          
          {!user && (
            <div className="flex items-center gap-3">
               <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Login</Link>
               <Link href="/register">
                 <Button className="rounded-full px-6 shadow-lg shadow-primary/25">Get Started</Button>
               </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

      <footer className="border-t bg-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 SkillProof AI. Hackathon Prototype.</p>
        </div>
      </footer>
    </div>
  );
}
