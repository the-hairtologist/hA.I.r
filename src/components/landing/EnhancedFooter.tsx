import { Scissors, Instagram, Facebook, Twitter, Youtube, Mail } from "lucide-react";
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
        title: "Thanks for subscribing!",
        description: "We'll keep you updated with tips and product news.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="border-t-2 border-foreground bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scissors className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-xl">hA.I.r</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered salon assistant that handles bookings, color formulas, and payments—so you can focus on your craft.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg border-2 border-foreground bg-card hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg border-2 border-foreground bg-card hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg border-2 border-foreground bg-card hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-lg border-2 border-foreground bg-card hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Demo
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Integrations
                </button>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate("/privacy")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/terms")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/cookie-policy")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/accessibility")} className="text-muted-foreground hover:text-foreground transition-colors">
                  Accessibility
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get styling tips, product updates, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSignup} className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-foreground"
                required
              />
              <Button type="submit" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t-2 border-foreground pt-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 hA.I.r - AI-Powered Salon Assistant. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => navigate("/dmca")} className="hover:text-foreground transition-colors">
                DMCA
              </button>
              <button onClick={() => navigate("/help")} className="hover:text-foreground transition-colors">
                Help Center
              </button>
              <a href="mailto:support@hair-ai.com" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
          
          {/* Legal Disclaimer */}
          <div className="text-center text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
            <p>
              <strong>Disclaimer:</strong> Individual results may vary. AI recommendations are assistive tools only and not professional advice.
            </p>
            <p>
              Stylists are independent contractors responsible for maintaining their own professional liability insurance and state licenses.
            </p>
            <p>
              Service outcomes depend on individual skill, technique, and client hair characteristics. No guarantees are implied.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
