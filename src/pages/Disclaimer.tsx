import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { AlertTriangle } from 'lucide-react';

const Disclaimer = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Disclaimer"
        icon={<AlertTriangle className="h-6 w-6" />}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>Important Legal Disclaimers</h2>

            <div className="bg-warning/10 p-6 rounded-lg border-l-4 border-warning my-6">
              <h3 className="mt-0">⚠️ Please Read Carefully</h3>
              <p className="mb-0">
                The following disclaimers are critical to your use of the hA.I.r
                platform. By using our service, you acknowledge and agree to
                these terms.
              </p>
            </div>

            <h2>1. Individual Results May Vary</h2>
            <p>
              Hair treatments, styling services, and product results are highly
              individualized and depend on numerous factors including hair type,
              porosity, previous treatments, health conditions, and individual
              chemistry. Results shown in photos, testimonials, or AI
              recommendations may not reflect your personal outcome.
            </p>

            <h2>2. AI Recommendations Are Assistive Tools Only</h2>
            <p>
              All AI-generated content, including hair formulas, color
              suggestions, styling recommendations, and consultation responses,
              are <strong>informational tools only</strong> and should never be
              considered professional cosmetology advice.
            </p>

            <ul>
              <li>
                <strong>Not Professional Advice:</strong> AI suggestions must be
                verified by licensed professionals
              </li>
              <li>
                <strong>Human Oversight Required:</strong> All final decisions
                must be made by licensed cosmetologists
              </li>
              <li>
                <strong>Testing Required:</strong> Always perform strand tests
                and patch tests before applying any formula
              </li>
              <li>
                <strong>No Liability:</strong> We are not responsible for
                adverse reactions or unsatisfactory results from AI
                recommendations
              </li>
            </ul>

            <h2>3. Independent Contractors</h2>
            <p>
              Stylists using the hA.I.r platform are{' '}
              <strong>independent contractors</strong>, not employees or
              representatives of hA.I.r. They are solely responsible for:
            </p>

            <ul>
              <li>Maintaining valid state cosmetology licenses</li>
              <li>
                Carrying professional liability insurance as required by law
              </li>
              <li>
                All professional decisions, services, and client interactions
              </li>
              <li>Compliance with local, state, and federal regulations</li>
              <li>Quality and safety of services provided</li>
            </ul>

            <h2>4. Platform Limitations</h2>
            <p>
              hA.I.r is a software platform that facilitates connections between
              stylists and clients. We do not:
            </p>

            <ul>
              <li>Provide hair services or professional cosmetology advice</li>
              <li>Supervise, control, or direct stylist actions</li>
              <li>Guarantee the quality, safety, or outcomes of services</li>
              <li>
                Verify professional credentials beyond basic documentation
              </li>
              <li>
                Assume liability for stylist-client disputes or service issues
              </li>
            </ul>

            <h2>5. No Medical Advice</h2>
            <p>
              This platform does not provide medical advice. If you have scalp
              conditions, allergies, health concerns, or are experiencing
              adverse reactions, please consult a qualified healthcare
              professional immediately.
            </p>

            <h2>6. No Warranties</h2>
            <p>
              The hA.I.r platform is provided "as is" without warranties of any
              kind, express or implied, including but not limited to:
            </p>

            <ul>
              <li>Availability, uptime, or uninterrupted service</li>
              <li>Accuracy or reliability of information</li>
              <li>Compatibility with all devices or browsers</li>
              <li>Freedom from errors, bugs, or security vulnerabilities</li>
            </ul>

            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, hA.I.r and its officers,
              directors, employees, and affiliates shall not be liable for:
            </p>

            <ul>
              <li>Direct, indirect, incidental, or consequential damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Personal injury or property damage</li>
              <li>Adverse hair or scalp reactions</li>
              <li>Unsatisfactory service outcomes</li>
              <li>Errors or omissions in AI-generated content</li>
            </ul>

            <h2>8. User Responsibility</h2>
            <p>
              By using this platform, you agree that you are solely responsible
              for:
            </p>

            <ul>
              <li>Verifying stylist credentials and qualifications</li>
              <li>Communicating your needs, concerns, and medical history</li>
              <li>Following aftercare instructions</li>
              <li>Reporting adverse reactions immediately</li>
              <li>Making informed decisions about your hair care</li>
            </ul>

            <h2>9. Intellectual Property Protection</h2>
            <p className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive">
              <strong>⚠️ Copyright Notice:</strong> All code, algorithms, UI/UX
              designs, AI models, and business logic are proprietary and
              protected by copyright, trademark, and trade secret laws.
              Unauthorized copying, distribution, reverse engineering, or
              commercial use is strictly prohibited and will result in legal
              action.
            </p>

            <h2>10. Third-Party Services</h2>
            <p>
              The platform integrates with third-party services (payment
              processors, mapping services, etc.). We are not responsible for
              the availability, accuracy, or security of third-party services.
            </p>

            <h2>11. Changes to Services</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any
              feature or service at any time without notice or liability.
            </p>

            <h2>Questions or Concerns?</h2>
            <p>
              If you have questions about these disclaimers or need
              clarification, please contact us through the app's support feature
              or email{' '}
              <a
                href="mailto:support@hair-ai.com"
                className="text-primary hover:underline"
              >
                support@hair-ai.com
              </a>
              .
            </p>

            <p className="text-sm text-muted-foreground mt-8 pt-4 border-t">
              By continuing to use the hA.I.r platform, you acknowledge that you
              have read, understood, and agree to these disclaimers.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Disclaimer;
