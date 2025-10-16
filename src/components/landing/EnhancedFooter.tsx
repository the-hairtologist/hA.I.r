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
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 border-4 border-black bg-secondary flex items-center justify-center">
                <Scissors className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="font-pixel text-xl text-primary-foreground uppercase">hA.I.r</span>
            </div>
            <p className="text-xs font-sans text-primary-foreground/80 leading-relaxed border-l-4 border-accent pl-3">
              Your hair, smarter. Your salon, effortless.
            </p>
            <div className="flex gap-2 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-4 border-black bg-accent hover:bg-accent/80 transition-colors flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-accent-foreground" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-4 border-black bg-accent hover:bg-accent/80 transition-colors flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-accent-foreground" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-4 border-black bg-accent hover:bg-accent/80 transition-colors flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-accent-foreground" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-4 border-black bg-accent hover:bg-accent/80 transition-colors flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4 text-accent-foreground" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-pixel text-sm uppercase mb-3 text-primary-foreground border-l-4 border-accent pl-3">PRODUCT</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Demo
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Integrations
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-pixel text-sm uppercase mb-3 text-primary-foreground border-l-4 border-accent pl-3">COMPANY</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate("/auth")} className="font-sans text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  About
                </button>
              </li>
              <li>
                <a href="mailto:support@hair-ai.com" className="font-sans text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="font-sans text-xs text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Terms
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-pixel text-sm uppercase mb-3 text-primary-foreground border-l-4 border-accent pl-3">UPDATES</h3>
            <p className="text-xs font-sans text-primary-foreground/80 mb-3">
              Get tips and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSignup} className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-4 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-10"
                required
              />
              <Button 
                type="submit" 
                className="w-full font-pixel text-xs uppercase bg-secondary text-secondary-foreground hover:bg-secondary/90 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none h-10"
              >
                <Mail className="h-3 w-3 mr-2" />
                SUBSCRIBE
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t-4 border-black pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-pixel text-xs text-primary-foreground/80">© 2025 hA.I.r • ALL RIGHTS RESERVED</p>
            
            <div className="flex gap-4">
              <div className="flex gap-2">
                <div className="border-4 border-black bg-accent px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Smartphone className="h-3 w-3 text-accent-foreground" />
                </div>
                <div className="border-4 border-black bg-accent px-2 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-pixel text-xs text-accent-foreground">iOS</span>
                </div>
                <div className="border-4 border-black bg-accent px-2 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-pixel text-xs text-accent-foreground">AND</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 text-xs font-sans">
              <button onClick={() => navigate("/dmca")} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                DMCA
              </button>
              <button onClick={() => navigate("/help")} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Help
              </button>
              <a href="mailto:support@hair-ai.com" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          {/* Legal Disclaimer */}
          <div className="text-center border-4 border-black bg-white p-4 mt-6">
            <p className="text-xs font-sans text-muted-foreground">
              <strong>Disclaimer:</strong> Individual results may vary. AI recommendations are assistive tools only and not professional advice. Stylists are independent contractors responsible for maintaining their own professional liability insurance and state licenses. Service outcomes depend on individual skill, technique, and client hair characteristics. No guarantees are implied.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
