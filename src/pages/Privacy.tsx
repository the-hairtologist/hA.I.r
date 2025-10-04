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
              <li>Phone number</li>
              <li>Profile information</li>
              <li>Payment information (processed securely by Stripe)</li>
              <li>Hair-related information (with your consent)</li>
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
            <p>We retain your information for as long as your account is active or as needed to provide services. Old client data (2+ years without appointments) is automatically anonymized.</p>
            
            <h2>7. Cookies</h2>
            <p>We use essential cookies to:</p>
            <ul>
              <li>Maintain your session</li>
              <li>Remember your preferences</li>
              <li>Improve site performance</li>
            </ul>
            
            <h2>8. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Twilio:</strong> SMS notifications (with consent)</li>
            </ul>
            
            <h2>9. Children's Privacy</h2>
            <p>Our service is not intended for children under 13. We do not knowingly collect information from children under 13.</p>
            
            <h2>10. Changes to Privacy Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            
            <h2>11. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us through the app's support feature.</p>
            
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