/**
 * PWA Installation Guide Page
 * Helps users install the app on their device
 */
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Share2, MoreVertical, Chrome, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(navigator.userAgent);
    setIsAndroid(android);

    // Listen for the beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold">Install hA.I.r</h1>
          <p className="text-muted-foreground">
            Install our app for quick access, offline support, and a better experience
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-2 border-primary">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">App Already Installed! 🎉</h3>
                  <p className="text-muted-foreground">
                    You can find the hA.I.r app icon on your home screen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Android Installation */}
            {isAndroid && deferredPrompt && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    <CardTitle>Quick Install (Android)</CardTitle>
                  </div>
                  <CardDescription>
                    Click the button below to install the app instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Install App Now
                  </button>
                </CardContent>
              </Card>
            )}

            {/* iOS Installation Instructions */}
            {isIOS && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    <CardTitle>Install on iPhone/iPad</CardTitle>
                  </div>
                  <CardDescription>
                    Follow these simple steps to add hA.I.r to your home screen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      1
                    </Badge>
                    <div className="space-y-1">
                      <p className="font-medium">Tap the Share button</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Look for <Share2 className="h-4 w-4" /> at the bottom of Safari
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      2
                    </Badge>
                    <div className="space-y-1">
                      <p className="font-medium">Select "Add to Home Screen"</p>
                      <p className="text-sm text-muted-foreground">
                        Scroll down in the menu and tap this option
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      3
                    </Badge>
                    <div className="space-y-1">
                      <p className="font-medium">Tap "Add"</p>
                      <p className="text-sm text-muted-foreground">
                        Confirm to add the app icon to your home screen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Desktop/Generic Instructions */}
            {!isIOS && !isAndroid && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Chrome className="h-5 w-5" />
                    <CardTitle>Install on Desktop</CardTitle>
                  </div>
                  <CardDescription>
                    Install for quick access from your desktop
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      1
                    </Badge>
                    <div className="space-y-1">
                      <p className="font-medium">Click the install icon</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Look for <Download className="h-4 w-4" /> in the address bar
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <Badge variant="secondary" className="h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      2
                    </Badge>
                    <div className="space-y-1">
                      <p className="font-medium">Or use browser menu</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Click <MoreVertical className="h-4 w-4" /> → "Install hA.I.r..."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Why Install?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Instant Access:</strong> One tap from your home screen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Works Offline:</strong> View your formulas without internet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Faster Loading:</strong> Opens instantly like a native app</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Push Notifications:</strong> Get appointment reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span><strong>Full Screen:</strong> More space, cleaner interface</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstallPWA;
