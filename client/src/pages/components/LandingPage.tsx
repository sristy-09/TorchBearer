import { ArrowRight, Moon, Sun, Flame } from "lucide-react";
import { Button } from "@/feature/core/components/ui/button";
import { useState } from "react";
import { Link } from "react-router";
import { useTheme } from "@/feature/core/context/themeProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/feature/core/components/ui/dropdown-menu";


const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "FAQ", href: "#faq" },
  {name: "Features", href: "#features"}
];

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const { setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>

      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 relative"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}>
            <Flame size={16} className="text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">TorchBearer</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <a key={link.name} href={link.href}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/login" className="cursor-pointer">
            <Button variant="ghost" size="sm" className="rounded-xl text-sm">Login</Button>
          </Link>

          <Link to="/signup" className="cursor-pointer">
            <Button size="sm" className="px-5 rounded-xl text-sm text-white font-semibold"
              style={{ background: "var(--primary)" }}>
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main id="about" className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28 gap-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }} />
        </div>

        {/* Badge */}
        <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{ border: "1px solid var(--border)", background: "var(--card)", color: "var(--muted-foreground)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "var(--primary)" }} />
          <span>Alumni Network Platform</span>
          <ArrowRight className="size-3.5" />
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl text-foreground">
          Connect Alumni and{" "}
          <span style={{ color: "var(--primary)" }}>Students</span>
        </h1>

        {/* Subheadline */}
        <p className="relative text-muted-foreground text-lg max-w-xl leading-relaxed">
          A platform for meaningful connections between graduates and current
          students.
          <br />
          Network, find mentorship, and explore career opportunities.
        </p>

        {/* CTA buttons */}
        <div className="relative flex items-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="px-8 rounded-xl text-white font-semibold shadow-sm"
              style={{ background: "var(--primary)" }}>
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="px-8 rounded-xl font-medium"
              style={{ borderColor: "var(--border)", background: "var(--card)" }}>
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section id = "features" className="px-6 py-20 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose TorchBearer?</h2>
            <p className="text-muted-foreground">
              Everything you need to build meaningful connections
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-pink-500 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Network Building</h3>
              <p className="text-sm text-muted-foreground">
                Connect with alumni and peers in your field of interest
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-pink-500 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Mentorship</h3>
              <p className="text-sm text-muted-foreground">
                Get guidance from experienced professionals in your career path
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-pink-500 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Career Growth</h3>
              <p className="text-sm text-muted-foreground">
                Discover opportunities and advance your professional journey
              </p>
            </div>
          </div>
        </div>
      </section>
<section
        id="faq"
        className="px-6 md:px-16 py-20 border-t border-border max-w-4xl mx-auto w-full"
      >
        <h2 className="text-3xl font-bold mb-3 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Everything you need to know about TorchBearer
        </p>
        <div className="space-y-2">
          {[
            {
              q: "What is TorchBearer?",
              a: "TorchBearer is a platform that connects alumni with current students for networking, mentorship, and career development.",
            },
            {
              q: "How to join spaces?",
              a: "You can join your interested space by requesting to the admin.",
            },
            {
              q: "What can I do after entering a space?",
              a: "You can view members of the specific spaces, write posts, comment to the posts or reply to he comments, like the posts.",
            },
          ].map((item, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full text-left font-medium cursor-pointer px-6 py-4 hover:bg-accent/50 transition-colors flex items-center justify-between"
              >
                <span>{item.q}</span>
                <ArrowRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${openFAQ === i ? "rotate-90" : ""
                    }`}
                />
              </button>
              {openFAQ === i && (
                <div className="px-6 pb-4 text-muted-foreground">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-16 py-10 text-sm text-muted-foreground"
        style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)" }}>
              <Flame size={14} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground">TorchBearer</h3>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
