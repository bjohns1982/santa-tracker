export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold text-holiday-red mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {today}</p>
          </div>

          <div className="prose max-w-none space-y-6">
            <p className="text-gray-700">
              The Santa Tour ("we," "us," or "our") collects certain information from
              participants who choose to sign up for Santa Tour notifications. This Privacy Policy
              describes what information we collect, how we use it, and your rights regarding your
              data.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                Information We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect only the information you voluntarily provide when signing up for the
                Santa Tour, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Your street number and street name</li>
                <li>Family name</li>
                <li>Names of children and any special instructions you provide</li>
                <li>Mobile phone numbers used for SMS notifications</li>
              </ul>
              <p className="text-gray-700 mt-4">
                No payment information, location tracking, or sensitive personal information is
                collected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-4">
                We use your information solely for the purpose of:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Sending SMS notifications about the Santa Tour schedule</li>
                <li>Providing estimated arrival times (ETA)</li>
                <li>Helping Santa personalize his visit to your family</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We do not use your information for advertising or marketing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                Sharing Your Information
              </h2>
              <p className="text-gray-700">
                We do not sell, rent, or share your information with any third parties. Your data
                is only used to support the operation of the Santa Tour.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">
                SMS Notifications
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  If you opt in to receive text message updates, you will receive 3–5 SMS messages
                  on the day of the Santa Tour only.
                </li>
                <li>Message & data rates may apply.</li>
                <li>You may opt out at any time by replying STOP to any message.</li>
                <li>You may reply HELP for additional assistance.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">Data Security</h2>
              <p className="text-gray-700">
                We take reasonable measures to protect your information from unauthorized access or
                disclosure. However, no system is completely secure, and we cannot guarantee
                absolute protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You may request to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Update your information</li>
                <li>Delete your information</li>
                <li>Opt out of SMS notifications</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To make a request, email us at:{' '}
                <a
                  href="mailto:support@santa-tour.com"
                  className="text-holiday-red hover:underline font-semibold"
                >
                  support@santa-tour.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-holiday-red mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact us at:
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

