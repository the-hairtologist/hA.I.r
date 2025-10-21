import { Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MinimalFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="brutal-border-4 border-secondary bg-foreground" style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
      backgroundSize: '8px 8px'
    }}>
      <div className="container mx-auto px-4 py-6">
        {/* Single Row Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 brutal-border bg-secondary flex items-center justify-center brutal-shadow-sm">
              <Scissors className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span className="font-pixel text-base text-background uppercase">hA.I.r</span>
            <span className="font-pixel text-sm text-background/70">© 2025</span>
          </div>

          {/* Essential Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-sans">
            <button onClick={() => navigate("/terms")} className="text-background/80 hover:text-background transition-colors min-h-[44px] flex items-center">
              Terms
            </button>
            <button onClick={() => navigate("/help")} className="text-background/80 hover:text-background transition-colors min-h-[44px] flex items-center">
              Help
            </button>
            <a href="mailto:support@hair-ai.com" className="text-background/80 hover:text-background transition-colors min-h-[44px] flex items-center">
              Contact
            </a>
            <button 
              onClick={() => navigate("/auth")}
              className="text-[10px] xs:text-xs font-pixel uppercase bg-secondary/90 text-black hover:bg-secondary brutal-border border-black px-4 py-2 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 min-h-[44px] flex items-center"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Legal Disclaimer - Collapsed */}
        <details className="border-t-2 border-secondary/20 pt-3 mt-3">
          <summary className="text-xs font-sans text-background/70 cursor-pointer list-none text-center hover:text-background/90 transition-colors min-h-[44px] flex items-center justify-center">
            Legal Disclaimer
          </summary>
          <p className="text-xs font-sans text-background/70 leading-relaxed text-center max-w-4xl mx-auto mt-3">
            Individual results may vary. AI recommendations are assistive tools only and not professional advice. Stylists are independent contractors responsible for maintaining their own professional liability insurance and state licenses.
          </p>
        </details>
      </div>
    </footer>
  );
};
