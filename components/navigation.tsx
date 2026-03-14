"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  BookOpen, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Sparkles,
  Menu,
  X,
  Github,
  Compass
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/prompts", label: "Prompts", icon: MessageSquare },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/patterns", label: "Patterns", icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
              <Bot className="h-5 w-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold gradient-text">The Hub</span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">AI Agent Knowledge</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Search className="h-4 w-4 text-purple-400" />
              <span className="text-sm">Search</span>
            </Link>
            
            <Link
              href="https://github.com"
              target="_blank"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <Github className="h-4 w-4" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
