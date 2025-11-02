/**
 * Accessibility Statement
 * LEGAL PROTECTION: ADA/WCAG compliance declaration
 */

import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';
import { Eye } from 'lucide-react';

const Accessibility = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Accessibility Statement"
        icon={<Eye className="h-6 w-6" />}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>Our Commitment to Accessibility</h2>
            <p>
              hA.I.r is committed to ensuring digital accessibility for people
              with disabilities. We are continually improving the user
              experience for everyone and applying the relevant accessibility
              standards.
            </p>

            <h2>Conformance Status</h2>
            <p>
              We strive to conform to <strong>WCAG 2.1 Level AA</strong> (Web
              Content Accessibility Guidelines). These guidelines explain how to
              make web content more accessible for people with disabilities and
              user-friendly for everyone.
            </p>

            <h3>Current Compliance Level:</h3>
            <ul>
              <li>
                <strong>WCAG 2.1 Level A:</strong> Fully Conformant ✓
              </li>
              <li>
                <strong>WCAG 2.1 Level AA:</strong> Partially Conformant (~95%)
              </li>
              <li>
                <strong>Section 508:</strong> Substantially Conformant
              </li>
            </ul>

            <h2>Accessibility Features</h2>

            <h3>Keyboard Navigation</h3>
            <ul>
              <li>Full keyboard accessibility for all interactive elements</li>
              <li>Logical tab order throughout the application</li>
              <li>Skip navigation links on major pages</li>
              <li>
                Keyboard shortcuts for common actions (Ctrl+K for search, etc.)
              </li>
              <li>No keyboard traps</li>
            </ul>

            <h3>Screen Reader Compatibility</h3>
            <ul>
              <li>ARIA labels on all interactive elements</li>
              <li>Semantic HTML structure (header, main, nav, etc.)</li>
              <li>Alternative text for all images</li>
              <li>Proper heading hierarchy (H1, H2, H3)</li>
              <li>Form labels associated with inputs</li>
              <li>Status messages announced to screen readers</li>
            </ul>

            <h3>Visual Accessibility</h3>
            <ul>
              <li>Minimum 4.5:1 contrast ratio for normal text</li>
              <li>Minimum 3:1 contrast ratio for large text</li>
              <li>No information conveyed by color alone</li>
              <li>Focus indicators visible on all interactive elements</li>
              <li>
                Text can be resized up to 200% without loss of functionality
              </li>
              <li>Dark mode support for light-sensitive users</li>
            </ul>

            <h3>Cognitive Accessibility</h3>
            <ul>
              <li>Consistent navigation across all pages</li>
              <li>Clear, simple language</li>
              <li>Predictable interface behavior</li>
              <li>Error messages that clearly explain what went wrong</li>
              <li>
                Sufficient time to read and use content (no auto-advancing)
              </li>
            </ul>

            <h3>Mobile Accessibility</h3>
            <ul>
              <li>Touch targets minimum 44x44 pixels (WCAG AAA)</li>
              <li>Responsive design for all screen sizes</li>
              <li>Orientation-independent design</li>
              <li>Gestures alternatives (no swipe-only actions)</li>
            </ul>

            <h2>Known Limitations</h2>
            <p>
              Despite our best efforts to ensure accessibility, there may be
              some limitations. Below is a description of known limitations and
              potential solutions:
            </p>

            <ul>
              <li>
                <strong>Third-party content:</strong> Some embedded content
                (e.g., social media embeds) may not be fully accessible. We are
                working with providers to improve this.
              </li>
              <li>
                <strong>Complex data visualizations:</strong> Some charts may be
                challenging for screen reader users. We provide data tables as
                alternatives where possible.
              </li>
              <li>
                <strong>Real-time updates:</strong> Some dynamic content updates
                may require page refresh for optimal screen reader experience.
              </li>
            </ul>

            <h2>Assistive Technologies</h2>
            <p>
              Our platform is designed to be compatible with the following
              assistive technologies:
            </p>
            <ul>
              <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
              <li>Screen magnification software (ZoomText, MAGic)</li>
              <li>Speech recognition software (Dragon NaturallySpeaking)</li>
              <li>Keyboard-only navigation</li>
            </ul>

            <h3>Tested With:</h3>
            <ul>
              <li>
                <strong>Windows:</strong> NVDA 2024+, JAWS 2024+
              </li>
              <li>
                <strong>Mac:</strong> VoiceOver (Safari, Chrome)
              </li>
              <li>
                <strong>Mobile:</strong> TalkBack (Android), VoiceOver (iOS)
              </li>
              <li>
                <strong>Browsers:</strong> Chrome, Firefox, Safari, Edge (latest
                versions)
              </li>
            </ul>

            <h2>Feedback and Contact</h2>
            <p>
              We welcome your feedback on the accessibility of hA.I.r. Please
              let us know if you encounter accessibility barriers:
            </p>

            <div className="bg-muted p-6 rounded-lg space-y-2">
              <div>
                <strong>Email:</strong> accessibility@hair.app
              </div>
              <div>
                <strong>Support:</strong> support@hair.app
              </div>
              <div>
                <strong>Response Time:</strong> Within 3 business days
              </div>
            </div>

            <h2>Formal Complaints</h2>
            <p>
              If you wish to report a compliance issue, you may file a complaint
              with:
            </p>
            <ul>
              <li>
                <strong>US Department of Justice:</strong>{' '}
                <a
                  href="https://www.ada.gov/filing_complaint.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ADA Complaint Form
                </a>
              </li>
              <li>
                <strong>FCC Disabilities Rights Office:</strong>{' '}
                <a
                  href="https://www.fcc.gov/consumers/guides/complaints-about-accessibility"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  FCC Accessibility Complaints
                </a>
              </li>
            </ul>

            <h2>Continuous Improvement</h2>
            <p>
              We are committed to continually improving accessibility. Our
              roadmap includes:
            </p>
            <ul>
              <li>Quarterly accessibility audits</li>
              <li>Annual third-party WCAG assessment</li>
              <li>Ongoing staff training on accessibility best practices</li>
              <li>User testing with people with disabilities</li>
              <li>
                Incorporating accessibility from the design phase of all new
                features
              </li>
            </ul>

            <h2>Technical Specifications</h2>
            <p>
              Accessibility of hA.I.r relies on the following technologies to
              work:
            </p>
            <ul>
              <li>HTML5</li>
              <li>WAI-ARIA</li>
              <li>CSS3</li>
              <li>JavaScript</li>
            </ul>

            <p>
              These technologies are relied upon for conformance with the
              accessibility standards used.
            </p>

            <h2>Assessment Approach</h2>
            <p>
              hA.I.r assessed the accessibility of our platform by the following
              approaches:
            </p>
            <ul>
              <li>
                Self-evaluation using automated tools (axe DevTools, WAVE)
              </li>
              <li>Manual testing with screen readers</li>
              <li>Keyboard-only navigation testing</li>
              <li>Color contrast verification</li>
              <li>User feedback incorporation</li>
            </ul>

            <div className="bg-primary/10 p-6 rounded-lg mt-8">
              <h3 className="text-primary mt-0">Accessibility is a Journey</h3>
              <p className="mb-0">
                We recognize that accessibility is an ongoing effort. This
                statement will be updated as we make improvements and receive
                feedback from our users. Thank you for helping us create a more
                inclusive experience for everyone.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Accessibility;
