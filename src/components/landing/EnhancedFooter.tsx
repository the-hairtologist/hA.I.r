import { Scissors, Instagram, Facebook, Twitter, Youtube, Mail, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const EnhancedFooter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "SUBSCRIBED!",
        description: "We'll keep you updated!",
      });
      setEmail("");
    }
  };

  return (
    <footer className="border-t-4 border-black bg-primary" style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
      backgroundSize: '8px 8px'
    }}>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 border-4 border-black bg-secondary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Scissors className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="font-pixel text-xl text-primary-foreground uppercase">hA.I.r</span>
            </div>
            <p className="text-sm font-sans text-primary-foreground/80 leading-relaxed">
              Your hair, smarter. Your salon, effortless.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 border-4 border-black bg-accent hover:bg-accent/90 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 border-4 border-black bg-secondary hover:bg-secondary/90 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 border-4 border-black bg-accent hover:bg-accent/90 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 border-4 border-black bg-secondary hover:bg-secondary/90 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
              </a>
            </div>
            
            {/* App Badges */}
            <div className="flex flex-wrap gap-2 pt-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 border-4 border-black bg-accent flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </div>
              <div className="px-3 sm:px-4 h-11 sm:h-12 border-4 border-black bg-secondary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                <span className="font-pixel text-xs sm:text-sm text-secondary-foreground">iOS</span>
              </div>
              <div className="px-3 sm:px-4 h-11 sm:h-12 border-4 border-black bg-accent flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                <span className="font-pixel text-xs sm:text-sm text-accent-foreground">ANDROID</span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-pixel text-xs sm:text-sm uppercase mb-3 sm:mb-4 text-primary-foreground">PRODUCT</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground/90 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground/90 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  Demo
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground/90 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  Integrations
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-pixel text-xs sm:text-sm uppercase mb-3 sm:mb-4 text-primary-foreground">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground/90 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  About
                </button>
              </li>
              <li>
                <a href="mailto:support@hair-ai.com" className="font-sans text-sm text-primary-foreground/90 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  Contact
                </a>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="font-sans text-sm text-primary-foreground/90 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-pixel text-xs sm:text-sm uppercase mb-3 sm:mb-4 text-primary-foreground">UPDATES</h3>
            <p className="text-sm font-sans text-primary-foreground/80 mb-3 leading-relaxed">
              Get tips and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSignup} className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-11 sm:h-12 bg-white text-foreground text-sm"
                required
              />
              <Button 
                type="submit" 
                className="w-full font-pixel text-xs uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none h-11 sm:h-12"
              >
                <Mail className="h-4 w-4 mr-2" />
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t-4 border-black pt-4 sm:pt-6 mt-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Copyright */}
            <p className="font-pixel text-sm text-primary-foreground/80">© 2025 hA.I.r</p>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-sans">
              <button onClick={() => navigate("/dmca")} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                DMCA
              </button>
              <button onClick={() => navigate("/help")} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Help
              </button>
              <button onClick={() => navigate("/terms")} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms
              </button>
            </div>
          </div>
          
          {/* Legal Disclaimer */}
          <div className="border-t-2 border-black/20 pt-4 mt-4">
            <p className="text-xs font-sans text-primary-foreground/55 leading-relaxed text-center max-w-4xl mx-auto">
              <span className="font-semibold">Disclaimer:</span> Individual results may vary. AI recommendations are assistive tools only and not professional advice. Stylists are independent contractors responsible for maintaining their own professional liability insurance and state licenses.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
