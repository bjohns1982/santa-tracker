// Opt-in proof page for Twilio campaign approval
// This page provides screenshots and documentation for reviewers
// URL: /optin-proof

export default function OptInProof() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-holiday-red via-red-600 to-holiday-green p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-holiday-red mb-2">
              SMS Opt-In Verification
            </h1>
            <p className="text-gray-600">
              This page provides evidence of our SMS opt-in implementation for Twilio A2P 10DLC campaign approval.
            </p>
          </div>

          <div className="space-y-8">
            {/* Opt-In Form Section */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-holiday-red mb-4">
                1. Opt-In Form
              </h2>
              <p className="text-gray-700 mb-4">
                Users opt in to SMS notifications through a checkbox on the family signup form.
                The form is available at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-sm">
                  <strong>Demo URL:</strong>{" "}
                  <a
                    href="/signup/demo"
                    className="text-holiday-red hover:underline"
                  >
                    https://www.santa-tour.com/signup/demo
                  </a>
                </p>
                <p className="font-mono text-sm mt-2">
                  <strong>Production URL Pattern:</strong>{" "}
                  <span className="text-gray-600">
                    https://www.santa-tour.com/signup/[tourCode]
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Required Elements Present:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                  <li>✓ Checkbox for SMS opt-in with clear label</li>
                  <li>✓ Brand identification (Santa Tour / Santa Tracker)</li>
                  <li>✓ Message frequency disclosure (3-5 messages on tour day)</li>
                  <li>✓ Links to Terms and Privacy Policy</li>
                  <li>✓ "Message & data rates may apply" disclosure</li>
                  <li>✓ Opt-out instructions (Reply STOP)</li>
                  <li>✓ Help instructions (Reply HELP)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> The demo page at /signup/demo shows the exact form UI
                  with all consent language visible. The form is disabled for demonstration
                  purposes but displays the complete opt-in experience.
                </p>
              </div>
            </section>

            {/* Consent Text Section */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-holiday-red mb-4">
                2. Consent Language
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Checkbox Label:</strong> "Yes, send me text message updates about Santa's visit."
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-3">
                  <strong>Full Consent Text:</strong>
                </p>
                <p className="text-xs text-gray-600 mt-2 italic leading-relaxed">
                  "By checking this box and providing your mobile number, you agree to receive
                  3-5 text messages on the day of the Santa Tour about your schedule and Santa's
                  ETA. Message & data rates may apply. Reply STOP to opt out at any time, or HELP
                  for help. See our Terms and Privacy Policy at www.santa-tour.com/terms and
                  www.santa-tour.com/privacy."
                </p>
              </div>
            </section>

            {/* Terms and Privacy Section */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-holiday-red mb-4">
                3. Terms of Service & Privacy Policy
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mono text-sm mb-2">
                    <strong>Terms of Service:</strong>{" "}
                    <a
                      href="/terms"
                      className="text-holiday-red hover:underline"
                    >
                      https://www.santa-tour.com/terms
                    </a>
                  </p>
                  <p className="text-xs text-gray-600">
                    Includes SMS notification terms, opt-out instructions, and message frequency disclosure.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-mono text-sm mb-2">
                    <strong>Privacy Policy:</strong>{" "}
                    <a
                      href="/privacy"
                      className="text-holiday-red hover:underline"
                    >
                      https://www.santa-tour.com/privacy
                    </a>
                  </p>
                  <p className="text-xs text-gray-600">
                    Includes data collection practices, SMS notification details, and user rights.
                  </p>
                </div>
              </div>
            </section>

            {/* Opt-Out Instructions Section */}
            <section className="border-b border-gray-200 pb-6">
              <h2 className="text-2xl font-bold text-holiday-red mb-4">
                4. Opt-Out Instructions
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  Users can opt out at any time by:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                  <li>Replying <strong>STOP</strong> to any SMS message</li>
                  <li>Replying <strong>HELP</strong> for assistance</li>
                </ul>
                <p className="text-xs text-gray-600 mt-3">
                  These instructions are clearly displayed in the consent text on the signup form
                  and are included in all SMS messages sent to users.
                </p>
              </div>
            </section>

            {/* Message Flow Section */}
            <section>
              <h2 className="text-2xl font-bold text-holiday-red mb-4">
                5. Message Flow Summary
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>How Users Opt In:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                  <li>User receives a unique signup link for their neighborhood tour</li>
                  <li>User visits the signup page (e.g., /signup/[tourCode])</li>
                  <li>User fills out family information form</li>
                  <li>User checks the SMS opt-in checkbox</li>
                  <li>User provides primary phone number (required when opt-in is checked)</li>
                  <li>User optionally provides secondary phone number</li>
                  <li>User reads and acknowledges the consent text with all required disclosures</li>
                  <li>User submits the form, completing the opt-in process</li>
                </ol>
                <p className="text-xs text-gray-600 mt-4">
                  <strong>Message Frequency:</strong> Users receive 3-5 SMS messages on the day
                  of the Santa Tour only, including schedule updates and estimated arrival times.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-holiday-red mb-4">
                Contact Information
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  For questions about this implementation, please contact:
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <a
                    href="mailto:support@santa-tour.com"
                    className="text-holiday-red hover:underline font-semibold"
                  >
                    support@santa-tour.com
                  </a>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/signup/demo"
              className="text-holiday-red hover:underline font-semibold"
            >
              View Demo Signup Form →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

