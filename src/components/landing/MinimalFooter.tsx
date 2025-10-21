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
      <div className="container mx-auto px-3 xs:px-4 py-2 xs:py-2.5">
        {/* Single Row Layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 xs:gap-3 mb-1 xs:mb-1.5">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-2 xs:gap-2.5">
            <div className="w-8 h-8 xs:w-9 xs:h-9 brutal-border bg-secondary flex items-center justify-center brutal-shadow-sm">
              <Scissors className="h-4 w-4 xs:h-4.5 xs:w-4.5 text-secondary-foreground" />
            </div>
            <span className="font-pixel text-sm xs:text-base text-background uppercase">hA.I.r</span>
            <span className="font-pixel text-xs xs:text-sm text-background/70">© 2025</span>
          </div>

          {/* Essential Links */}
          <div className="flex flex-wrap justify-center gap-3 xs:gap-4 sm:gap-5 text-sm xs:text-base font-sans">
            <button onClick={() => navigate("/terms")} className="text-background/80 hover:text-background transition-colors min-h-[44px] px-2 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
              Terms
            </button>
            <button onClick={() => navigate("/help")} className="text-background/80 hover:text-background transition-colors min-h-[44px] px-2 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
              Help
            </button>
            <a href="mailto:support@hair-ai.com" className="text-background/80 hover:text-background transition-colors min-h-[44px] px-2 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
              Contact
            </a>
          </div>
        </div>

        {/* Legal Disclaimer - Collapsed */}
        <details className="border-t-2 border-secondary/20 pt-2 mt-2">
          <summary className="text-xs xs:text-sm font-sans text-background/70 cursor-pointer list-none text-center hover:text-background/90 transition-colors min-h-[44px] py-1 flex items-center justify-center">
            Legal Disclaimer
          </summary>
          <p className="text-xs xs:text-sm font-sans text-background/80 leading-relaxed text-center max-w-4xl mx-auto mt-2 px-2">
            Individual results may vary. AI recommendations are assistive tools only and not professional advice. Stylists are independent contractors responsible for maintaining their own professional liability insurance and state licenses.
          </p>
        </details>
      </div>
    </footer>
  );
};
