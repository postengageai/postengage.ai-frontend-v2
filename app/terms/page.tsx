import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PageHeader } from '@/components/marketing/page-header';

export default function TermsPage() {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main className='pt-32 pb-20'>
        {/* Hero */}
        <section className='px-4 sm:px-6'>
          <PageHeader
            title='Terms of Service'
            description='Last updated: January 9, 2026'
          />
        </section>

        {/* Content */}
        <section className='mt-16 px-4 sm:px-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='prose prose-invert prose-sm max-w-none'>
              <p className='text-muted-foreground'>
                Welcome to PostEngageAI. By using our service, you agree to
                these Terms of Service. Please read them carefully.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                1. Acceptance of Terms
              </h2>
              <p className='text-muted-foreground'>
                By accessing or using PostEngageAI, you agree to be bound by
                these Terms of Service. If you do not agree to these terms,
                please do not use our service.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                2. Service Description
              </h2>
              <p className='text-muted-foreground'>
                PostEngageAI is a credit-based AI platform that helps users
                automate Instagram comment replies and direct messages. The
                service uses artificial intelligence to generate responses based
                on your configured voice and preferences.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                3. User Responsibilities
              </h2>
              <p className='text-muted-foreground'>As a user, you agree to:</p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Provide accurate account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>
                  Take responsibility for all content generated on your behalf
                </li>
                <li>
                  Comply with Instagram/Meta's Terms of Service and Community
                  Guidelines
                </li>
                <li>
                  Not use the service for spam, harassment, or any illegal
                  purposes
                </li>
                <li>Review and approve your AI voice settings appropriately</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                4. AI-Generated Content
              </h2>
              <p className='text-muted-foreground'>You acknowledge that:</p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>
                  AI responses are generated based on your training and
                  configuration
                </li>
                <li>
                  AI responses are suggestions, not guarantees of
                  appropriateness
                </li>
                <li>
                  You are responsible for the content posted through your
                  account
                </li>
                <li>We recommend periodically reviewing automated responses</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                5. Credit Usage & Billing
              </h2>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                <li>
                  Credits represent usage of our service, not ownership of any
                  product
                </li>
                <li>
                  Each automated action consumes credits based on published
                  rates
                </li>
                <li>Credits are non-refundable once purchased</li>
                <li>Credits do not expire</li>
                <li>Prices may change with reasonable notice</li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                6. Instagram / Meta Compliance
              </h2>
              <p className='text-muted-foreground'>You agree to:</p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>
                  Comply with Instagram's Terms of Use and Community Guidelines
                </li>
                <li>
                  Not use our service in ways that violate Meta's Platform Terms
                </li>
                <li>
                  Accept that Instagram may revoke access at any time per their
                  policies
                </li>
                <li>
                  Understand that we cannot guarantee uninterrupted access if
                  platform policies change
                </li>
              </ul>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                7. Termination
              </h2>
              <p className='text-muted-foreground'>
                We may suspend or terminate your account if:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>You violate these Terms of Service</li>
                <li>You engage in abusive, fraudulent, or illegal activity</li>
                <li>Your use violates Instagram/Meta policies</li>
                <li>
                  We believe your actions may harm other users or the service
                </li>
              </ul>
              <p className='text-muted-foreground mt-4'>
                You may terminate your account at any time. Upon termination,
                unused credits remain non-refundable.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                8. Limitation of Liability
              </h2>
              <p className='text-muted-foreground'>
                PostEngageAI is provided "as-is" without warranties of any kind.
                We do not guarantee:
              </p>
              <ul className='list-disc pl-6 space-y-2 text-muted-foreground mt-4'>
                <li>Uninterrupted or error-free service</li>
                <li>Specific results from using the service</li>
                <li>
                  That AI responses will always be appropriate or accurate
                </li>
                <li>
                  Continued access to Instagram features if Meta changes their
                  policies
                </li>
              </ul>
              <p className='text-muted-foreground mt-4'>
                To the maximum extent permitted by law, we are not liable for
                any indirect, incidental, or consequential damages arising from
                your use of the service.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                9. Changes to Terms
              </h2>
              <p className='text-muted-foreground'>
                We may update these Terms of Service periodically. We will
                notify you of significant changes via email or through the
                service. Continued use after changes constitutes acceptance.
              </p>

              <h2 className='text-xl font-semibold mt-12 mb-4'>
                10. Contact Information
              </h2>
              <p className='text-muted-foreground'>
                For questions about these terms:
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
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
