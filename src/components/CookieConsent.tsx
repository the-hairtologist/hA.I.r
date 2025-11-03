import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { initAnalytics } from '@/lib/analytics';
import { mobileFirst } from '@/lib/responsive/mobile-first-utils';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'hair-cookie-consent';

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing cookie banner to let users see the app first
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // 3 second delay
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: ConsentPreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));

    // 🔐 GDPR Compliance: Only initialize analytics if user consents
    if (prefs.analytics) {
      initAnalytics();
    }

    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const acceptEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card className={cn("max-w-2xl w-full brutal-border brutal-shadow-lg", mobileFirst.padding.md)}>
        {!showPreferences ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={cn(mobileFirst.text.lg, "font-semibold mb-2")}>
                  Cookie Preferences
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use cookies to enhance your experience, analyze site usage,
                  and personalize content. You can manage your preferences below
                  or accept all cookies.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={acceptEssential}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={acceptAll} className="flex-1">
                Accept All Cookies
              </Button>
              <Button
                onClick={acceptEssential}
                variant="outline"
                className="flex-1"
              >
                Essential Only
              </Button>
              <Button
                onClick={() => setShowPreferences(true)}
                variant="outline"
                className="flex-1"
              >
                Customize
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              By clicking "Accept All", you consent to our use of cookies. Learn
              more in our{' '}
              <a href="/cookie-policy" className="text-primary hover:underline">
                Cookie Policy
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">
                Manage Cookie Preferences
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowPreferences(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/50">
                <Checkbox id="essential" checked={true} disabled />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="essential"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Essential Cookies (Required)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Necessary for the website to function. These cookies enable
                    core functionality such as security, authentication, and
                    accessibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={checked =>
                    setPreferences({
                      ...preferences,
                      analytics: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="analytics"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Analytics Cookies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Help us understand how visitors interact with our website by
                    collecting and reporting information anonymously.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={checked =>
                    setPreferences({
                      ...preferences,
                      marketing: checked as boolean,
                    })
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label
                    htmlFor="marketing"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Marketing Cookies
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Used to track visitors across websites to display relevant
                    advertisements and campaigns.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={saveCustomPreferences} className="flex-1">
                Save Preferences
              </Button>
              <Button
                onClick={() => setShowPreferences(false)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
