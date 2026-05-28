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
  { name: "Features", href: "#features" },
];

export default function LandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const { setTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Navbar */}
      <header
        className="flex items-center justify-between px-8 py-5 relative"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
            }}
          >
            <Flame size={16} className="text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            TorchBearer
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
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

          <Link to="/login">
            <Button variant="ghost" size="sm" className="rounded-xl text-sm">
              Login
            </Button>
          </Link>

          <Link to="/signup">
            <Button
              size="sm"
              className="px-5 rounded-xl text-sm text-white font-semibold"
              style={{ background: "var(--primary)" }}
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main
        id="about"
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28 gap-8 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-600px h-600px rounded-full opacity-[0.06]"
            style={{
              background:
                "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Badge */}
        <div
          className="relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--muted-foreground)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--primary)" }}
          />
          <span>Alumni Network Platform</span>
          <ArrowRight className="size-3.5" />
        </div>

        {/* Headline */}
        <h1 className="relative text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
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

        {/* CTA */}
        <div className="relative flex items-center gap-3">
          <Link to="/signup">
            <Button
              size="lg"
              className="px-8 rounded-xl text-white font-semibold"
              style={{ background: "var(--primary)" }}
            >
              Get Started
            </Button>
          </Link>

          <Link to="/login">
            <Button size="lg" variant="outline" className="px-8 rounded-xl">
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-accent/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Why Choose TorchBearer?
            </h2>
            <p className="text-muted-foreground">
              Everything you need to build meaningful connections
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-pink-500 mx-auto mb-4 flex items-center justify-center text-white">
                👥
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Network Building
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect with alumni and peers in your field of interest
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-linera-to-br from-primary to-pink-500 mx-auto mb-4 flex items-center justify-center text-white">
                📚
              </div>
              <h3 className="font-semibold text-lg mb-2">Mentorship</h3>
              <p className="text-sm text-muted-foreground">
                Get guidance from experienced professionals in your career path
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary to-pink-500 mx-auto mb-4 flex items-center justify-center text-white">
                🚀
              </div>
              <h3 className="font-semibold text-lg mb-2">Career Growth</h3>
              <p className="text-sm text-muted-foreground">
                Discover opportunities and advance your professional journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
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
              a: "You can view members, write posts, comment, reply, and like posts.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setOpenFAQ(openFAQ === i ? null : i)
                }
                className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-accent/50"
              >
                <span className="font-medium">{item.q}</span>
                <ArrowRight
                  className={`h-4 w-4 transition-transform ${
                    openFAQ === i ? "rotate-90" : ""
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
      <footer
        className="px-6 md:px-16 py-10 text-sm text-muted-foreground"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)",
              }}
            >
              <Flame size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">TorchBearer</span>
          </div>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}