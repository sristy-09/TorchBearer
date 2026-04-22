import { ArrowRight, Moon, Sun } from "lucide-react";
import { Button } from "@/feature/core/components/ui/button";
import { useState,useEffect } from "react";


const NAV_LINKS = [ {name: "About", href: "#about"},{name:"FAQ", href:"#faq"}];

export default function LandingPage() {
    const [dark, setDark] = useState(()=>{
        if(typeof window !== "undefined") {
            return localStorage.getItem("theme") === "dark"
        }
        return false;
    })
    const [openFAQ, setOpenFAQ] = useState<number | null>(null)

    //dark mode
    useEffect(() =>{
        if(dark) {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else{
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme","light")
        }
    }, [dark])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">TorchBearer</span>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
            <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-md border border-border">
                {dark? <Sun size={16}/> : <Moon size={16} />}
            </button>

          <Button variant="ghost" size="sm">
            Login
          </Button>
          <Button size="sm" className="px-4">
            Sign Up
          </Button>
        </div>   
      </header>

      {/* Hero */}
      <main 
      id="about"
      className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-8">
        {/* Badge */}
        <div className="flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground">
          <span> Connect With Your Alumni</span>
          <ArrowRight className="size-3.5" />
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
          Digital platform to connect Alumni and Current Students Together.
        </h1>

        {/* Subheadline */}
        <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
          A platform where the communication between graduates and students can take place efficiently.
          <br />
          TorchBearer, leading to networking, mentorship and career-development.
        </p>
      </main>
      {/*Faq section */}
      <section 
      id ="faq"
      className="px-6 md:px-16 py-20 border-t border-border max-w-4xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-8 text-center">FAQs</h2>
        {[
            {
                q: "What is TorchBearer?",
                a: "TorchBearer is a digital platform that helps to connect Alumni(Graduate Students) and present students in any institution."
            },
            {
                q: "Is it free or premium?",
                a: "It is free to enter in the first three spaces but if you want to enter more than 3 spaces, you have to pay some fee."
            },
            {
                q: "Can I filter topics or spaces by interests or skills?",
                a: "Yes, you can filter out the topics or spaces according to ypur skills pr interests."
            },
        ].map((item, i)=>(
            <div key={i} className="border-b py-4">
                <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full text-left font-medium">
                    {item.q}
                </button>
                {openFAQ === i && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {item.a}
                    </p>
                )}
            </div>
        ))}
      </section>

      {/*footer*/}
      <footer className="border-t border-border px-6 md:px-16 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>
                <h3 className="font-semibold text-foreground mb-2">
                TorchBearer
                </h3>
                <p> {new Date().getFullYear()} All Rights reserved.</p>
            </div>
            
            <div className="flex gap-8">
                <div className="flex flex-col gap-2">
                    <span className="font-medium text-foreground"> Product </span>
                    <a href="#">Features</a>
                    <a href="#">Pricing</a>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="font-medium text-foreground">Legal</span>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                </div>
            </div>

        </div>
      </footer>
    </div>
  );
}
