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
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 border-4 border-black bg-secondary flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Scissors className="h-6 w-6 text-secondary-foreground" />
              </div>
              <span className="font-pixel text-xl text-primary-foreground uppercase">hA.I.r</span>
            </div>
            <p className="text-sm font-sans text-primary-foreground leading-relaxed">
              Your hair, smarter. Your salon, effortless.
            </p>
            <div className="flex gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border-4 border-black bg-accent hover:bg-accent/80 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-accent-foreground" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border-4 border-black bg-accent hover:bg-accent/80 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-accent-foreground" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border-4 border-black bg-accent hover:bg-accent/80 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-accent-foreground" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 border-4 border-black bg-accent hover:bg-accent/80 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5 text-accent-foreground" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-pixel text-sm uppercase mb-4 text-accent">PRODUCT</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground hover:text-primary-foreground/70 transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground hover:text-primary-foreground/70 transition-colors">
                  Demo
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground hover:text-primary-foreground/70 transition-colors">
                  Integrations
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-pixel text-sm uppercase mb-4 text-accent">COMPANY</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-sm text-primary-foreground hover:text-primary-foreground/70 transition-colors">
                  About
                </button>
              </li>
              <li>
                <a href="mailto:support@hair-ai.com" className="font-sans text-sm text-primary-foreground hover:text-primary-foreground/70 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="font-sans text-sm text-primary-foreground hover:text-primary-foreground/70 transition-colors">
                  Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-pixel text-sm uppercase mb-4 text-accent">UPDATES</h3>
            <p className="text-sm font-sans text-primary-foreground mb-3 leading-relaxed">
              Get tips and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSignup} className="space-y-2.5">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-12 bg-white text-foreground"
                required
              />
              <Button 
                type="submit" 
                className="w-full font-pixel text-sm uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-none h-12"
              >
                <Mail className="h-4 w-4 mr-2" />
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>

        {/* Available On Section */}
        <div className="mb-8">
          <h3 className="font-pixel text-sm uppercase mb-4 text-primary-foreground">AVAILABLE ON</h3>
          <div className="flex gap-2">
            <div className="border-4 border-black bg-accent px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              <Smartphone className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="border-4 border-black bg-accent px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              <span className="font-pixel text-sm text-accent-foreground">iOS</span>
            </div>
            <div className="border-4 border-black bg-accent px-4 py-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
              <span className="font-pixel text-sm text-accent-foreground">AND</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-4 border-black mb-6"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <p className="font-pixel text-sm text-primary-foreground">© 2025 hA.I.r • ALL RIGHTS RESERVED</p>
          
          <div className="flex gap-6 text-sm font-sans">
            <button onClick={() => navigate("/dmca")} className="text-primary-foreground hover:text-primary-foreground/70 transition-colors">
              DMCA
            </button>
            <button onClick={() => navigate("/help")} className="text-primary-foreground hover:text-primary-foreground/70 transition-colors">
              Help
            </button>
            <a href="mailto:support@hair-ai.com" className="text-primary-foreground hover:text-primary-foreground/70 transition-colors">
              Contact
            </a>
          </div>
        </div>
        
        {/* Legal Disclaimer */}
        <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-sm font-sans text-foreground leading-relaxed text-center">
            <strong>Disclaimer:</strong> Individual results may vary. AI recommendations are assistive tools only and not professional advice. Stylists are independent contractors responsible for maintaining their own professional liability insurance and state licenses. Service outcomes depend on individual skill, technique, and client hair characteristics. No guarantees are implied.
          </p>
        </div>
      </div>
    </footer>
  );
};
