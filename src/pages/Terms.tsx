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
            
            <h2>11. AI-Powered Features & Disclaimers</h2>
            <p><strong>AI-Generated Content Limitations:</strong></p>
            <p>
              hA.I.r uses artificial intelligence to provide hair formula suggestions, styling recommendations, 
              and consultation assistance. <strong>All AI-generated content is for informational and reference 
              purposes only and should not be considered professional cosmetology advice.</strong>
            </p>
            
            <h3>How We Use AI</h3>
            <ul>
              <li><strong>Formula Generation:</strong> AI analyzes hair characteristics to suggest color formulas and mixing ratios</li>
              <li><strong>Hair Analysis:</strong> AI processes photos to identify hair type, condition, and potential concerns</li>
              <li><strong>Consultation Chat:</strong> AI answers general hair care questions and provides styling suggestions</li>
              <li><strong>Product Recommendations:</strong> AI suggests products based on hair needs and preferences</li>
            </ul>
            
            <h3>AI Content Disclaimers</h3>
            <p className="bg-warning/10 p-4 rounded-lg border-l-4 border-warning">
              <strong>⚠️ CRITICAL DISCLAIMERS:</strong>
            </p>
            <ul>
              <li><strong>Not Professional Advice:</strong> AI recommendations are informational only. Always verify with a licensed cosmetologist</li>
              <li><strong>Strand & Patch Tests Required:</strong> Never apply any formula without performing proper tests first</li>
              <li><strong>Individual Results Vary:</strong> Hair reactions differ based on porosity, health, previous treatments, and individual chemistry</li>
              <li><strong>Stylist Verification:</strong> Licensed stylists must independently verify all AI suggestions before application</li>
              <li><strong>No Liability:</strong> We are not liable for adverse reactions, unexpected results, or damages from AI-recommended formulas</li>
              <li><strong>Human Oversight Required:</strong> All final styling decisions must be made by licensed professionals</li>
              <li><strong>Accuracy Not Guaranteed:</strong> AI may make errors or provide outdated information. Cross-reference all suggestions</li>
            </ul>
            
            <h3>Your Responsibilities When Using AI Features</h3>
            <ol>
              <li><strong>Verify Everything:</strong> Cross-check AI recommendations with professional resources and product specifications</li>
              <li><strong>Perform Tests:</strong> Always conduct strand tests, patch tests, and porosity assessments</li>
              <li><strong>Consult Professionals:</strong> For complex cases, color corrections, or clients with sensitivities, consult experienced stylists</li>
              <li><strong>Document Thoroughly:</strong> Keep detailed records of all formulas, timing, and client reactions</li>
              <li><strong>Stay Licensed:</strong> Maintain your professional cosmetology license and continuing education</li>
              <li><strong>Report Issues:</strong> If AI provides unsafe or inappropriate suggestions, report them immediately</li>
            </ol>
            
            <h3>AI Model Information</h3>
            <p>
              We use industry-leading AI models including Google Gemini and OpenAI GPT. These models are trained 
              on general knowledge and do not replace specialized cosmetology training or experience.
            </p>
            
            <h2>12. General Service Disclaimers</h2>
            <ul>
              <li>Service provided "as is" without warranties of any kind</li>
              <li>We do not guarantee availability, uptime, or uninterrupted service</li>
              <li>Platform features may change or be discontinued at any time</li>
              <li>Stylists are independent contractors, not employees of hA.I.r</li>
              <li>We do not guarantee the quality, safety, or legality of services provided by stylists</li>
            </ul>
            
            <h2>13. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts for:</p>
            <ul>
              <li>Violation of these terms</li>
              <li>Fraudulent activity</li>
              <li>Repeated cancellations or no-shows</li>
              <li>Abusive behavior</li>
            </ul>
            
            <h2>14. Professional Liability</h2>
            <p>Stylists using this platform agree to:</p>
            <ul>
              <li><strong>Maintain professional liability insurance</strong> as required by their state or local jurisdiction</li>
              <li><strong>Hold valid state cosmetology licenses</strong> and comply with all professional regulations</li>
              <li><strong>Operate as independent contractors</strong> - hA.I.r is not responsible for stylist actions, decisions, or outcomes</li>
              <li><strong>Verify all product formulations</strong> and AI recommendations before use</li>
              <li><strong>Perform patch tests</strong> when appropriate to prevent allergic reactions</li>
            </ul>
            <p><em>hA.I.r provides software tools only. The platform does not provide professional cosmetology services or advice. Stylists are solely responsible for their professional practice, client safety, and compliance with applicable laws and regulations.</em></p>
            
            <h2>15. Medical Disclaimer</h2>
            <p>Important: This platform is not a substitute for medical advice. Stylists should:</p>
            <ul>
              <li>Perform patch tests when appropriate</li>
              <li>Recommend medical consultation for scalp conditions</li>
              <li>Document allergies and sensitivities</li>
              <li>Advise clients to consult healthcare professionals for medical concerns</li>
            </ul>
            
            <h2>16. Privacy</h2>
            <p>Your privacy is important. See our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> for details on data handling.</p>
            
            <h2>17. Modifications to Terms</h2>
            <p>We may update these terms at any time. Continued use of the service constitutes acceptance of new terms.</p>
            
            <h2>18. Dispute Resolution</h2>
            <ul>
              <li>Disputes should first be attempted to resolve directly</li>
              <li>If unresolved, contact our support team</li>
              <li>Binding arbitration may be required for serious disputes</li>
            </ul>
            
            <h2>19. Governing Law</h2>
            <p>These terms are governed by the laws of the State of Delaware, United States, without regard to its conflict of law provisions.</p>
            
            <h2>20. Contact Information</h2>
            <p>For questions about these terms, contact us through the app's support feature.</p>
            
            <h2>21. Severability</h2>
            <p>If any provision is found unenforceable, the remaining provisions remain in effect.</p>
            
            <h2>22. Entire Agreement</h2>
            <p>These terms constitute the entire agreement between you and hA.I.r regarding use of the service.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Terms;