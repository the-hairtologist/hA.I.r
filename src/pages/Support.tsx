import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { HelpCircle, Mail, MessageCircle, Bug, Lightbulb, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Support = () => {
  const supportEmail = "ThehA.I.rtologist@gmail.com";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Support & Help" 
        icon={<HelpCircle className="h-6 w-6" />}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Get Help
              </CardTitle>
              <CardDescription>
                We're here to help you get the most out of hA.I.r Pro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = `mailto:${supportEmail}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('/messages', '_self')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  In-App Chat
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Average response time: Within 24 hours
              </p>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How do I subscribe to Stylist Pro?</h3>
                  <p className="text-sm text-muted-foreground">
                    Navigate to any premium feature, and you'll see a subscription prompt. 
                    You can start with a 7-day free trial. On iOS, subscriptions are managed 
                    through Apple In-App Purchase.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">How do I cancel my subscription?</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>iOS:</strong> Go to Settings → Your Name → Subscriptions → hA.I.r Pro → Cancel Subscription<br />
                    <strong>Web/Android:</strong> Visit your subscription management page in your account settings
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">What happens to my data if I cancel?</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is never deleted when you cancel. You'll retain access to view your 
                    client history, formulas, and appointments. Premium features like AI assistant 
                    and advanced analytics will be locked until you resubscribe.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">How do I delete my account?</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → Account → Delete Account. This will permanently remove all 
                    your data. For GDPR requests, email us at {supportEmail}.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Is my client data secure?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! We use enterprise-grade encryption (HTTPS/TLS) for data in transit and 
                    at rest. All sensitive data is stored in secure, encrypted databases with 
                    Row-Level Security (RLS) policies.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Can I use this on multiple devices?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! Your subscription works across all your devices (iPhone, iPad, Android, Web). 
                    Just log in with the same account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Report a Bug
              </CardTitle>
              <CardDescription>
                Found something that's not working correctly?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = `mailto:${supportEmail}?subject=Bug Report - hA.I.r Pro&body=Please describe the issue:\n\n1. What were you trying to do?\n2. What happened instead?\n3. Device/Browser:\n4. Screenshots (if applicable):`}
              >
                <Bug className="mr-2 h-4 w-4" />
                Send Bug Report
              </Button>
            </CardContent>
          </Card>

          {/* Feature Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Request a Feature
              </CardTitle>
              <CardDescription>
                Have an idea to improve hA.I.r? We'd love to hear it!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = `mailto:${supportEmail}?subject=Feature Request - hA.I.r Pro&body=Feature Idea:\n\nHow would this help you?\n\n`}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Submit Feature Request
              </Button>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.open('/privacy', '_self')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Privacy Policy
              </Button>
              <Button 
                variant="ghost"
                className="w-full justify-start"
                onClick={() => window.open('/terms', '_self')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Terms of Service
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="text-center p-6 bg-muted/30 rounded-lg">
            <h3 className="font-semibold mb-2">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact us directly and we'll get back to you as soon as possible
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <a 
                  href={`mailto:${supportEmail}`}
                  className="text-primary hover:underline"
                >
                  {supportEmail}
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                Company: hA.I.r™<br />
                Address: 8 The Green, Suite A, Dover, DE 19901, United States
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
