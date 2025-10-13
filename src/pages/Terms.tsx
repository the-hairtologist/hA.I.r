import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Terms of Service" 
        icon={<FileText className="h-6 w-6" />}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using hA.I.r, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p>
            
            <h2>2. Description of Service</h2>
            <p>hA.I.r is a platform connecting hair stylists with clients, providing:</p>
            <ul>
              <li>Appointment scheduling and management</li>
              <li>Hair formula tracking</li>
              <li>Client-stylist communication</li>
              <li>Payment processing</li>
              <li>AI-powered hair consultation tools</li>
            </ul>
            
            <h2>3. User Accounts</h2>
            <h3>Account Creation</h3>
            <ul>
              <li>You must provide accurate information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be 18 years or older to use this service</li>
              <li>One person may not create multiple accounts</li>
            </ul>
            
            <h3>Account Types</h3>
            <ul>
              <li><strong>Stylist Accounts:</strong> For licensed hair professionals</li>
              <li><strong>Client Accounts:</strong> For individuals seeking hair services</li>
            </ul>
            
            <h2>4. Stylist Responsibilities</h2>
            <p>Stylists agree to:</p>
            <ul>
              <li>Maintain appropriate licenses and insurance</li>
              <li>Provide accurate service descriptions and pricing</li>
              <li>Honor scheduled appointments</li>
              <li>Maintain professional conduct</li>
              <li>Keep client information confidential</li>
            </ul>
            
            <h2>5. Client Responsibilities</h2>
            <p>Clients agree to:</p>
            <ul>
              <li>Provide accurate hair and health information</li>
              <li>Attend scheduled appointments or cancel with notice</li>
              <li>Pay for services as agreed</li>
              <li>Maintain respectful communication</li>
            </ul>
            
            <h2>6. Payments and Fees</h2>
            <h3>For Stylists</h3>
            <ul>
              <li>Subscription fee for premium features (if applicable)</li>
              <li>Payment processing fees (handled by Stripe)</li>
            </ul>
            
            <h3>For Clients</h3>
            <ul>
              <li>Service fees as listed by stylists</li>
              <li>Deposits may be required (non-refundable if appointment missed)</li>
            </ul>
            
            <h3>Refund Policy</h3>
            <ul>
              <li>Service refunds are at stylist's discretion</li>
              <li>Platform subscription refunds within 14 days of purchase</li>
              <li>Disputes should be resolved directly with stylist first</li>
            </ul>
            
            <h2>7. Cancellation Policy</h2>
            <ul>
              <li>Clients should cancel at least 24 hours in advance</li>
              <li>Late cancellations may result in deposit forfeiture</li>
              <li>Stylists should provide reasonable notice for cancellations</li>
            </ul>
            
            <h2>8. Intellectual Property</h2>
            
            <h3>Platform Ownership</h3>
            <p><strong>hA.I.r is proprietary software.</strong> All rights reserved.</p>
            <ul>
              <li>All code, algorithms, and software architecture are proprietary and protected</li>
              <li>All AI models, prompts, and training configurations are trade secrets</li>
              <li>All UI/UX designs, workflows, and user experiences are copyrighted</li>
              <li>All business logic, formulas, and calculations are confidential</li>
              <li>Platform branding, logos, and design elements are trademarked</li>
            </ul>
            
            <h3>User Content</h3>
            <ul>
              <li>You retain ownership of content you upload</li>
              <li>You grant us license to display and process your content</li>
              <li>Portfolio photos may be displayed publicly</li>
              <li>Hair formulas remain confidential to stylist and client</li>
            </ul>
            
            <h3>Restrictions on Use</h3>
            <p>You expressly agree NOT to:</p>
            <ul>
              <li>Copy, reproduce, or replicate any part of the platform</li>
              <li>Reverse engineer, decompile, or disassemble the software</li>
              <li>Extract, scrape, or harvest data systematically</li>
              <li>Create competing or derivative products</li>
              <li>Remove or alter copyright notices or watermarks</li>
              <li>Use automated tools to access or interact with the platform</li>
            </ul>
            
            <h2>9. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul>
              <li>Use the service for illegal purposes</li>
              <li>Harass or abuse other users</li>
              <li>Share false or misleading information</li>
              <li>Attempt to bypass security measures</li>
              <li>Scrape, copy, or extract content without permission</li>
              <li>Create fake accounts or reviews</li>
              <li>Inspect, copy, or replicate source code or algorithms</li>
              <li>Use the platform to build competing services</li>
              <li>Share screenshots or documentation of proprietary features</li>
              <li>Attempt to discover or exploit vulnerabilities</li>
            </ul>
            
            <p><strong>Violation of these terms may result in legal action including, but not limited to, civil litigation and criminal prosecution.</strong></p>
            
            <h2>10. Limitation of Liability</h2>
            <p>hA.I.r is a platform connecting stylists and clients. We are not liable for:</p>
            <ul>
              <li>Quality or outcomes of hair services</li>
              <li>Disputes between stylists and clients</li>
              <li>Allergic reactions or adverse effects</li>
              <li>Missed appointments or cancellations</li>
            </ul>
            
            <h2>11. Disclaimers</h2>
            <ul>
              <li>Service provided "as is" without warranties</li>
              <li>We do not guarantee availability or uptime</li>
              <li>AI features are assistive tools, not medical advice</li>
              <li>Stylists are independent contractors</li>
            </ul>
            
            <h2>12. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts for:</p>
            <ul>
              <li>Violation of these terms</li>
              <li>Fraudulent activity</li>
              <li>Repeated cancellations or no-shows</li>
              <li>Abusive behavior</li>
            </ul>
            
            <h2>13. Medical Disclaimer</h2>
            <p>Important: This platform is not a substitute for medical advice. Stylists should:</p>
            <ul>
              <li>Perform patch tests when appropriate</li>
              <li>Recommend medical consultation for scalp conditions</li>
              <li>Document allergies and sensitivities</li>
            </ul>
            
            <h2>14. Privacy</h2>
            <p>Your privacy is important. See our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details on data handling.</p>
            
            <h2>15. Modifications to Terms</h2>
            <p>We may update these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
            
            <h2>16. Dispute Resolution</h2>
            <ul>
              <li>Disputes should first be attempted to resolve directly</li>
              <li>If unresolved, contact our support team</li>
              <li>Binding arbitration may be required for serious disputes</li>
            </ul>
            
            <h2>17. Governing Law</h2>
            <p>These terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
            
            <h2>18. Contact Information</h2>
            <p>For questions about these terms, contact us through the app's support feature.</p>
            
            <h2>19. Severability</h2>
            <p>If any provision is found unenforceable, the remaining provisions remain in effect.</p>
            
            <h2>20. Entire Agreement</h2>
            <p>These terms constitute the entire agreement between you and hA.I.r regarding use of the service.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;