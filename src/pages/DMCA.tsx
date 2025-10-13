/**
 * DMCA Policy Page
 * LEGAL PROTECTION: Copyright infringement procedures
 */

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { Shield, Mail, FileText } from "lucide-react";

const DMCA = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="DMCA Copyright Policy" 
        icon={<Shield className="h-6 w-6" />}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Digital Millennium Copyright Act (DMCA) Notice</h2>
            <p>
              hA.I.r respects the intellectual property rights of others and expects users to do the same.
              In accordance with the DMCA, we will respond to valid notices of copyright infringement.
            </p>

            <h2>Copyright Infringement Notification</h2>
            <p>
              If you believe that your copyrighted work has been copied in a way that constitutes copyright
              infringement and is accessible on this platform, please notify our copyright agent as set forth below.
            </p>

            <h3>Required Information for DMCA Takedown Notice:</h3>
            <ol>
              <li>
                <strong>Identification of the copyrighted work</strong> claimed to have been infringed,
                or, if multiple copyrighted works are covered by a single notification, a representative
                list of such works.
              </li>
              <li>
                <strong>Identification of the material</strong> that is claimed to be infringing or to be the
                subject of infringing activity and that is to be removed, and information reasonably sufficient
                to permit us to locate the material (including URL).
              </li>
              <li>
                <strong>Your contact information</strong>, including your address, telephone number, and email address.
              </li>
              <li>
                <strong>A statement by you</strong> that you have a good faith belief that use of the material in
                the manner complained of is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>A statement by you</strong>, made under penalty of perjury, that the above information in
                your notice is accurate and that you are the copyright owner or authorized to act on the copyright
                owner's behalf.
              </li>
              <li>
                <strong>Your physical or electronic signature</strong>.
              </li>
            </ol>

            <h2>Designated Copyright Agent</h2>
            <div className="bg-muted p-6 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <strong>Agent:</strong> DMCA Compliance Officer
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <strong>Email:</strong> ThehA.I.rtologist@gmail.com
              </div>
              <div>
                <strong>Mailing Address:</strong><br />
                hA.I.r DMCA Agent<br />
                8 The Green, Suite A<br />
                Dover, DE 19901, United States
              </div>
            </div>

            <h2>Counter-Notification</h2>
            <p>
              If you believe that your content that was removed (or to which access was disabled) is not infringing,
              or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant
              to the law, to upload and use the content, you may send a counter-notice to our Copyright Agent
              containing the following information:
            </p>

            <ol>
              <li>Your physical or electronic signature.</li>
              <li>
                Identification of the content that has been removed or to which access has been disabled and the
                location at which the content appeared before it was removed or disabled.
              </li>
              <li>
                A statement that you have a good faith belief that the content was removed or disabled as a result
                of mistake or a misidentification of the content.
              </li>
              <li>
                Your name, address, telephone number, and email address, and a statement that you consent to the
                jurisdiction of the federal court for the judicial district in which your address is located (or
                if you reside outside the United States, for any judicial district in which we may be found), and
                that you will accept service of process from the person who provided notification of the alleged
                infringement.
              </li>
            </ol>

            <h2>Repeat Infringer Policy</h2>
            <p>
              In accordance with the DMCA and other applicable law, we have adopted a policy of terminating, in
              appropriate circumstances and at our sole discretion, accounts of users who are deemed to be repeat
              infringers. We may also, at our sole discretion, limit access to the platform and/or terminate the
              accounts of any users who infringe any intellectual property rights of others, whether or not there
              is any repeat infringement.
            </p>

            <h2>False Claims</h2>
            <p>
              <strong className="text-warning">WARNING:</strong> Under Section 512(f) of the DMCA, any person who
              knowingly materially misrepresents that material or activity is infringing may be subject to liability
              for damages. Don't make false claims!
            </p>

            <h2>Processing Timeline</h2>
            <ul>
              <li><strong>Initial Review:</strong> Within 24-48 hours</li>
              <li><strong>Content Removal:</strong> Within 72 hours of valid notice</li>
              <li><strong>Counter-Notice Review:</strong> 10-14 business days</li>
              <li><strong>Restoration:</strong> 10-14 business days after valid counter-notice (if applicable)</li>
            </ul>

            <h2>Content Types Covered</h2>
            <p>This DMCA policy applies to the following user-generated content on our platform:</p>
            <ul>
              <li>Portfolio photos uploaded by stylists</li>
              <li>Profile pictures and avatars</li>
              <li>Hair formula descriptions (if copied from copyrighted sources)</li>
              <li>Tutorial videos or images</li>
              <li>Business logos and branding materials</li>
              <li>Any other media uploaded by users</li>
            </ul>

            <h2>Platform's Protected Content</h2>
            <p>
              <strong>Note:</strong> The hA.I.r platform itself, including its code, algorithms, UI/UX design,
              branding, and AI models, is proprietary and protected by copyright, trademark, and trade secret law.
              Unauthorized use, reproduction, or distribution of platform content is prohibited and subject to legal action.
            </p>

            <h2>Contact Information</h2>
            <p>
              For any questions about this DMCA policy, please contact:<br />
              <strong>Email:</strong> ThehA.I.rtologist@gmail.com
            </p>

            <div className="bg-primary/10 p-6 rounded-lg mt-8">
              <h3 className="text-primary mt-0">Important Notice</h3>
              <p className="mb-0">
                This DMCA policy is a legal document. If you have any questions about your rights or obligations
                under this policy, please consult an attorney. Making false claims under the DMCA can result in
                significant legal penalties.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DMCA;
