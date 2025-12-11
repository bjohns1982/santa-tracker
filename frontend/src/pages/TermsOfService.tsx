export default function TermsOfService() {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-holiday-red mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {today}</p>
          </div>

          <div className="prose max-w-none space-y-6">
            <p className="text-gray-700">
              These Terms of Service ("Terms") govern your participation in the Santa
              Tour and your use of the Santa Tour website.
            </p>
            <p className="text-gray-700">
              By signing up for the Santa Tour and optionally opting in to receive text message
              notifications, you agree to these Terms.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                1. Purpose of the Santa Tour
              </h2>
              <p className="text-gray-700">
                The Santa Tour is a neighborhood volunteer event designed to bring Santa to
                participating families. The website is used to collect household details and send
                optional updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                2. SMS Notifications
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  If you check the box requesting text message updates and provide your mobile
                  number, you consent to receive 3–5 SMS messages on the day of the Santa Tour.
                </li>
                <li>Message & data rates may apply.</li>
                <li>You may opt out of text messages at any time by replying STOP.</li>
                <li>Reply HELP for assistance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">3. Eligibility</h2>
              <p className="text-gray-700">
                You must be at least 18 years old to submit information or opt in to SMS
                notifications. Parents or guardians may provide information on behalf of their
                children for the purpose of Santa's visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide false information</li>
                <li>Use the Santa Tour website for any unlawful purpose</li>
                <li>Attempt to interfere with the operation of the website or messaging system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">5. Data Practices</h2>
              <p className="text-gray-700">
                Your information is used only for Santa Tour participation and personalized visits.
              </p>
              <p className="text-gray-700 mt-4">
                Data practices are explained in our{' '}
                <a
                  href="/privacy"
                  className="text-holiday-red hover:underline font-semibold"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-700 mb-4">
                The Santa Tour is a volunteer event. We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Delays or inaccuracies in ETA notifications</li>
                <li>Canceled or rescheduled events</li>
                <li>Technical issues affecting message delivery</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Notifications are provided on a best-effort basis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                7. Changes to These Terms
              </h2>
              <p className="text-gray-700">
                We may update these Terms when necessary. Updated versions will be posted on this
                page with a revised "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">8. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about these Terms, contact:
              </p>
              <p className="text-gray-700 mt-2">
                <a
                  href="mailto:support@santa-tour.com"
                  className="text-holiday-red hover:underline font-semibold"
                >
                  support@santa-tour.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-holiday-red hover:underline font-semibold"
            >
              ← Back to Santa Tracker
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

