import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Settings, Activity, Zap, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alert Log', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-sidebar/95 backdrop-blur-sm">
        <div className="flex items-center h-12 px-4 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative">
              <img
                src="/assets/generated/trade-trace-logo.dim_128x128.png"
                alt="Trade Trace"
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary hidden" />
              </div>
            </div>
            <span className="font-mono font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
              Trade<span className="text-primary">Trace</span>
            </span>
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-border" />

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = to === '/' ? currentPath === '/' : currentPath.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side status indicator */}
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-green" />
              LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-sidebar/50 py-3 px-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
          <span>© {new Date().getFullYear()} TradeTrace</span>
          <span className="flex items-center gap-1">
            Built with{' '}
            <span className="text-danger">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'trade-trace')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
