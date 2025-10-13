import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Privacy Policy" 
        icon={<Shield className="h-6 w-6" />}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Data Controller Contact</h2>
            <p>
              <strong>Company:</strong> hA.I.r™ (Hair Management Platform)<br />
              <strong>Email:</strong> privacy@hair.app<br />
              <strong>Data Protection Inquiries:</strong> dpo@hair.app<br />
              <strong>Address:</strong> 8 The Green, Suite A, Dover, DE 19901, United States
            </p>
            
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you:</p>
            <ul>
              <li>Create an account</li>
              <li>Book appointments</li>
              <li>Communicate with stylists or clients</li>
              <li>Use our services</li>
            </ul>
            
            <h3>Personal Information</h3>
            <p>This includes:</p>
            <ul>
              <li>Name and email address</li>
              <li>Phone number (with explicit consent for SMS)</li>
              <li>Profile information</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Hair-related information (with explicit consent)</li>
              <li>Allergy information (with medical consent)</li>
            </ul>
            
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process appointments and payments</li>
              <li>Send appointment reminders and notifications</li>
              <li>Respond to your requests and support inquiries</li>
              <li>Protect against fraud and abuse</li>
            </ul>
            
            <h2>3. Information Sharing</h2>
            <p>We share information only in the following circumstances:</p>
            <ul>
              <li><strong>With stylists/clients:</strong> To facilitate appointments and services</li>
              <li><strong>Service providers:</strong> Third parties who provide services on our behalf (Supabase for hosting, Stripe for payments)</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            
            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information:</p>
            <ul>
              <li>Encryption in transit and at rest</li>
              <li>Row-level security policies</li>
              <li>Regular security audits</li>
              <li>Secure authentication</li>
            </ul>
            
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Withdraw consent for medical information</li>
            </ul>
            
            <h2>6. Data Retention</h2>
            <p>We retain your information as follows:</p>
            <ul>
              <li><strong>User Profiles:</strong> Active account + 2 years after inactivity</li>
              <li><strong>Appointments:</strong> 7 years (tax and legal compliance)</li>
              <li><strong>Messages:</strong> 2 years</li>
              <li><strong>Payment Records:</strong> 7 years (legal requirement)</li>
              <li><strong>Analytics Data:</strong> 26 months (GDPR standard)</li>
              <li><strong>Inactive Client Data:</strong> Automatically anonymized after 2 years without appointments</li>
            </ul>
            
            <h2>7. Cookies</h2>
            <p>We use cookies for essential functionality and, with your consent, for analytics and marketing. You can manage your cookie preferences through our cookie consent banner. See our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a> for details.</p>
            
            <h3>Essential Cookies (Required)</h3>
            <ul>
              <li>Maintain your session</li>
              <li>Remember your preferences</li>
              <li>Ensure security and authentication</li>
            </ul>
            
            <h3>Optional Cookies (With Consent)</h3>
            <ul>
              <li>Analytics: Understand how you use our service</li>
              <li>Marketing: Show relevant content and advertisements</li>
            </ul>
            
            <h2>8. AI-Powered Features</h2>
            <p>Our platform uses AI for the following purposes:</p>
            <ul>
              <li><strong>Hair Formula Suggestions:</strong> AI analyzes hair type and preferences to suggest formulas</li>
              <li><strong>Stylist Matching:</strong> Helps clients find suitable stylists based on preferences</li>
              <li><strong>Chat Assistance:</strong> AI-powered hair consultation chatbot</li>
            </ul>
            <p><em>Important: AI recommendations are assistive only. All final decisions are made by users and stylists. No high-risk automated decisions are made without human oversight.</em></p>
            
            <h2>9. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Supabase:</strong> Database, authentication, and hosting (US-based)</li>
              <li><strong>Stripe:</strong> Payment processing (PCI DSS Level 1 certified)</li>
              <li><strong>Twilio:</strong> SMS notifications (with explicit consent)</li>
              <li><strong>Lovable AI:</strong> AI-powered features (Gemini/GPT models)</li>
            </ul>
            <p>Data transfers to these services are protected by Standard Contractual Clauses (SCCs) and appropriate safeguards.</p>
            
            <h2>10. International Data Transfers</h2>
            <p>Your data may be processed in the United States and other countries. We use Standard Contractual Clauses (SCCs) and appropriate safeguards to protect your data.</p>
            
            <h2>11. Children's Privacy</h2>
            <p>Our service is intended for users 18 years and older. We do not knowingly collect information from individuals under 18. If you believe a minor has provided us with personal information, please contact us immediately at privacy@hair.app.</p>
            
            <h2>12. Changes to Privacy Policy</h2>
            <p>We may update this privacy policy from time to time. Material changes will be notified via email at least 30 days before taking effect.</p>
            
            <h2>13. Contact Us</h2>
            <p>For privacy inquiries: <strong>privacy@hair.app</strong> | Data Protection Officer: <strong>dpo@hair.app</strong></p>
            
            <h2>GDPR Compliance (EU Users)</h2>
            <p>If you are in the European Union, you have additional rights under GDPR:</p>
            <ul>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to lodge a complaint with supervisory authority</li>
            </ul>
            
            <h2>CCPA Compliance (California Users)</h2>
            <p>California residents have the right to:</p>
            <ul>
              <li>Know what personal information is collected</li>
              <li>Know if personal information is sold or disclosed</li>
              <li>Opt-out of sale of personal information</li>
              <li>Request deletion of personal information</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;