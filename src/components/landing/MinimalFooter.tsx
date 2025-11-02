import { Scissors } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MinimalFooter = () => {
  const navigate = useNavigate();

  return (
    <footer
      className="brutal-border-4 border-secondary bg-foreground pb-safe"
      style={{
        backgroundImage: `
        linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%),
        linear-gradient(0deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 100%)
      `,
        backgroundSize: '8px 8px',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          {/* Logo + Copyright */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 brutal-border bg-secondary flex items-center justify-center brutal-shadow-sm">
              <Scissors className="h-4.5 w-4.5 text-secondary-foreground" />
            </div>
            <span className="font-pixel text-base text-background uppercase">
              hA.I.r
            </span>
            <span className="font-pixel text-sm text-background/70">
              © 2025
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm font-sans">
            <button
              onClick={() => navigate('/terms')}
              className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
            >
              Terms
            </button>
            <button
              onClick={() => navigate('/help')}
              className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
            >
              Help
            </button>
            <a
              href="mailto:support@hair-ai.com"
              className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
            >
              Contact
            </a>
            <button
              onClick={() => navigate('/disclaimer')}
              className="text-background/80 hover:text-background transition-colors min-h-[44px] px-1.5 flex items-center focus-visible:underline focus-visible:ring-2 focus-visible:ring-background/50 focus-visible:ring-offset-1 focus-visible:outline-none rounded-sm"
            >
              Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
