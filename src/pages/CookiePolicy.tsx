import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { Cookie } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Cookie Policy" icon={<Cookie className="h-6 w-6" />} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when
              you visit our website. They help us provide you with a better
              experience by remembering your preferences and understanding how
              you use our service.
            </p>

            <h2>How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>

            <h3>1. Essential Cookies (Required)</h3>
            <p>
              These cookies are necessary for the website to function properly:
            </p>
            <ul>
              <li>
                <strong>Authentication:</strong> Keep you logged in to your
                account
              </li>
              <li>
                <strong>Security:</strong> Protect against unauthorized access
                and fraud
              </li>
              <li>
                <strong>Preferences:</strong> Remember your settings and choices
              </li>
              <li>
                <strong>Session Management:</strong> Maintain your session
                across pages
              </li>
            </ul>
            <p>
              <em>
                You cannot opt out of essential cookies as they are required for
                the service to work.
              </em>
            </p>

            <h3>2. Analytics Cookies (Optional)</h3>
            <p>Help us understand how visitors use our website:</p>
            <ul>
              <li>Pages visited and features used</li>
              <li>Time spent on the website</li>
              <li>Error messages encountered</li>
              <li>Device and browser information</li>
            </ul>
            <p>
              <em>
                These cookies do not identify you personally and data is
                collected anonymously.
              </em>
            </p>

            <h3>3. Marketing Cookies (Optional)</h3>
            <p>Used to show you relevant advertisements:</p>
            <ul>
              <li>Track which ads you've seen</li>
              <li>Measure ad campaign effectiveness</li>
              <li>Show personalized content</li>
            </ul>

            <h2>Third-Party Cookies</h2>
            <p>
              We use services from trusted third parties that may set cookies:
            </p>
            <ul>
              <li>
                <strong>Supabase:</strong> Authentication and database services
              </li>
              <li>
                <strong>Stripe:</strong> Payment processing
              </li>
              <li>
                <strong>Analytics Providers:</strong> Usage statistics (if
                analytics cookies enabled)
              </li>
            </ul>

            <h2>Managing Your Cookie Preferences</h2>
            <p>You can control and manage cookies in several ways:</p>

            <h3>Cookie Consent Banner</h3>
            <p>
              When you first visit our website, you'll see a cookie consent
              banner where you can:
            </p>
            <ul>
              <li>Accept all cookies</li>
              <li>Accept only essential cookies</li>
              <li>Customize your preferences</li>
            </ul>

            <h3>Browser Settings</h3>
            <p>
              Most browsers allow you to control cookies through their settings:
            </p>
            <ul>
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Clear cookies when you close your browser</li>
              <li>Delete existing cookies</li>
            </ul>
            <p>
              <em>
                Note: Blocking essential cookies may prevent you from using some
                features of our service.
              </em>
            </p>

            <h2>Cookie Lifespan</h2>
            <p>Cookies we use have different lifespans:</p>
            <ul>
              <li>
                <strong>Session Cookies:</strong> Deleted when you close your
                browser
              </li>
              <li>
                <strong>Persistent Cookies:</strong> Remain for a set period (up
                to 1 year) to remember your preferences
              </li>
            </ul>

            <h2>Specific Cookies We Use</h2>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3 mt-4">
              <div className="p-4 border-2 border-foreground rounded-lg space-y-2">
                <code className="text-sm font-bold block">
                  hair-cookie-consent
                </code>
                <p className="text-sm">Stores your cookie preferences</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">Essential</Badge>
                  <Badge variant="secondary">1 year</Badge>
                </div>
              </div>

              <div className="p-4 border-2 border-foreground rounded-lg space-y-2">
                <code className="text-sm font-bold block">sidebar:state</code>
                <p className="text-sm">Remembers sidebar open/closed state</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">Essential</Badge>
                  <Badge variant="secondary">7 days</Badge>
                </div>
              </div>

              <div className="p-4 border-2 border-foreground rounded-lg space-y-2">
                <code className="text-sm font-bold block">sb-access-token</code>
                <p className="text-sm">Authentication token</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">Essential</Badge>
                  <Badge variant="secondary">Session</Badge>
                </div>
              </div>

              <div className="p-4 border-2 border-foreground rounded-lg space-y-2">
                <code className="text-sm font-bold block">
                  sb-refresh-token
                </code>
                <p className="text-sm">Refresh authentication</p>
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">Essential</Badge>
                  <Badge variant="secondary">30 days</Badge>
                </div>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse mt-4 min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="text-left p-3 font-semibold">Cookie Name</th>
                    <th className="text-left p-3 font-semibold">Purpose</th>
                    <th className="text-left p-3 font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">
                      <code className="bg-muted px-2 py-1 rounded">
                        hair-cookie-consent
                      </code>
                    </td>
                    <td className="p-3">Stores your cookie preferences</td>
                    <td className="p-3">
                      <Badge variant="outline">Essential</Badge>
                    </td>
                    <td className="p-3">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">
                      <code className="bg-muted px-2 py-1 rounded">
                        sidebar:state
                      </code>
                    </td>
                    <td className="p-3">Remembers sidebar open/closed state</td>
                    <td className="p-3">
                      <Badge variant="outline">Essential</Badge>
                    </td>
                    <td className="p-3">7 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">
                      <code className="bg-muted px-2 py-1 rounded">
                        sb-access-token
                      </code>
                    </td>
                    <td className="p-3">Authentication token</td>
                    <td className="p-3">
                      <Badge variant="outline">Essential</Badge>
                    </td>
                    <td className="p-3">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">
                      <code className="bg-muted px-2 py-1 rounded">
                        sb-refresh-token
                      </code>
                    </td>
                    <td className="p-3">Refresh authentication</td>
                    <td className="p-3">
                      <Badge variant="outline">Essential</Badge>
                    </td>
                    <td className="p-3">30 days</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Do Not Track</h2>
            <p>
              Some browsers have a "Do Not Track" (DNT) feature. When enabled
              with analytics cookies disabled, we honor this preference and do
              not track your activity.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. When we do, we
              will update the "Last updated" date at the top of this page. We
              encourage you to review this policy periodically.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us
              at:
            </p>
            <p>
              <strong>Email:</strong> ThehA.I.rtologist@gmail.com
              <br />
              <strong>Subject:</strong> Cookie Policy Inquiry
            </p>

            <h2>Additional Resources</h2>
            <ul>
              <li>
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="https://allaboutcookies.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  All About Cookies (External)
                </a>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicy;
