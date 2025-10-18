import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Download, CheckCircle, Apple, Globe, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listen for install prompt (Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>App Installed!</CardTitle>
            <CardDescription>
              hA.I.r Pro is now on your home screen
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can access the app anytime from your home screen, even offline.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Install hA.I.r Pro</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Get the App
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Install hA.I.r Pro on your phone for instant access. Works offline, loads faster, and feels like a native app.
          </p>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Why Install?
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Works Offline</h3>
              <p className="text-sm text-muted-foreground">
                Access formulas and client data even without internet
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-secondary" />
              </div>
              <h3 className="font-semibold">Home Screen Access</h3>
              <p className="text-sm text-muted-foreground">
                Launch instantly from your home screen like any app
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold">Faster Performance</h3>
              <p className="text-sm text-muted-foreground">
                Optimized loading and smoother experience
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        {isIOS && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Install on iPhone/iPad
              </CardTitle>
              <CardDescription>Follow these steps to add hA.I.r Pro to your home screen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </Badge>
                  <p className="text-sm">Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari</p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </Badge>
                  <p className="text-sm">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </Badge>
                  <p className="text-sm">Tap <strong>"Add"</strong> in the top right corner</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> This only works in Safari. If you're using Chrome or another browser, open this page in Safari first.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isAndroid && deferredPrompt && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Install on Android
              </CardTitle>
              <CardDescription>One tap to install hA.I.r Pro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to install the app to your home screen.
              </p>
              <Button onClick={handleInstallClick} size="lg" className="w-full">
                <Download className="mr-2 h-5 w-5" />
                Install App Now
              </Button>
            </CardContent>
          </Card>
        )}

        {isAndroid && !deferredPrompt && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Install on Android
              </CardTitle>
              <CardDescription>Manual installation steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </Badge>
                  <p className="text-sm">Tap the <strong>menu</strong> (three dots) in your browser</p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </Badge>
                  <p className="text-sm">Look for <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </Badge>
                  <p className="text-sm">Tap <strong>"Install"</strong> or <strong>"Add"</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!isIOS && !isAndroid && (
          <Card>
            <CardHeader>
              <CardTitle>Install on Desktop</CardTitle>
              <CardDescription>Use Chrome, Edge, or Brave browser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </Badge>
                  <p className="text-sm">Click the <strong>install icon</strong> in the address bar (or browser menu)</p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="secondary" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </Badge>
                  <p className="text-sm">Click <strong>"Install"</strong> in the popup</p>
                </div>
              </div>
              {deferredPrompt && (
                <Button onClick={handleInstallClick} size="lg" className="w-full">
                  <Download className="mr-2 h-5 w-5" />
                  Install App Now
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to App
          </Button>
        </div>
      </div>
    </div>
  );
}
