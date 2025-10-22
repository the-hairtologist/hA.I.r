import { Scissors } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MinimalFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="brutal-border-4 border-secondary bg-foreground pb-safe" style={{
      backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
      backgroundSize: '8px 8px'
    }}>
      <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-2 xs:gap-2.5">
            <div className="w-8 h-8 xs:w-9 xs:h-9 brutal-border bg-secondary flex items-center justify-center brutal-shadow-sm">
              <Scissors className="h-4 w-4 xs:h-4.5 xs:w-4.5 text-secondary-foreground" />
            </div>
            <span className="font-pixel text-sm xs:text-base text-background uppercase">hA.I.r</span>
            <span className="font-pixel text-xs xs:text-sm text-background/70">© 2025</span>
          </div>

          {/* Divider */}
          <div className="w-full sm:w-px h-px sm:h-auto sm:min-h-[60px] sm:mx-4 bg-secondary/20" />

          {/* Links + Disclaimer */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Essential Links */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 xs:gap-2.5 sm:gap-3 text-xs xs:text-sm font-sans">
              <button onClick={() => navigate("/terms")} className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
                Terms
              </button>
              <button onClick={() => navigate("/help")} className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
                Help
              </button>
              <a href="mailto:support@hair-ai.com" className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
                Contact
              </a>
              <button onClick={() => navigate("/disclaimer")} className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm">
                Disclaimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
