import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';

export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            title='Privacy Policy'
            description='Last updated: January 9, 2026'
          />
        </section>

        {/* Content */}
        <section className='mt-16 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='prose prose-invert prose-sm max-w-none'>
              <p className='text-muted-foreground'>
                PostEngageAI ("we", "our", or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                and safeguard your information when you use our AI-powered
                Instagram engagement automation service.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Information We Collect
              </h2>

              <h3 className='text-lg font-medium mt-8 mb-3'>
                Account Information
              </h3>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                <li>Email address (for account creation and communication)</li>
                <li>
                  Instagram account identifiers (via Meta's official OAuth
                  process)
                </li>
                <li>
                  Basic profile metadata required for service functionality
                </li>
              </ul>

              <h3 className='text-lg font-medium mt-8 mb-3'>Instagram Data</h3>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                <li>Comments on your Instagram posts (to enable auto-reply)</li>
                <li>
                  Direct message content (only for conversations you've
                  configured for automation)
                </li>
                <li>Follower activity (for DM trigger functionality)</li>
              </ul>

              <h3 className='text-lg font-medium mt-8 mb-3'>Usage Data</h3>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                <li>Credit consumption and transaction history</li>
                <li>Automation activity logs</li>
                <li>Service usage patterns</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                How We Use Information
              </h2>
              <p className='text-muted-foreground'>
                We use your information strictly to:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Provide and operate the PostEngageAI service</li>
                <li>Generate AI-powered responses on your behalf</li>
                <li>Process credit purchases and track usage</li>
                <li>Send service-related communications</li>
                <li>Improve and optimize our service</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Data Sharing and Third Parties
              </h2>
              <p className='text-muted-foreground'>
                <strong className='text-foreground'>
                  We do not sell your data.
                </strong>{' '}
                We only share information with:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>
                  <strong className='text-foreground'>Meta/Instagram:</strong>{' '}
                  Through official APIs to enable automation functionality
                </li>
                <li>
                  <strong className='text-foreground'>AI Providers:</strong> To
                  process and generate responses (content is not stored by
                  providers)
                </li>
                <li>
                  <strong className='text-foreground'>
                    Payment Processors:
                  </strong>{' '}
                  To handle credit purchases securely
                </li>
                <li>
                  <strong className='text-foreground'>
                    Infrastructure Providers:
                  </strong>{' '}
                  To host and operate our service
                </li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Data Retention
              </h2>
              <p className='text-muted-foreground'>
                We retain your data only as long as necessary to provide our
                service:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Account data: Until you delete your account</li>
                <li>Activity logs: 90 days rolling retention</li>
                <li>Payment records: As required by law (typically 7 years)</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>Your Rights</h2>
              <p className='text-muted-foreground'>You have the right to:</p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Disconnect your Instagram account at any time</li>
                <li>Export your data</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Data Security
              </h2>
              <p className='text-muted-foreground'>
                We implement industry-standard security measures including:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Encryption in transit (TLS) and at rest</li>
                <li>Regular security audits</li>
                <li>Access controls and authentication</li>
                <li>Secure infrastructure on trusted cloud providers</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Instagram / Meta Platform Compliance
              </h2>
              <p className='text-muted-foreground'>
                Our use of Instagram data is governed by Meta's Platform Terms.
                We:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Only access data you explicitly authorize</li>
                <li>Use official APIs exclusively</li>
                <li>Comply with all Meta data handling requirements</li>
                <li>Process data deletion requests per Meta's requirements</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Contact Information
              </h2>
              <p className='text-muted-foreground'>
                For privacy-related questions or requests:
              </p>
              <p className='text-muted-foreground mt-4'>
                <strong className='text-foreground'>Email:</strong>{' '}
                <a
                  href='mailto:postengage.ai@gmail.com'
                  className='text-primary hover:underline'
                >
                  postengage.ai@gmail.com
                </a>
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                Changes to This Policy
              </h2>
              <p className='text-muted-foreground'>
                We may update this Privacy Policy periodically. We will notify
                you of significant changes via email or through the service.
              </p>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
