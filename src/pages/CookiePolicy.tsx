import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Cookie } from "lucide-react";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Cookie Policy" 
        icon={<Cookie className="h-6 w-6" />}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our service.
            </p>
            
            <h2>How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            
            <h3>1. Essential Cookies (Required)</h3>
            <p>These cookies are necessary for the website to function properly:</p>
            <ul>
              <li><strong>Authentication:</strong> Keep you logged in to your account</li>
              <li><strong>Security:</strong> Protect against unauthorized access and fraud</li>
              <li><strong>Preferences:</strong> Remember your settings and choices</li>
              <li><strong>Session Management:</strong> Maintain your session across pages</li>
            </ul>
            <p><em>You cannot opt out of essential cookies as they are required for the service to work.</em></p>
            
            <h3>2. Analytics Cookies (Optional)</h3>
            <p>Help us understand how visitors use our website:</p>
            <ul>
              <li>Pages visited and features used</li>
              <li>Time spent on the website</li>
              <li>Error messages encountered</li>
              <li>Device and browser information</li>
            </ul>
            <p><em>These cookies do not identify you personally and data is collected anonymously.</em></p>
            
            <h3>3. Marketing Cookies (Optional)</h3>
            <p>Used to show you relevant advertisements:</p>
            <ul>
              <li>Track which ads you've seen</li>
              <li>Measure ad campaign effectiveness</li>
              <li>Show personalized content</li>
            </ul>
            
            <h2>Third-Party Cookies</h2>
            <p>We use services from trusted third parties that may set cookies:</p>
            <ul>
              <li><strong>Supabase:</strong> Authentication and database services</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Analytics Providers:</strong> Usage statistics (if analytics cookies enabled)</li>
            </ul>
            
            <h2>Managing Your Cookie Preferences</h2>
            <p>You can control and manage cookies in several ways:</p>
            
            <h3>Cookie Consent Banner</h3>
            <p>
              When you first visit our website, you'll see a cookie consent banner where you can:
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
              <em>Note: Blocking essential cookies may prevent you from using some features of our service.</em>
            </p>
            
            <h2>Cookie Lifespan</h2>
            <p>Cookies we use have different lifespans:</p>
            <ul>
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain for a set period (up to 1 year) to remember your preferences</li>
            </ul>
            
            <h2>Specific Cookies We Use</h2>
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cookie Name</th>
                  <th className="text-left p-2">Purpose</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2"><code>hair-cookie-consent</code></td>
                  <td className="p-2">Stores your cookie preferences</td>
                  <td className="p-2">Essential</td>
                  <td className="p-2">1 year</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><code>sidebar:state</code></td>
                  <td className="p-2">Remembers sidebar open/closed state</td>
                  <td className="p-2">Essential</td>
                  <td className="p-2">7 days</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><code>sb-access-token</code></td>
                  <td className="p-2">Authentication token</td>
                  <td className="p-2">Essential</td>
                  <td className="p-2">Session</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><code>sb-refresh-token</code></td>
                  <td className="p-2">Refresh authentication</td>
                  <td className="p-2">Essential</td>
                  <td className="p-2">30 days</td>
                </tr>
              </tbody>
            </table>
            
            <h2>Do Not Track</h2>
            <p>
              Some browsers have a "Do Not Track" (DNT) feature. When enabled with analytics cookies 
              disabled, we honor this preference and do not track your activity.
            </p>
            
            <h2>Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. When we do, we will update the 
              "Last updated" date at the top of this page. We encourage you to review this policy 
              periodically.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> privacy@hair.app<br />
              <strong>Subject:</strong> Cookie Policy Inquiry
            </p>
            
            <h2>Additional Resources</h2>
            <ul>
              <li>
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              </li>
              <li>
                <a href="https://allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
